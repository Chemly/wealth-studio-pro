# Wealth Studio Pro

A full-featured personal finance suite with live ETF data via Finnhub.

## Deploy to Vercel (recommended — free, ~2 minutes)

1. Go to [vercel.com](https://vercel.com) and sign up / log in
2. Click **"Add New Project"**
3. Click **"Upload"** (you don't need GitHub)
4. Drag and drop the entire `wealth-studio` folder
5. Click **Deploy**
6. Done — you'll get a live URL like `wealth-studio-pro.vercel.app`

## Deploy to Netlify (alternative — also free)

1. Go to [netlify.com](https://netlify.com) and sign up / log in
2. Drag the entire `wealth-studio` folder onto the Netlify dashboard
3. Netlify auto-detects Vite and builds it
4. Done — live URL in ~60 seconds

## Run locally

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Build for production

```bash
npm install
npm run build
# Output is in /dist — upload this folder anywhere
```

## Features

- 12 modules: ETF Simulator, DCA Engine, Monte Carlo, Budget, Net Worth, FIRE Planner, Tax, Rebalancer, Crash Sim, Loans, Income Streams, Dashboard
- Live ETF prices via Finnhub (refreshes every 30s)
- 22 ETFs tracked
- 7 currencies
- Fully responsive — desktop + mobile
