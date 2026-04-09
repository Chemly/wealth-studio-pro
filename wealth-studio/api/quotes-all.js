// /api/quotes-all.js
// Fetches ALL tickers (US via Finnhub + ASX via Yahoo) server-side in one request
// Vercel caches the response for 60 seconds — app gets instant data on load

const FINNHUB_KEY = "d7bfuv1r01qgc9t794mgd7bfuv1r01qgc9t794n0";

const US_TICKERS = [
  "SPY","VOO","IVV","VTI","IWM",
  "QQQ","QQQM","XLK","VGT","ARKK",
  "SCHD","VIG","VYM","JEPI","JEPQ",
  "XLV","XLF","XLE","XLI","VNQ",
  "VEU","VT","ACWI","EFA","VWO","EEM",
  "BND","TLT","SHY","GLD","IAU","SLV",
  "ICLN","LIT","AIQ",
];

const ASX_TICKERS = {
  "VAS":"VAS.AX","A200":"A200.AX","IOZ":"IOZ.AX","STW":"STW.AX","MVW":"MVW.AX","VSO":"VSO.AX",
  "NDQ":"NDQ.AX","IOO":"IOO.AX","VGS":"VGS.AX","BGBL":"BGBL.AX","QUAL":"QUAL.AX","MOAT":"MOAT.AX",
  "DHHF":"DHHF.AX","VDHG":"VDHG.AX","VDGR":"VDGR.AX","VDBA":"VDBA.AX",
  "VHY":"VHY.AX","SYI":"SYI.AX","MVB":"MVB.AX",
  "AAA":"AAA.AX","BILL":"BILL.AX","VAF":"VAF.AX","VIF":"VIF.AX",
  "HACK":"HACK.AX","ROBO":"ROBO.AX","CLDD":"CLDD.AX","ETHI":"ETHI.AX",
  "ATEC":"ATEC.AX","OZR":"OZR.AX","DRUG":"DRUG.AX",
  "GOLD":"GOLD.AX","PMGOLD":"PMGOLD.AX",
};

const delay = (ms) => new Promise(r => setTimeout(r, ms));

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  // Cache for 55 seconds on Vercel CDN — instant response for all users
  res.setHeader("Cache-Control", "s-maxage=55, stale-while-revalidate=30");

  const results = {};

  // Fetch US tickers from Finnhub — batched 5 at a time
  for (let i = 0; i < US_TICKERS.length; i += 5) {
    const batch = US_TICKERS.slice(i, i + 5);
    await Promise.all(batch.map(async (ticker) => {
      try {
        const r = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`,
          { headers: { "User-Agent": "Mozilla/5.0" } }
        );
        if (!r.ok) return;
        const d = await r.json();
        if (d && d.c && d.c > 0) {
          results[ticker] = { price: d.c, change: d.d ?? 0, changePct: d.dp ?? 0, prevClose: d.pc };
        }
      } catch {}
    }));
    if (i + 5 < US_TICKERS.length) await delay(1200);
  }

  // Fetch ASX tickers from Yahoo Finance
  await Promise.all(Object.entries(ASX_TICKERS).map(async ([ticker, symbol]) => {
    try {
      const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
      const r = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
      });
      if (!r.ok) return;
      const data = await r.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (!meta || !meta.regularMarketPrice) return;

      const price = meta.regularMarketPrice;
      const prevClose = meta.chartPreviousClose || meta.previousClose;
      const changePct = meta.regularMarketChangePercent ?? (prevClose ? ((price - prevClose) / prevClose) * 100 : 0);
      const change = meta.regularMarketChange ?? (prevClose ? price - prevClose : 0);

      results[ticker] = { price, change, changePct, prevClose };
    } catch {}
  }));

  return res.json({
    quotes: results,
    timestamp: Date.now(),
    count: Object.keys(results).length,
  });
}
