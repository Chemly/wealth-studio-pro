// /api/quotes-all.js
// Fetches ALL tickers via Yahoo Finance — no Finnhub, no rate limits
// Vercel caches the response for 55 seconds — instant for all users

const US_TICKERS = [
  "SPY", "VOO", "IVV", "VTI", "IWM",
  "QQQ", "QQQM", "XLK", "VGT", "ARKK",
  "SCHD", "VIG", "VYM", "JEPI", "JEPQ",
  "XLV", "XLF", "XLE", "XLI", "VNQ",
  "VEU", "VT", "ACWI", "EFA", "VWO", "EEM",
  "BND", "TLT", "SHY", "GLD", "IAU", "SLV",
  "ICLN", "LIT", "AIQ",
];

const ASX_TICKERS = {
  VAS: "VAS.AX", A200: "A200.AX", IOZ: "IOZ.AX", STW: "STW.AX", MVW: "MVW.AX", VSO: "VSO.AX",
  NDQ: "NDQ.AX", IOO: "IOO.AX", VGS: "VGS.AX", BGBL: "BGBL.AX", QUAL: "QUAL.AX", MOAT: "MOAT.AX",
  DHHF: "DHHF.AX", VDHG: "VDHG.AX", VDGR: "VDGR.AX", VDBA: "VDBA.AX",
  VHY: "VHY.AX", SYI: "SYI.AX", MVB: "MVB.AX",
  AAA: "AAA.AX", BILL: "BILL.AX", VAF: "VAF.AX", VIF: "VIF.AX",
  HACK: "HACK.AX", ROBO: "ROBO.AX", CLDD: "CLDD.AX", ETHI: "ETHI.AX",
  ATEC: "ATEC.AX", OZR: "OZR.AX", DRUG: "DRUG.AX",
  GOLD: "GOLD.AX", PMGOLD: "PMGOLD.AX",
};

/** Previous session close: prefer regularMarketPreviousClose; repair bad Yahoo meta with daily closes. */
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

  const results = {};

  const fetchWithTimeout = async (url, options = {}, ms = 8000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };

  const ALL_TICKERS = {
    ...ASX_TICKERS,
    ...Object.fromEntries(US_TICKERS.map((t) => [t, t])),
  };

  await Promise.all(
    Object.entries(ALL_TICKERS).map(async ([ticker, symbol]) => {
      try {
        const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
        const r = await fetchWithTimeout(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "application/json",
          },
        });
        if (!r.ok) return;
        const data = await r.json();
        const chartResult = data?.chart?.result?.[0];
        const meta = chartResult?.meta;
        if (!meta || !meta.regularMarketPrice) return;

        const price = meta.regularMarketPrice;
        const prevClose = resolvePrevClose(meta, chartResult, price);
        const change = prevClose ? price - prevClose : 0;
        const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

        results[ticker] = { price, change, changePct, prevClose };
      } catch {}
    })
  );

  return res.json({
    quotes: results,
    timestamp: Date.now(),
    count: Object.keys(results).length,
  });
}
