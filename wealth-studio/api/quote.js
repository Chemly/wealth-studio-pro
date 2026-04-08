export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: "symbol required" });

  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
    });

    if (!response.ok) return res.status(502).json({ error: "upstream failed" });

    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;

    if (!meta) return res.status(404).json({ error: "no data" });

    return res.json({
      symbol: meta.symbol,
      price: meta.regularMarketPrice,
      previousClose: meta.previousClose || meta.chartPreviousClose,
      changePct: meta.previousClose
        ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
        : 0,
      change: meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose || meta.regularMarketPrice),
      currency: meta.currency,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
