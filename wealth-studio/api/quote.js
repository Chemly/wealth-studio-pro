// /api/quote.js — single-symbol Yahoo proxy (used as fallback from App.jsx)

function resolvePrevClose(meta, chartResult, price) {
  const fromSeries = () => {
    const closes = chartResult?.indicators?.quote?.[0]?.close?.filter(
      (c) => c != null && Number.isFinite(c) && c > 0
    );
    if (!closes || closes.length < 2) return null;
    return closes[closes.length - 2];
  };

  let prev =
    meta.regularMarketPreviousClose ??
    meta.previousClose ??
    null;

  if (prev && price > 0) {
    const ratio = price / prev;
    if (ratio < 0.45 || ratio > 2.2) prev = null;
  }

  if (!prev || !(prev > 0)) {
    prev = fromSeries() ?? meta.chartPreviousClose ?? meta.previousClose ?? null;
  }

  return prev;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "public, s-maxage=55, max-age=0, must-revalidate");

  const raw = req.query?.symbol;
  const symbol = typeof raw === "string" ? raw.trim() : "";
  if (!symbol) {
    return res.status(400).json({ error: "missing symbol" });
  }

  const fetchWithTimeout = async (url, options = {}, ms = 8000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
    const r = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    });
    if (!r.ok) return res.status(r.status).json({ error: "upstream error" });

    const data = await r.json();
    const chartResult = data?.chart?.result?.[0];
    const meta = chartResult?.meta;
    if (!meta?.regularMarketPrice) {
      return res.status(404).json({ error: "no quote" });
    }

    const price = meta.regularMarketPrice;
    const previousClose = resolvePrevClose(meta, chartResult, price);
    const change = previousClose ? price - previousClose : 0;
    const changePct = previousClose ? ((price - previousClose) / previousClose) * 100 : 0;

    return res.json({
      symbol,
      price,
      change,
      changePct,
      previousClose,
    });
  } catch {
    return res.status(500).json({ error: "fetch failed" });
  }
}
