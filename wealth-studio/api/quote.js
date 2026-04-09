export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: "symbol required" });

  try {
    // Use 5d range so we always have previousClose available
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) return res.status(502).json({ error: `upstream ${response.status}` });

    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;

    if (!meta) return res.status(404).json({ error: "no data for " + symbol });

    const price = meta.regularMarketPrice;
    // Use regularMarketPreviousClose for accurate daily % change
    const prevClose = meta.regularMarketPreviousClose || meta.chartPreviousClose || meta.previousClose;

    const changePct = (price && prevClose) ? ((price - prevClose) / prevClose) * 100 : 0;
    const change = (price && prevClose) ? price - prevClose : 0;

    return res.json({
      symbol: meta.symbol,
      price,
      previousClose: prevClose,
      changePct,
      change,
      currency: meta.currency,
      exchange: meta.exchangeName,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
