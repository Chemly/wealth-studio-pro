import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const ETFs = [
  { ticker:"QQQ",  name:"Nasdaq 100",              avgReturn:17.9, vol:22.1, sharpe:0.81, color:"#00FF87", region:"US Tech",      risk:"High",     expense:0.20, inception:1999, div:0.6  },
  { ticker:"NDQ",  name:"Nasdaq 100 (ASX)",         avgReturn:18.2, vol:22.4, sharpe:0.82, color:"#00E87C", region:"US Tech",      risk:"High",     expense:0.22, inception:2015, div:0.5  },
  { ticker:"VOO",  name:"S&P 500 Vanguard",         avgReturn:13.0, vol:15.2, sharpe:0.85, color:"#60EFFF", region:"US Broad",     risk:"Med-High", expense:0.03, inception:2010, div:1.4  },
  { ticker:"IVV",  name:"S&P 500 iShares",          avgReturn:13.1, vol:15.3, sharpe:0.86, color:"#45E0F0", region:"US Broad",     risk:"Med-High", expense:0.03, inception:2000, div:1.3  },
  { ticker:"VTI",  name:"Total US Market",          avgReturn:12.7, vol:15.0, sharpe:0.84, color:"#38BDF8", region:"US Broad",     risk:"Med-High", expense:0.03, inception:2001, div:1.5  },
  { ticker:"IOO",  name:"Global 100",               avgReturn:12.4, vol:14.8, sharpe:0.83, color:"#A78BFA", region:"Global",       risk:"Med-High", expense:0.40, inception:2000, div:1.8  },
  { ticker:"VGS",  name:"MSCI World",               avgReturn:11.8, vol:13.9, sharpe:0.84, color:"#818CF8", region:"Global",       risk:"Medium",   expense:0.18, inception:2014, div:2.1  },
  { ticker:"DHHF", name:"Diversified All Growth",   avgReturn:11.1, vol:14.2, sharpe:0.78, color:"#F472B6", region:"Diversified",  risk:"Med-High", expense:0.19, inception:2020, div:1.6  },
  { ticker:"VDHG", name:"Diversified High Growth",  avgReturn:10.2, vol:12.8, sharpe:0.79, color:"#FB7185", region:"Diversified",  risk:"Medium",   expense:0.27, inception:2017, div:2.0  },
  { ticker:"VAS",  name:"ASX 300",                  avgReturn:9.6,  vol:13.1, sharpe:0.73, color:"#FBBF24", region:"Australia",    risk:"Medium",   expense:0.07, inception:2009, div:4.2  },
  { ticker:"A200", name:"ASX 200",                  avgReturn:9.4,  vol:12.9, sharpe:0.72, color:"#F59E0B", region:"Australia",    risk:"Medium",   expense:0.04, inception:2018, div:4.0  },
  { ticker:"VEU",  name:"All World ex-US",          avgReturn:7.9,  vol:13.5, sharpe:0.58, color:"#34D399", region:"ex-US",        risk:"Medium",   expense:0.07, inception:2007, div:2.8  },
  { ticker:"VHY",  name:"High Yield AUS",           avgReturn:8.1,  vol:11.2, sharpe:0.72, color:"#6EE7B7", region:"Dividend",     risk:"Med-Low",  expense:0.25, inception:2011, div:5.8  },
  { ticker:"VGE",  name:"Emerging Markets",         avgReturn:8.4,  vol:19.1, sharpe:0.44, color:"#FCA5A5", region:"Emerging",     risk:"High",     expense:0.48, inception:2013, div:2.3  },
  { ticker:"BOND", name:"Aggregate Bond",           avgReturn:4.2,  vol:5.8,  sharpe:0.72, color:"#94A3B8", region:"Fixed Income", risk:"Low",      expense:0.05, inception:2003, div:3.5  },
  { ticker:"GLD",  name:"Gold ETF",                 avgReturn:8.9,  vol:15.4, sharpe:0.57, color:"#FDE68A", region:"Commodities",  risk:"Medium",   expense:0.40, inception:2004, div:0.0  },
  { ticker:"ARKK", name:"ARK Innovation",           avgReturn:14.1, vol:55.2, sharpe:0.25, color:"#FF6B6B", region:"Disruptive",   risk:"Very High",expense:0.75, inception:2014, div:0.0  },
  { ticker:"VNQ",  name:"Real Estate REIT",         avgReturn:9.1,  vol:16.8, sharpe:0.54, color:"#C4B5FD", region:"Real Estate",  risk:"Medium",   expense:0.12, inception:2004, div:3.8  },
  { ticker:"SCHD", name:"Dividend Growth",          avgReturn:11.2, vol:14.1, sharpe:0.79, color:"#86EFAC", region:"Dividend",     risk:"Medium",   expense:0.06, inception:2011, div:3.5  },
  { ticker:"VIG",  name:"Dividend Appreciation",   avgReturn:10.8, vol:13.2, sharpe:0.82, color:"#4ADE80", region:"Dividend",     risk:"Medium",   expense:0.06, inception:2006, div:1.8  },
  { ticker:"HACK", name:"Cybersecurity",            avgReturn:12.6, vol:20.8, sharpe:0.60, color:"#F0ABFC", region:"Sector",       risk:"High",     expense:0.60, inception:2015, div:0.2  },
  { ticker:"ROBO", name:"Robotics & AI",            avgReturn:13.1, vol:21.4, sharpe:0.61, color:"#E879F9", region:"Sector",       risk:"High",     expense:0.95, inception:2013, div:0.1  },
];

const EXPENSE_CATS = ["Housing","Food","Transport","Subscriptions","Entertainment","Health","Education","Clothing","Personal Care","Dining Out","Travel","Insurance","Utilities","Savings/Invest","Other"];
const CAT_COLORS = { Housing:"#60EFFF",Food:"#00FF87",Transport:"#A78BFA",Subscriptions:"#FB7185",Entertainment:"#FBBF24",Health:"#34D399",Education:"#818CF8",Clothing:"#F472B6","Personal Care":"#6EE7B7","Dining Out":"#FCA5A5",Travel:"#FDE68A",Insurance:"#94A3B8",Utilities:"#C4B5FD","Savings/Invest":"#00FF87",Other:"#64748B" };
const CURRENCIES = { USD:{sym:"$",rate:1}, AUD:{sym:"A$",rate:1.53}, GBP:{sym:"£",rate:0.79}, EUR:{sym:"€",rate:0.92}, CAD:{sym:"C$",rate:1.36}, JPY:{sym:"¥",rate:149}, SGD:{sym:"S$",rate:1.34} };

function fmt(n, sym="$") {
  const a=Math.abs(n); const s=n<0?"-":"";
  if(a>=1e9) return `${s}${sym}${(a/1e9).toFixed(2)}B`;
  if(a>=1e6) return `${s}${sym}${(a/1e6).toFixed(2)}M`;
  if(a>=1e3) return `${s}${sym}${(a/1e3).toFixed(1)}K`;
  return `${s}${sym}${Math.round(a).toLocaleString()}`;
}

// Seeded random for Monte Carlo reproducibility per render
function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}
function normalRand(rand) {
  const u = rand(), v = rand();
  return Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v);
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const G = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&family=Syne:wght@400;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#020205;--s1:#06060d;--s2:#0a0a15;--s3:#0e0e1c;--s4:#131322;
  --b1:#121225;--b2:#1a1a35;--b3:#242448;
  --t1:#eef2ff;--t2:#7b85a8;--t3:#333560;
  --acc:#00FF87;--acc2:#60EFFF;--acc3:#A78BFA;--acc4:#FF4D6D;--acc5:#FFD60A;--acc6:#FF9F0A;
  --acc-dim:#00FF8720;
  --font-mono:'Share Tech Mono',monospace;
  --font-ui:'Bebas Neue',sans-serif;
  --font-body:'Syne',sans-serif;
  --mob-nav-h:60px;
}
html,body{height:100%;overflow:hidden;}
input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
input[type=number]{-moz-appearance:textfield;}
::-webkit-scrollbar{width:3px;height:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--b3);border-radius:2px;}
::-webkit-scrollbar-thumb:hover{background:#3a3a60;}

/* ── BACKGROUND */
.grid-bg{
  position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:linear-gradient(var(--b1) 1px,transparent 1px),linear-gradient(90deg,var(--b1) 1px,transparent 1px);
  background-size:50px 50px;
  mask-image:radial-gradient(ellipse 100% 60% at 50% 0%,black 0%,transparent 100%);
  opacity:0.5;
}
.content{position:relative;z-index:1;}

/* ── SCANLINE */
.scanline-fx{position:fixed;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(0,255,135,0.05),transparent);pointer-events:none;z-index:3;animation:scanfx 10s linear infinite;}
@keyframes scanfx{0%{top:-2px;}100%{top:100vh;}}

/* ── NOISE OVERLAY */
.noise-overlay{position:fixed;inset:0;z-index:2;pointer-events:none;opacity:0.02;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}

/* ── GLOWS */
.glow-g{text-shadow:0 0 16px rgba(0,255,135,0.7),0 0 40px rgba(0,255,135,0.3);}
.glow-b{text-shadow:0 0 16px rgba(96,239,255,0.7);}
.glow-p{text-shadow:0 0 16px rgba(167,139,250,0.7);}
.box-glow{box-shadow:0 0 30px rgba(0,255,135,0.12),inset 0 0 30px rgba(0,255,135,0.04);}

/* ── LOGO GLITCH */
.logo-glitch{position:relative;display:inline-block;}
.logo-glitch::before,.logo-glitch::after{content:attr(data-text);position:absolute;inset:0;font-family:var(--font-ui);}
.logo-glitch::before{color:var(--acc2);clip-path:polygon(0 0,100% 0,100% 35%,0 35%);animation:lg1 5s infinite linear;}
.logo-glitch::after{color:var(--acc4);clip-path:polygon(0 65%,100% 65%,100% 100%,0 100%);animation:lg2 5s infinite linear;}
@keyframes lg1{0%,92%,100%{transform:none;opacity:0;}93%{transform:translate(-2px,0);opacity:1;}96%{transform:translate(2px,0);opacity:1;}99%{transform:none;opacity:0;}}
@keyframes lg2{0%,92%,100%{transform:none;opacity:0;}94%{transform:translate(2px,0);opacity:1;}97%{transform:translate(-2px,0);opacity:1;}99%{transform:none;opacity:0;}}

/* ── ANIMATIONS */
.blink{animation:blink 1s step-end infinite;}
@keyframes blink{50%{opacity:0;}}
.pulse-dot{animation:pdot 2s ease-in-out infinite;}
@keyframes pdot{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.5);opacity:0.6;}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
.fade-up{animation:fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards;}
@keyframes scanline{0%{top:-20%;}100%{top:120%;}}
.scan-wrap{position:relative;overflow:hidden;}
.scan-wrap::after{content:'';position:absolute;left:0;right:0;height:60px;background:linear-gradient(transparent,rgba(0,255,135,0.04),transparent);animation:scanline 6s linear infinite;pointer-events:none;}
@keyframes ticker{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
.shimmer{background:linear-gradient(90deg,transparent 0%,rgba(0,255,135,0.06) 50%,transparent 100%);background-size:200% 100%;animation:shimmer 2s infinite;}
@keyframes pulseRing{0%,100%{box-shadow:0 0 0 0 rgba(0,255,135,0);}50%{box-shadow:0 0 0 4px rgba(0,255,135,0.08);}}
@keyframes sheen{0%,60%{left:-100%;}100%{left:200%;}}

/* ── DESKTOP TAB NAV */
.tab{background:none;border:none;cursor:pointer;font-family:var(--font-mono);font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:12px 14px;color:var(--t3);transition:all 0.2s;position:relative;white-space:nowrap;}
.tab::after{content:'';position:absolute;bottom:0;left:50%;right:50%;height:1px;background:var(--acc);transition:all 0.25s;box-shadow:0 0 8px var(--acc);}
.tab.on{color:var(--acc);}
.tab.on::after{left:8%;right:8%;}
.tab:hover{color:var(--t2);}

/* ── MOBILE BOTTOM NAV */
.mob-nav{display:none;position:fixed;bottom:0;left:0;right:0;height:var(--mob-nav-h);background:rgba(2,2,5,0.98);border-top:1px solid var(--b2);backdrop-filter:blur(20px);z-index:100;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.mob-nav::-webkit-scrollbar{display:none;}
.mob-nav-inner{display:flex;align-items:stretch;min-width:max-content;height:100%;}
.mob-tab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-width:60px;padding:0 10px;background:none;border:none;cursor:pointer;font-family:var(--font-mono);font-size:7px;letter-spacing:1px;text-transform:uppercase;color:var(--t3);transition:all 0.2s;border-top:2px solid transparent;-webkit-tap-highlight-color:transparent;}
.mob-tab.on{color:var(--acc);border-top-color:var(--acc);}
.mob-tab-icon{font-size:16px;line-height:1;}

/* ── MOBILE HEADER */
.desk-header{display:flex;}
.mob-header{display:none;align-items:center;justify-content:space-between;padding:0 16px;height:52px;}
.mob-title{font-family:var(--font-ui);font-size:18px;letter-spacing:3px;color:var(--acc);}

/* ── SUBTABS */
.subtab{background:none;border:1px solid var(--b2);border-radius:2px;cursor:pointer;font-family:var(--font-mono);font-size:8px;letter-spacing:1px;text-transform:uppercase;padding:5px 10px;color:var(--t3);transition:all 0.15s;-webkit-tap-highlight-color:transparent;}
.subtab.on{color:var(--acc);border-color:rgba(0,255,135,0.4);background:rgba(0,255,135,0.06);}
.subtab:hover{color:var(--t2);border-color:var(--b3);}

/* ── CARDS */
.card{background:var(--s2);border:1px solid var(--b1);border-radius:4px;transition:border-color 0.25s,box-shadow 0.25s;}
.card:hover{border-color:var(--b2);box-shadow:0 0 20px rgba(0,255,135,0.04);}
.card-acc{border-color:rgba(0,255,135,0.2);background:linear-gradient(135deg,var(--s2),rgba(0,255,135,0.03));}
.card-b{border-color:rgba(96,239,255,0.2);}
.card-p{border-color:rgba(167,139,250,0.2);}
.card-r{border-color:rgba(255,77,109,0.2);}
.card-y{border-color:rgba(255,214,10,0.2);}

/* ── PREMIUM STAT CARD */
.stat-card{background:var(--s2);border:1px solid var(--b1);border-radius:4px;padding:14px;position:relative;overflow:hidden;transition:border-color 0.25s,transform 0.25s;}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,currentColor,transparent);opacity:0.3;}
.stat-card:hover{border-color:var(--b2);transform:translateY(-1px);}
.stat-card-val{font-family:var(--font-ui);font-size:28px;letter-spacing:1px;line-height:1;margin-top:4px;}

/* ── INPUTS */
.ni{background:transparent;border:none;color:var(--t1);font-family:var(--font-mono);font-size:inherit;width:100%;outline:none;}
.si{background:var(--s1);border:1px solid var(--b2);border-radius:2px;color:var(--t1);font-family:var(--font-mono);font-size:10px;padding:4px 6px;outline:none;cursor:pointer;transition:border-color 0.15s;}
.si:focus{border-color:rgba(0,255,135,0.4);}
.ti{background:transparent;border:none;color:var(--t1);font-family:var(--font-mono);font-size:11px;outline:none;width:100%;}
.lbl{font-family:var(--font-mono);font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--t3);}
.lbl-b{font-family:var(--font-mono);font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--t2);}

/* ── BUTTONS */
.btn{background:none;border:1px solid var(--b2);border-radius:2px;color:var(--t3);font-family:var(--font-mono);font-size:8px;letter-spacing:2px;text-transform:uppercase;padding:6px 12px;cursor:pointer;transition:all 0.15s;-webkit-tap-highlight-color:transparent;}
.btn:hover{border-color:var(--acc);color:var(--acc);box-shadow:0 0 12px rgba(0,255,135,0.2);}
.btn-acc{border-color:rgba(0,255,135,0.4);color:var(--acc);background:rgba(0,255,135,0.06);position:relative;overflow:hidden;}
.btn-acc::before{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);animation:sheen 2.5s ease-in-out infinite;}
.btn-acc:hover{background:rgba(0,255,135,0.12);box-shadow:0 0 20px rgba(0,255,135,0.25);}
.btn-ghost{background:none;border:1px solid var(--b2);border-radius:2px;color:var(--t3);font-family:var(--font-mono);font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:7px 14px;cursor:pointer;transition:all 0.15s;}
.btn-ghost:hover{border-color:var(--acc);color:var(--acc);}
.btn-danger{background:none;border:none;color:var(--t3);cursor:pointer;font-size:14px;line-height:1;padding:0 4px;transition:color 0.15s;}
.btn-danger:hover{color:var(--acc4);}
.btn-del{background:none;border:none;color:var(--t3);cursor:pointer;font-size:13px;padding:0 3px;transition:color 0.15s;line-height:1;}
.btn-del:hover{color:var(--acc4);}
.row-h{transition:background 0.15s;}
.row-h:hover{background:var(--s3);}

/* ── PRIMARY ACTION BUTTON */
.btn-primary{display:inline-flex;align-items:center;gap:8px;background:var(--acc);color:#000;font-family:var(--font-ui);font-size:16px;letter-spacing:2px;padding:12px 28px;border:none;cursor:pointer;position:relative;overflow:hidden;transition:box-shadow 0.2s;text-decoration:none;}
.btn-primary::before{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);animation:sheen 2.5s ease-in-out infinite;}
.btn-primary:hover{box-shadow:0 0 40px rgba(0,255,135,0.5),0 0 80px rgba(0,255,135,0.2);}

/* ── RANGE */
input[type=range]{-webkit-appearance:none;width:100%;height:2px;background:var(--b2);border-radius:2px;outline:none;}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:var(--acc);cursor:pointer;box-shadow:0 0 8px var(--acc);}

/* ── TABLE */
.th{font-family:var(--font-mono);font-size:8px;color:var(--t3);letter-spacing:1px;padding:6px 8px;border-bottom:1px solid var(--b1);text-transform:uppercase;white-space:nowrap;background:var(--s1);}
.td{font-family:var(--font-mono);font-size:10px;color:var(--t2);padding:6px 8px;border-bottom:1px solid var(--b1);}
.td-acc{color:var(--acc);}
.td-b{color:var(--acc2);}
.td-r{color:var(--acc4);}
.td-y{color:var(--acc5);}

/* ── MODULE HEADER TAG */
.mod-tag{font-family:var(--font-mono);font-size:8px;letter-spacing:3px;color:var(--acc);text-transform:uppercase;display:flex;align-items:center;gap:8px;margin-bottom:4px;}
.mod-tag::before{content:'//';color:var(--b3);}
.mod-title{font-family:var(--font-ui);font-size:clamp(28px,4vw,44px);letter-spacing:2px;color:var(--t1);line-height:1;margin-bottom:16px;}

/* ── SECTION DIVIDER */
.sec-divider{height:1px;background:linear-gradient(90deg,transparent,var(--b2),transparent);margin:0;}

/* ═══════════════════════════════════════════════
   MOBILE — max-width 768px
   ═══════════════════════════════════════════════ */
@media (max-width:768px){
  .mob-nav{display:block;}
  .desk-header{display:none !important;}
  .mob-header{display:flex !important;}
  .mob-content{padding-bottom:calc(var(--mob-nav-h) + 8px) !important;}
  .rg-2,.rg-3,.rg-4,.rg-5{grid-template-columns:1fr !important;}
  .rg-2-mob{grid-template-columns:1fr 1fr !important;}
  .panel-split{grid-template-columns:1fr !important;}
  .etf-layout{grid-template-columns:1fr !important;height:auto !important;}
  .etf-picker{border-right:none !important;border-bottom:1px solid var(--b1);max-height:280px;}
  .side-layout{grid-template-columns:1fr !important;}
  .table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
  .subtab{padding:8px 12px;font-size:9px;}
  .btn,.btn-ghost{padding:9px 14px;font-size:9px;}
  .si{padding:7px 9px;font-size:12px;}
  input[type=range]::-webkit-slider-thumb{width:20px;height:20px;}
  .card{border-radius:6px;}
  .mob-pad{padding:14px !important;}
  .lbl{font-size:9px;letter-spacing:1.5px;}
  .td{font-size:11px;padding:7px 8px;}
  .th{font-size:9px;padding:7px 8px;}
  .ticker-wrap{display:none;}
  .subtab-row{flex-wrap:wrap;gap:5px !important;}
  .stat-val{font-size:22px !important;}
  .mob-full{width:100% !important;}
  .hide-mob{display:none !important;}
  .desk-footer{display:none;}
  .scanline-fx{display:none;}
}

/* ═══════════════════════════════════════════════
   TABLET — 769px to 1024px
   ═══════════════════════════════════════════════ */
@media (min-width:769px) and (max-width:1024px){
  .rg-5{grid-template-columns:repeat(3,1fr) !important;}
  .rg-4{grid-template-columns:repeat(2,1fr) !important;}
  .tab{padding:10px 11px;font-size:8px;}
}

/* ── ETF LAYOUT */
.mob-scroll{-webkit-overflow-scrolling:touch;}
@media (max-width:768px){
  .etf-layout{display:flex !important;flex-direction:column !important;height:auto !important;overflow-y:auto !important;}
  .etf-picker{max-height:260px;overflow-y:auto;}
  .mob-scroll{height:auto !important;padding-bottom:80px !important;}
  .dash-modules{grid-template-columns:repeat(2,1fr) !important;}
  .heat-grid{grid-template-columns:repeat(2,1fr) !important;}
  .rg-5{grid-template-columns:repeat(2,1fr) !important;}
  .rg-4{grid-template-columns:repeat(2,1fr) !important;}
  .rg-3{grid-template-columns:repeat(2,1fr) !important;}
  .side-layout{flex-direction:column !important;}
  .module-content{overflow-y:auto !important;-webkit-overflow-scrolling:touch;}
}
`;

// ─── LIVE DATA CONTEXT ───────────────────────────────────────────────────────
// Finnhub free tier: 60 calls/min, real-time US quotes, CORS-enabled
// Get a free key at https://finnhub.io (takes 30 seconds)

const LiveCtx = React.createContext({ quotes: {}, status: "idle", apiKey: "", setApiKey: () => {} });

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const LIVE_TICKERS = ["QQQ","VOO","IVV","VTI","IOO","VGS","VDHG","VAS","A200","VEU","VHY","VGE","BND","GLD","ARKK","VNQ","SCHD","VIG"];

function useLiveData(apiKey) {
  const [quotes, setQuotes] = useState({});
  const [status, setStatus] = useState("idle");
  const intervalRef = useRef(null);

  const fetchAll = useCallback(async (key) => {
    if (!key || key.trim().length < 8) return;
    setStatus("loading");
    const results = {};
    try {
      await Promise.all(
        LIVE_TICKERS.map(async (ticker) => {
          try {
            const res = await fetch(`${FINNHUB_BASE}/quote?symbol=${ticker}&token=${key}`);
            if (!res.ok) return;
            const d = await res.json();
            if (d && d.c && d.c > 0) {
              results[ticker] = { price: d.c, change: d.d ?? 0, changePct: d.dp ?? 0, high: d.h, low: d.l, open: d.o, prevClose: d.pc };
            }
          } catch {}
        })
      );
      if (Object.keys(results).length > 0) { setQuotes(results); setStatus("live"); }
      else setStatus("error");
    } catch { setStatus("error"); }
  }, []);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (!apiKey || apiKey.trim().length < 8) { setStatus("nokey"); setQuotes({}); return; }
    fetchAll(apiKey);
    intervalRef.current = setInterval(() => fetchAll(apiKey), 30000);
    return () => clearInterval(intervalRef.current);
  }, [apiKey, fetchAll]);

  return { quotes, status, refetch: () => fetchAll(apiKey) };
}

function LiveProvider({ children }) {
  const [apiKey, setApiKey] = useState("d76auu1r01qm4b7tjq60d76auu1r01qm4b7tjq6g");
  const { quotes, status, refetch } = useLiveData(apiKey);
  return (
    <LiveCtx.Provider value={{ quotes, status, apiKey, setApiKey, refetch }}>
      {children}
    </LiveCtx.Provider>
  );
}

function useQuote(ticker) {
  const { quotes } = React.useContext(LiveCtx);
  return quotes[ticker] ?? null;
}

// Inline API key bar — always visible below the main header
function ApiKeyBar() {
  const { apiKey, setApiKey, status, refetch } = React.useContext(LiveCtx);
  const [input, setInput] = useState("");
  const [show, setShow] = useState(false);

  // When live, show minimal status. When error, allow re-entry.
  const handleSave = () => {
    const k = input.trim();
    if (k.length > 5) { setApiKey(k); setInput(""); setShow(false); }
  };
  const handleClear = () => { setApiKey(""); setInput(""); setShow(false); };

  // If live — show a clean minimal bar. Hide the connect prompt since key is baked in.
  return (
    <div style={{ borderBottom: `1px solid ${status === "live" ? "rgba(0,255,135,0.1)" : "var(--b1)"}`, background: status === "live" ? "rgba(0,255,135,0.02)" : "var(--s1)", padding: "0 20px", display: "flex", alignItems: "center", gap: "12px", height: "30px", flexShrink: 0, transition: "all 0.3s" }} className="hide-mob">
      {status === "live" && (
        <>
          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--acc)", boxShadow: "0 0 6px var(--acc)", display: "inline-block", animation: "pdot 2s ease-in-out infinite" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--acc)", letterSpacing: "2px" }}>LIVE DATA</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)", letterSpacing: "1px" }}>Refreshes every 30s</span>
          <button onClick={refetch} style={{ background: "none", border: "1px solid var(--b2)", borderRadius: "2px", color: "var(--t3)", fontFamily: "var(--font-mono)", fontSize: "8px", padding: "2px 8px", cursor: "pointer" }}>↻ Now</button>
        </>
      )}
      {status === "loading" && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--acc5)", letterSpacing: "2px" }}>⟳ Fetching live prices…</span>
      )}
      {(status === "error" || status === "nokey") && (
        <>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--acc4)", letterSpacing: "1px" }}>⚠ Live data unavailable</span>
          {show ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
              <input autoFocus value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSave()} placeholder="Enter Finnhub API key…" style={{ flex: 1, background: "var(--s2)", border: "1px solid rgba(0,255,135,0.3)", borderRadius: "2px", color: "var(--t1)", fontFamily: "var(--font-mono)", fontSize: "10px", padding: "3px 8px", outline: "none" }} />
              <button onClick={handleSave} style={{ background: "rgba(0,255,135,0.1)", border: "1px solid rgba(0,255,135,0.3)", borderRadius: "2px", color: "var(--acc)", fontFamily: "var(--font-mono)", fontSize: "8px", padding: "3px 8px", cursor: "pointer" }}>SAVE</button>
              <button onClick={() => setShow(false)} style={{ background: "none", border: "none", color: "var(--t3)", fontFamily: "var(--font-mono)", fontSize: "8px", cursor: "pointer" }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setShow(true)} style={{ background: "none", border: "1px solid var(--b2)", borderRadius: "2px", color: "var(--t3)", fontFamily: "var(--font-mono)", fontSize: "8px", padding: "2px 8px", cursor: "pointer" }}>+ Enter Key</button>
          )}
        </>
      )}
    </div>
  );
}

function ApiKeyPanel() {
  // Kept for compatibility but now points to bar
  return null;
}

// ─── ANIMATED NUMBER ─────────────────────────────────────────────────────────

function AnimNum({ value, format = v => v, duration = 600 }) {
  const [disp, setDisp] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const start = prev.current, end = value, startT = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - startT) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisp(start + (end - start) * ease);
      if (p < 1) requestAnimationFrame(tick);
      else { setDisp(end); prev.current = end; }
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{format(disp)}</span>;
}

// ─── SPARKLINE ────────────────────────────────────────────────────────────────

function Spark({ data, color = "#00FF87", h = 32, w = 80 }) {
  if (!data?.length) return null;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs><linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sg${color.replace("#","")})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2"/>
    </svg>
  );
}

// ─── MINI DONUT ───────────────────────────────────────────────────────────────

function MiniDonut({ data, size = 60 }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  let cum = -Math.PI / 2;
  const R = size / 2 - 4, cx = size / 2, cy = size / 2;
  return (
    <svg width={size} height={size}>
      {data.filter(d => d.value > 0).map((d, i) => {
        const angle = (d.value / total) * 2 * Math.PI;
        const x1 = cx + R * Math.cos(cum), y1 = cy + R * Math.sin(cum);
        cum += angle;
        const x2 = cx + R * Math.cos(cum), y2 = cy + R * Math.sin(cum);
        return <path key={i} d={`M${cx} ${cy} L${x1} ${y1} A${R} ${R} 0 ${angle > Math.PI ? 1 : 0} 1 ${x2} ${y2}Z`} fill={d.color} opacity="0.85" />;
      })}
      <circle cx={cx} cy={cy} r={R * 0.5} fill="var(--s2)" />
    </svg>
  );
}

// ─── TICKER BAR ───────────────────────────────────────────────────────────────

function TickerBar({ currency }) {
  const { quotes, status } = React.useContext(LiveCtx);
  const isLive = status === "live" && Object.keys(quotes).length > 0;
  const items = [...ETFs, ...ETFs];

  return (
    <div style={{ overflow: "hidden", borderBottom: "1px solid var(--b1)", background: "var(--s1)", height: "26px", display: "flex", alignItems: "center", flexShrink: 0 }}>
      {isLive && (
        <div style={{ flexShrink: 0, padding: "0 10px", borderRight: "1px solid var(--b1)", fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--acc)", letterSpacing: "1px" }}>
          ● LIVE
        </div>
      )}
      <div style={{ display: "flex", animation: `ticker ${isLive ? 70 : 80}s linear infinite`, whiteSpace: "nowrap", willChange: "transform", overflow: "hidden" }}>
        {items.map((e, i) => {
          const q = quotes[e.ticker];
          const delta = q ? q.changePct : ((Math.sin(i * 2.3 + 1.1) + 1) * 2 - 1.5);
          const price = q ? q.price : null;
          const up = delta >= 0;
          return (
            <span key={i} style={{ fontFamily: "var(--font-mono)", fontSize: "9px", padding: "0 14px", borderRight: "1px solid var(--b1)", color: up ? "var(--acc)" : "var(--acc4)" }}>
              <span style={{ color: "var(--t3)" }}>{e.ticker} </span>
              {price && <span style={{ color: "var(--t2)" }}>${price.toFixed(2)} </span>}
              <span>{up ? "▲" : "▼"}{Math.abs(delta).toFixed(2)}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function Dashboard({ onNav, currency }) {
  const sym = CURRENCIES[currency]?.sym ?? "$";
  const { quotes, status } = React.useContext(LiveCtx);
  const isLive = status === "live";
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const sparkData = useMemo(() => {
    const d = [10000];
    for (let i = 1; i < 24; i++) d.push(d[i - 1] * (1 + (Math.random() * 0.04 - 0.005)));
    return d;
  }, []);

  const marketData = ETFs.slice(0, 10).map((e, i) => {
    const q = quotes[e.ticker];
    return {
      ...e,
      livePrice: q?.price ?? null,
      today: q ? q.changePct.toFixed(2) : ((Math.sin(i * 1.7 + 2) + 1) * 2 - 1.2).toFixed(2),
      spark: Array.from({ length: 12 }, (_, j) => e.avgReturn + Math.sin(j * 0.8 + i) * 3),
      isLive: !!q,
    };
  });

  const modules = [
    { id: "etf", label: "ETF Simulator", desc: "Build & project portfolios across 22 ETFs. Scenarios, confidence bands, fee impact.", icon: "◈", color: "var(--acc)" },
    { id: "dca", label: "DCA Engine", desc: "Dollar-cost averaging simulator with lump sum comparison and timing analysis.", icon: "⟳", color: "var(--acc2)" },
    { id: "monte", label: "Monte Carlo", desc: "10,000 simulation paths. Probability of success, percentile outcomes, risk of ruin.", icon: "⊞", color: "var(--acc3)" },
    { id: "budget", label: "Budget Tracker", desc: "Income vs expenses, 50/30/20 analysis, health score, surplus forecasting.", icon: "≡", color: "var(--acc5)" },
    { id: "networth", label: "Net Worth", desc: "Full asset & liability tracker with payoff calc and net worth trend.", icon: "◎", color: "var(--acc6)" },
    { id: "fire", label: "FIRE Planner", desc: "Financial independence calculator, Coast FIRE, SWR analysis, retirement scenarios.", icon: "⬡", color: "var(--acc4)" },
    { id: "tax", label: "Tax & Returns", desc: "After-tax return modelling, capital gains, dividend tax drag, franking credits.", icon: "∑", color: "#86EFAC" },
    { id: "rebalance", label: "Rebalancer", desc: "Portfolio drift calculator, rebalancing triggers, buy/sell order generator.", icon: "⇌", color: "#F0ABFC" },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px" }} className="fade-up">
      {/* Hero stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", className: "rg-5", gap: "10px", marginBottom: "16px" }}>
        {[
          { l: "Market Avg Return", v: "12.8%", sub: "Blended across all ETFs", c: "var(--acc)", spark: Array.from({length:16},(_,i)=>12+Math.sin(i*0.9)*2) },
          { l: "Best Performer", v: "NDQ +18.2%", sub: "Highest historical avg", c: "var(--acc2)", spark: Array.from({length:16},(_,i)=>15+Math.sin(i*1.2)*4) },
          { l: "Lowest Fee ETF", v: "0.03% MER", sub: "VOO / IVV / VTI", c: "var(--acc5)", spark: Array.from({length:16},(_,i)=>0.03+Math.sin(i*0.5)*0.01) },
          { l: "Sharpe Champion", v: "IVV 0.86", sub: "Best risk-adj return", c: "var(--acc3)", spark: Array.from({length:16},(_,i)=>0.8+Math.sin(i*0.7)*0.1) },
          { l: "Current Time", v: time.toLocaleTimeString(), sub: time.toLocaleDateString(), c: "var(--t1)", blink: true },
        ].map(({ l, v, sub, c, spark: sp, blink }) => (
          <div key={l} className="card scan-wrap" style={{ padding: "14px", borderColor: c === "var(--t1)" ? "var(--b1)" : `${c}25` }}>
            <div className="lbl" style={{ marginBottom: "6px" }}>{l}</div>
            <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "18px", color: c }} className={blink ? "blink" : ""}>{v}</div>
            {sp && <div style={{ marginTop: "6px" }}><Spark data={sp} color={c} h={24} w={80} /></div>}
            {!sp && <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)", marginTop: "4px" }}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Module grid */}
      <div style={{ marginBottom: "16px" }}>
        <div className="lbl" style={{ marginBottom: "10px" }}>── Modules</div>
        <div className="rg-4" className="rg-4 dash-modules" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
          {modules.map(m => (
            <button key={m.id} onClick={() => onNav(m.id)} style={{ background: "var(--s2)", border: `1px solid var(--b1)`, borderRadius: "4px", padding: "14px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = m.color + "50"; e.currentTarget.style.background = "var(--s3)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--b1)"; e.currentTarget.style.background = "var(--s2)"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "16px", color: m.color }}>{m.icon}</span>
                <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "13px", color: "var(--t1)" }}>{m.label}</span>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)", lineHeight: 1.5 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Market overview */}
      <div className="card" style={{ padding: "14px" }}>
        <div className="lbl" style={{ marginBottom: "10px" }}>── Live Market Overview</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", className: "rg-5", gap: "6px" }}>
          {marketData.map(e => {
            const up = parseFloat(e.today) >= 0;
            return (
              <div key={e.ticker} className="card" style={{ padding: "10px", background: "var(--s3)", borderColor: up ? "#00FF8715" : "#FF4D6D15" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: e.color }}>{e.ticker}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: up ? "var(--acc)" : "var(--acc4)" }}>{up ? "+" : ""}{e.today}%</span>
                </div>
                {e.livePrice && (
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--t1)", marginBottom: "3px", fontWeight: 600 }}>
                    ${e.livePrice.toFixed(2)}
                  </div>
                )}
                <Spark data={e.spark} color={up ? "#00FF87" : "#FF4D6D"} h={28} w={80} />
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)", marginTop: "3px" }}>
                  {e.isLive ? <span style={{ color: "var(--acc)" }}>● live</span> : `${e.avgReturn}% hist avg`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ETF MODULE ───────────────────────────────────────────────────────────────

function ETFModule({ currency }) {
  const sym = CURRENCIES[currency]?.sym ?? "$";
  const { quotes } = React.useContext(LiveCtx);
  const [sel, setSel] = useState({ QQQ: 40, VOO: 35, VGS: 25 });
  const [start, setStart] = useState(10000);
  const [monthly, setMonthly] = useState(1000);
  const [years, setYears] = useState(25);
  const [sub, setSub] = useState("portfolio");
  const [scenario, setScenario] = useState("base");
  const [cmpA, setCmpA] = useState("QQQ");
  const [cmpB, setCmpB] = useState("VOO");
  const [search, setSearch] = useState("");

  const SCEN = { base: 1, bull: 1.35, bear: 0.6, crash: 0.35, stagflation: 0.5 };
  const scMult = SCEN[scenario];

  const totalAlloc = useMemo(() => Object.values(sel).reduce((a, b) => a + b, 0), [sel]);
  const blended = useMemo(() => !totalAlloc ? 0 : Object.entries(sel).reduce((acc, [t, p]) => { const e = ETFs.find(x => x.ticker === t); return acc + (e ? e.avgReturn * (p / 100) * scMult : 0); }, 0), [sel, totalAlloc, scMult]);
  const blendedVol = useMemo(() => !totalAlloc ? 0 : Object.entries(sel).reduce((acc, [t, p]) => { const e = ETFs.find(x => x.ticker === t); return acc + (e ? e.vol * (p / 100) : 0); }, 0), [sel, totalAlloc]);
  const blendedExp = useMemo(() => !totalAlloc ? 0 : Object.entries(sel).reduce((acc, [t, p]) => { const e = ETFs.find(x => x.ticker === t); return acc + (e ? e.expense * (p / 100) : 0); }, 0), [sel, totalAlloc]);
  const blendedDiv = useMemo(() => !totalAlloc ? 0 : Object.entries(sel).reduce((acc, [t, p]) => { const e = ETFs.find(x => x.ticker === t); return acc + (e ? e.div * (p / 100) : 0); }, 0), [sel, totalAlloc]);

  const proj = useMemo(() => {
    const r = blended / 100 / 12;
    return Array.from({ length: years + 1 }, (_, y) => {
      const n = y * 12, r2 = r * 1.2, r3 = r * 0.7;
      const v = start * Math.pow(1 + r, n) + (r > 0 ? monthly * ((Math.pow(1 + r, n) - 1) / r) : monthly * n);
      const hi = start * Math.pow(1 + r2, n) + (r2 > 0 ? monthly * ((Math.pow(1 + r2, n) - 1) / r2) : monthly * n);
      const lo = start * Math.pow(1 + r3, n) + (r3 > 0 ? monthly * ((Math.pow(1 + r3, n) - 1) / r3) : monthly * n);
      const c = start + monthly * n;
      return { y, v, hi, lo, c };
    });
  }, [start, monthly, years, blended]);

  const final = proj[proj.length - 1] ?? { v: 0, c: 0, hi: 0, lo: 0 };
  const maxV = Math.max(...proj.map(p => p.hi), 1);
  const milestones = [10000, 50000, 100000, 250000, 500000, 1000000, 2000000, 5000000, 10000000];

  const toggle = t => setSel(p => { if (p[t] !== undefined) { const n = { ...p }; delete n[t]; return n; } return { ...p, [t]: 0 }; });
  const filtered = ETFs.filter(e => e.ticker.includes(search.toUpperCase()) || e.name.toLowerCase().includes(search.toLowerCase()) || e.region.toLowerCase().includes(search.toLowerCase()));

  const compareProj = (etf, yrs) => { const r = etf.avgReturn / 100 / 12; const n = yrs * 12; return start * Math.pow(1 + r, n) + (r > 0 ? monthly * ((Math.pow(1 + r, n) - 1) / r) : monthly * n); };

  const expDrag = useMemo(() => {
    const r0 = blended / 100 / 12, rD = (blended - blendedExp) / 100 / 12, n = years * 12;
    const v0 = start * Math.pow(1 + r0, n) + (r0 > 0 ? monthly * ((Math.pow(1 + r0, n) - 1) / r0) : monthly * n);
    const vD = start * Math.pow(1 + rD, n) + (rD > 0 ? monthly * ((Math.pow(1 + rD, n) - 1) / rD) : monthly * n);
    return v0 - vD;
  }, [blended, blendedExp, start, monthly, years]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "270px 1fr", height: "calc(100vh - 138px)", overflow: "hidden" }}>
      {/* Picker */}
      <div className="etf-picker" style={{ borderRight: "1px solid var(--b1)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "8px", borderBottom: "1px solid var(--b1)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <input className="ti" placeholder="Search ETFs..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: "6px 8px", background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: "3px", fontSize: "10px", color: "var(--t1)" }} />
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {Object.keys(SCEN).map(s => (
              <button key={s} onClick={() => setScenario(s)} className={`subtab${scenario === s ? " on" : ""}`} style={{ color: scenario === s ? { base: "var(--acc)", bull: "var(--acc)", bear: "var(--acc5)", crash: "var(--acc4)", stagflation: "var(--acc6)" }[s] : "var(--t3)" }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "4px" }}>
          {filtered.map(etf => {
            const on = sel[etf.ticker] !== undefined;
            const q = quotes[etf.ticker];
            return (
              <div key={etf.ticker} onClick={() => toggle(etf.ticker)} className="row-h"
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "7px 8px", borderRadius: "3px", cursor: "pointer", marginBottom: "1px", border: `1px solid ${on ? etf.color + "30" : "transparent"}`, background: on ? etf.color + "08" : "transparent" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: on ? etf.color : "var(--b3)", flexShrink: 0, boxShadow: on ? `0 0 6px ${etf.color}` : "" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: "5px", alignItems: "baseline" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: on ? etf.color : "var(--t2)" }}>{etf.ticker}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--t3)" }}>{etf.region}</span>
                    {q && <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--acc)", letterSpacing: "0px" }}>● live</span>}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{etf.name}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {q ? (
                    <>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--t1)", fontWeight: 600 }}>${q.price.toFixed(2)}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: q.changePct >= 0 ? "var(--acc)" : "var(--acc4)" }}>
                        {q.changePct >= 0 ? "+" : ""}{q.changePct.toFixed(2)}%
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: on ? etf.color : "var(--t3)" }}>{etf.avgReturn}%</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--t3)" }}>σ{etf.vol}%</div>
                    </>
                  )}
                </div>
                {on && <div onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: "2px", flexShrink: 0 }}>
                  <input type="number" value={sel[etf.ticker]} onChange={e => setSel(p => ({ ...p, [etf.ticker]: Math.max(0, Math.min(100, +e.target.value)) }))}
                    style={{ background: "var(--s1)", border: `1px solid ${etf.color}40`, borderRadius: "3px", color: etf.color, fontFamily: "var(--font-mono)", fontSize: "10px", padding: "2px 4px", width: "42px", textAlign: "center", outline: "none" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)" }}>%</span>
                </div>}
              </div>
            );
          })}
        </div>
        {/* Alloc */}
        <div style={{ padding: "8px 10px", borderTop: "1px solid var(--b1)", background: "var(--s1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span className="lbl">Allocated</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: totalAlloc === 100 ? "var(--acc)" : totalAlloc > 100 ? "var(--acc4)" : "var(--acc5)" }}>{totalAlloc}%</span>
          </div>
          <div style={{ height: "3px", background: "var(--b1)", borderRadius: "2px", marginBottom: "6px" }}>
            <div style={{ height: "100%", width: `${Math.min(totalAlloc, 100)}%`, background: totalAlloc === 100 ? "var(--acc)" : totalAlloc > 100 ? "var(--acc4)" : "var(--acc5)", borderRadius: "2px", transition: "width 0.3s", boxShadow: totalAlloc === 100 ? "0 0 8px var(--acc)" : "" }} />
          </div>
          {/* colour bar */}
          <div style={{ display: "flex", height: "5px", borderRadius: "3px", overflow: "hidden", gap: "1px" }}>
            {Object.entries(sel).filter(([, v]) => v > 0).map(([t, v]) => {
              const e = ETFs.find(x => x.ticker === t);
              return <div key={t} title={`${t}: ${v}%`} style={{ flex: v, background: e?.color ?? "#fff", opacity: 0.9 }} />;
            })}
          </div>
          {/* stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px", marginTop: "8px" }}>
            {[
              { l: "Return", v: `${blended.toFixed(1)}%` },
              { l: "Vol σ", v: `${blendedVol.toFixed(1)}%` },
              { l: "MER", v: `${blendedExp.toFixed(2)}%` },
            ].map(({ l, v }) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--t3)" }}>{l}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--acc)" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div className="subtab-row" style={{ display: "flex", gap: "4px", padding: "8px", borderBottom: "1px solid var(--b1)", flexWrap: "wrap" }}>
          {[["portfolio","Portfolio"],["milestones","Milestones"],["compare","Compare"],["risk","Risk"],["fees","Fee Impact"],["dividends","Dividends"]].map(([id, l]) => (
            <button key={id} className={`subtab${sub === id ? " on" : ""}`} onClick={() => setSub(id)}>{l}</button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>

          {sub === "portfolio" && (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {[
                  { l: "Starting Capital", v: start, set: setStart, pre: sym },
                  { l: "Monthly DCA", v: monthly, set: setMonthly, pre: sym },
                  { l: "Time Horizon", v: years, set: setYears, suf: "yrs" },
                  { l: "Blended Return", v: blended.toFixed(2), ro: true, suf: "% p.a.", c: "var(--acc)" },
                ].map(({ l, v, set, pre, suf, ro, c }) => (
                  <div key={l} className={`card${c ? " card-acc" : ""}`} style={{ padding: "10px 12px" }}>
                    <div className="lbl" style={{ marginBottom: "5px" }}>{l}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                      {pre && <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--t3)" }}>{pre}</span>}
                      <input className="ni" style={{ fontSize: "20px", color: c ?? "var(--t1)" }} type="number" value={v} readOnly={ro} onChange={set ? e => set(+e.target.value) : undefined} />
                      {suf && <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)" }}>{suf}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", className: "rg-5", gap: "8px" }}>
                {[
                  { l: `Value (${years}y)`, v: final.v, c: "var(--acc)" },
                  { l: "Contributed", v: final.c, c: "var(--t1)" },
                  { l: "Gains", v: final.v - final.c, c: "var(--acc2)" },
                  { l: `Multiplier`, v: null, extra: `${(final.v / (final.c || 1)).toFixed(2)}×`, c: "var(--acc3)" },
                  { l: "Annual Dividends", v: final.v * blendedDiv / 100, c: "var(--acc5)" },
                ].map(({ l, v, extra, c }) => (
                  <div key={l} className="card" style={{ padding: "10px 12px" }}>
                    <div className="lbl" style={{ marginBottom: "4px" }}>{l}</div>
                    <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "18px", color: c }}>
                      {extra ? extra : <AnimNum value={v} format={n => fmt(n, sym)} />}
                    </div>
                  </div>
                ))}
              </div>
              {/* Chart */}
              <div className="card scan-wrap" style={{ padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span className="lbl">Compound Projection — {years}yr</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)" }}>SCENARIO: <span style={{ color: "var(--acc)" }}>{scenario.toUpperCase()}</span></span>
                </div>
                <svg width="100%" height="200" viewBox={`0 0 ${years} 200`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00FF87" stopOpacity="0.22"/><stop offset="100%" stopColor="#00FF87" stopOpacity="0"/></linearGradient>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60EFFF" stopOpacity="0.10"/><stop offset="100%" stopColor="#60EFFF" stopOpacity="0"/></linearGradient>
                    <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00FF87" stopOpacity="0.05"/><stop offset="100%" stopColor="#00FF87" stopOpacity="0"/></linearGradient>
                  </defs>
                  {[0.2, 0.4, 0.6, 0.8].map(f => <line key={f} x1="0" y1={200 - f * 190} x2={years} y2={200 - f * 190} stroke="var(--b1)" strokeWidth="0.3" />)}
                  <polygon points={[`0,200`, ...proj.map(p => `${p.y},${200 - (p.hi / maxV) * 185}`), ...proj.slice().reverse().map(p => `${p.y},${200 - (p.lo / maxV) * 185}`)].join(" ")} fill="url(#bg2)" />
                  <polyline points={proj.map(p => `${p.y},${200 - (p.hi / maxV) * 185}`).join(" ")} fill="none" stroke="#00FF87" strokeWidth="0.5" strokeDasharray="2,4" opacity="0.35" />
                  <polyline points={proj.map(p => `${p.y},${200 - (p.lo / maxV) * 185}`).join(" ")} fill="none" stroke="#00FF87" strokeWidth="0.5" strokeDasharray="2,4" opacity="0.35" />
                  <polygon points={[`0,200`, ...proj.map(p => `${p.y},${200 - (p.c / maxV) * 185}`), `${years},200`].join(" ")} fill="url(#cg)" />
                  <polyline points={proj.map(p => `${p.y},${200 - (p.c / maxV) * 185}`).join(" ")} fill="none" stroke="var(--acc2)" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.6" />
                  <polygon points={[`0,200`, ...proj.map(p => `${p.y},${200 - (p.v / maxV) * 185}`), `${years},200`].join(" ")} fill="url(#pg)" />
                  <polyline points={proj.map(p => `${p.y},${200 - (p.v / maxV) * 185}`).join(" ")} fill="none" stroke="var(--acc)" strokeWidth="1.5" />
                  {proj.filter((_, i) => i % 5 === 0 && i > 0).map(p => (
                    <g key={p.y}>
                      <circle cx={p.y} cy={200 - (p.v / maxV) * 185} r="2" fill="var(--acc)" />
                      <text x={p.y} y={200 - (p.v / maxV) * 185 - 5} textAnchor="middle" fill="var(--acc)" fontFamily="var(--font-mono)" fontSize="5">{fmt(p.v, sym)}</text>
                    </g>
                  ))}
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  {proj.filter((_, i) => i % Math.ceil(years / 5) === 0).map(p => <span key={p.y} style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--t3)" }}>Yr{p.y}</span>)}
                </div>
              </div>
              {/* Year table */}
              <div className="card" style={{ padding: "12px" }}>
                <div className="lbl" style={{ marginBottom: "8px" }}>Year-by-Year Breakdown</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>{["Yr","Portfolio","Contributed","Gains","Gain%","×","Ann Growth","Ann Dividends"].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
                    <tbody>
                      {proj.filter(p => p.y > 0 && p.y % 5 === 0).map(p => {
                        const prev = proj[Math.max(p.y - 5, 0)];
                        const ag = prev.v > 0 ? ((p.v / prev.v) ** 0.2 - 1) * 100 : 0;
                        return (
                          <tr key={p.y} className="row-h">
                            <td className="td td-acc">{p.y}</td>
                            <td className="td td-acc">{fmt(p.v, sym)}</td>
                            <td className="td">{fmt(p.c, sym)}</td>
                            <td className="td td-b">{fmt(p.v - p.c, sym)}</td>
                            <td className="td td-y">{((p.v / p.c - 1) * 100).toFixed(0)}%</td>
                            <td className="td" style={{ color: "var(--acc3)" }}>{(p.v / p.c).toFixed(2)}×</td>
                            <td className="td" style={{ color: "var(--acc6)" }}>{ag.toFixed(1)}%</td>
                            <td className="td td-y">{fmt(p.v * blendedDiv / 100, sym)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {sub === "milestones" && (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {milestones.map(ms => {
                  const hit = proj.find(p => p.v >= ms);
                  return (
                    <div key={ms} className={`card${hit ? " card-acc" : ""}`} style={{ padding: "14px" }}>
                      <div className="lbl">{fmt(ms, sym)}</div>
                      <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "26px", color: hit ? "var(--acc)" : "var(--t3)", marginTop: "4px" }}>{hit ? `Yr ${Math.ceil(hit.y)}` : "—"}</div>
                      {hit && <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)", marginTop: "2px" }}>{fmt(hit.v * blendedDiv / 100, sym)}/yr dividends</div>}
                    </div>
                  );
                })}
              </div>
              <div className="card" style={{ padding: "14px" }}>
                <div className="lbl" style={{ marginBottom: "10px" }}>Retirement Income Calculator (4% SWR)</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Monthly Target", "Nest Egg Needed", "Reached Year", "Age at FIRE", "Annual Dividends"].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
                  <tbody>
                    {[1000, 2000, 3000, 5000, 7500, 10000].map(mo => {
                      const needed = mo * 12 / 0.04;
                      const hit = proj.find(p => p.v >= needed);
                      return (
                        <tr key={mo} className="row-h">
                          <td className="td td-y">{fmt(mo, sym)}/mo</td>
                          <td className="td">{fmt(needed, sym)}</td>
                          <td className="td td-acc">{hit ? `Yr ${Math.ceil(hit.y)}` : "Not reached"}</td>
                          <td className="td td-b">{hit ? `Age ${25 + Math.ceil(hit.y)}` : "—"}</td>
                          <td className="td" style={{ color: "var(--acc5)" }}>{hit ? fmt(needed * blendedDiv / 100, sym) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {sub === "compare" && (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {[["A", cmpA, setCmpA, "var(--acc)"], ["B", cmpB, setCmpB, "var(--acc2)"]].map(([lbl, val, set, c]) => (
                  <div key={lbl} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: c }}>ETF {lbl}</span>
                    <select className="si" value={val} onChange={e => set(e.target.value)}>
                      {ETFs.map(e => <option key={e.ticker} value={e.ticker}>{e.ticker} — {e.name}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {[cmpA, cmpB].map((t, i) => {
                const e = ETFs.find(x => x.ticker === t);
                const c = i === 0 ? "var(--acc)" : "var(--acc2)";
                if (!e) return null;
                return (
                  <div key={t} className="card" style={{ padding: "14px", borderColor: i === 0 ? "#00FF8730" : "#60EFFF30" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: c, marginBottom: "10px" }}>{e.ticker} — {e.name}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" }}>
                      {[["Return", `${e.avgReturn}%`], ["Volatility", `${e.vol}%`], ["Sharpe", e.sharpe], ["Expense", `${e.expense}%`], ["Dividend", `${e.div}%`], ["Inception", e.inception]].map(([k, v]) => (
                        <div key={k}>
                          <div className="lbl">{k}</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: c, marginTop: "2px" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div className="card" style={{ padding: "12px" }}>
                <div className="lbl" style={{ marginBottom: "8px" }}>Head-to-Head Projections</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Year", `${cmpA} Value`, `${cmpB} Value`, "Difference", `${cmpA} leads by`].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
                  <tbody>
                    {[5, 10, 15, 20, 25, 30].map(y => {
                      const eA = ETFs.find(x => x.ticker === cmpA), eB = ETFs.find(x => x.ticker === cmpB);
                      const a = compareProj(eA, y), b = compareProj(eB, y), d = a - b;
                      return (
                        <tr key={y} className="row-h">
                          <td className="td">{y}yr</td>
                          <td className="td td-acc">{fmt(a, sym)}</td>
                          <td className="td td-b">{fmt(b, sym)}</td>
                          <td className="td" style={{ color: d >= 0 ? "var(--acc)" : "var(--acc4)" }}>{d >= 0 ? "+" : ""}{fmt(Math.abs(d), sym)}</td>
                          <td className="td" style={{ color: d >= 0 ? "var(--acc)" : "var(--acc4)" }}>{b > 0 ? ((a / b - 1) * 100).toFixed(1) : 0}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {sub === "risk" && (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {[
                  { l: "Portfolio Volatility", v: `${blendedVol.toFixed(1)}%`, c: "var(--acc5)" },
                  { l: "Blended Sharpe", v: (Object.entries(sel).reduce((a, [t, p]) => { const e = ETFs.find(x => x.ticker === t); return a + (e ? e.sharpe * (p / 100) : 0); }, 0)).toFixed(2), c: "var(--acc3)" },
                  { l: "Max Drawdown Est.", v: `-${(blendedVol * 2.5).toFixed(0)}%`, c: "var(--acc4)" },
                  { l: "Sortino (est.)", v: (blended / (blendedVol * 0.7)).toFixed(2), c: "var(--acc2)" },
                ].map(({ l, v, c }) => (
                  <div key={l} className="card" style={{ padding: "12px" }}>
                    <div className="lbl">{l}</div>
                    <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "24px", color: c, marginTop: "4px" }}>{v}</div>
                  </div>
                ))}
              </div>
              {/* Risk scatter */}
              <div className="card scan-wrap" style={{ padding: "14px" }}>
                <div className="lbl" style={{ marginBottom: "10px" }}>Risk vs Return Scatter — All ETFs</div>
                <svg width="100%" height="260" viewBox="0 0 520 260">
                  {[0, 1, 2, 3, 4].map(i => <line key={i} x1="50" y1={i * 55 + 10} x2="515" y2={i * 55 + 10} stroke="var(--b1)" strokeWidth="0.4" />)}
                  {[0, 1, 2, 3, 4, 5].map(i => <line key={i} x1={i * 90 + 50} y1="10" x2={i * 90 + 50} y2="250" stroke="var(--b1)" strokeWidth="0.4" />)}
                  <text x="280" y="258" textAnchor="middle" fill="var(--t3)" fontFamily="var(--font-mono)" fontSize="7">VOLATILITY (σ) →</text>
                  <text x="12" y="135" textAnchor="middle" fill="var(--t3)" fontFamily="var(--font-mono)" fontSize="7" transform="rotate(-90,12,135)">RETURN →</text>
                  {/* Efficient frontier hint */}
                  <path d="M 60 220 Q 200 150 350 60" fill="none" stroke="var(--acc)" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.25" />
                  <text x="355" y="55" fill="var(--acc)" fontFamily="var(--font-mono)" fontSize="6" opacity="0.4">efficient frontier</text>
                  {ETFs.map(etf => {
                    const x = 50 + (etf.vol / 60) * 460;
                    const y = 240 - (etf.avgReturn / 22) * 220;
                    const on = sel[etf.ticker] !== undefined;
                    return (
                      <g key={etf.ticker}>
                        <circle cx={x} cy={y} r={on ? 7 : 4} fill={on ? etf.color : "var(--b3)"} opacity={on ? 0.9 : 0.5} />
                        {on && <circle cx={x} cy={y} r={12} fill="none" stroke={etf.color} strokeWidth="0.8" opacity="0.4" />}
                        <text x={x + 9} y={y + 3} fill={on ? etf.color : "var(--t3)"} fontFamily="var(--font-mono)" fontSize="7">{etf.ticker}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}

          {sub === "fees" && (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {[
                  { l: "Blended MER", v: `${blendedExp.toFixed(3)}%`, c: "var(--acc4)" },
                  { l: `Fee Drag (${years}yr)`, v: fmt(expDrag, sym), c: "var(--acc4)" },
                  { l: "Annual Fee at Maturity", v: fmt(final.v * blendedExp / 100, sym), c: "var(--acc5)" },
                ].map(({ l, v, c }) => (
                  <div key={l} className="card card-r" style={{ padding: "14px" }}>
                    <div className="lbl">{l}</div>
                    <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "24px", color: c, marginTop: "4px" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: "14px" }}>
                <div className="lbl" style={{ marginBottom: "10px" }}>Fee Impact Per ETF</div>
                {Object.entries(sel).filter(([, v]) => v > 0).map(([t, p]) => {
                  const e = ETFs.find(x => x.ticker === t); if (!e) return null;
                  return (
                    <div key={t} style={{ display: "grid", gridTemplateColumns: "55px 1fr 80px 60px", alignItems: "center", gap: "10px", padding: "6px 0", borderBottom: "1px solid var(--b1)" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: e.color }}>{e.ticker}</span>
                      <div style={{ height: "4px", background: "var(--b1)", borderRadius: "2px" }}>
                        <div style={{ height: "100%", width: `${Math.min((e.expense / 0.95) * 100, 100)}%`, background: e.color, borderRadius: "2px", opacity: 0.7 }} />
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--acc4)", textAlign: "right" }}>{(e.expense * p / 100).toFixed(3)}% blended</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)", textAlign: "right" }}>{p}% wt</span>
                    </div>
                  );
                })}
              </div>
              <div className="card" style={{ padding: "14px" }}>
                <div className="lbl" style={{ marginBottom: "10px" }}>Fee Comparison — What 0% Fee Would Look Like</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Year", "Your Portfolio", "Zero-Fee Portfolio", "Fee Cost to Date"].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
                  <tbody>
                    {proj.filter(p => p.y > 0 && p.y % 5 === 0).map(p => {
                      const r0 = blended / 100 / 12, rF = (blended + blendedExp) / 100 / 12, n = p.y * 12;
                      const vFree = start * Math.pow(1 + rF, n) + (rF > 0 ? monthly * ((Math.pow(1 + rF, n) - 1) / rF) : monthly * n);
                      return (
                        <tr key={p.y} className="row-h">
                          <td className="td">{p.y}yr</td>
                          <td className="td td-acc">{fmt(p.v, sym)}</td>
                          <td className="td td-b">{fmt(vFree, sym)}</td>
                          <td className="td td-r">{fmt(vFree - p.v, sym)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {sub === "dividends" && (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {[
                  { l: "Blended Yield", v: `${blendedDiv.toFixed(2)}%`, c: "var(--acc5)" },
                  { l: "Annual Dividends (Now)", v: fmt(start * blendedDiv / 100, sym), c: "var(--acc5)" },
                  { l: `Annual Dividends (Yr ${years})`, v: fmt(final.v * blendedDiv / 100, sym), c: "var(--acc)" },
                  { l: "Monthly Passive (Yr end)", v: fmt(final.v * blendedDiv / 100 / 12, sym), c: "var(--acc2)" },
                ].map(({ l, v, c }) => (
                  <div key={l} className="card card-y" style={{ padding: "12px" }}>
                    <div className="lbl">{l}</div>
                    <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "20px", color: c, marginTop: "4px" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: "14px" }}>
                <div className="lbl" style={{ marginBottom: "10px" }}>Dividend Income Growth Projection</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Year", "Portfolio Value", "Annual Dividend", "Monthly Passive", "Yield on Cost"].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
                  <tbody>
                    {proj.filter(p => p.y > 0 && p.y % 5 === 0).map(p => (
                      <tr key={p.y} className="row-h">
                        <td className="td">{p.y}yr</td>
                        <td className="td td-acc">{fmt(p.v, sym)}</td>
                        <td className="td td-y">{fmt(p.v * blendedDiv / 100, sym)}</td>
                        <td className="td" style={{ color: "var(--acc2)" }}>{fmt(p.v * blendedDiv / 100 / 12, sym)}</td>
                        <td className="td" style={{ color: "var(--acc6)" }}>{start > 0 ? ((p.v * blendedDiv / 100 / start) * 100).toFixed(1) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DCA MODULE ───────────────────────────────────────────────────────────────

function DCAModule({ currency }) {
  const sym = CURRENCIES[currency]?.sym ?? "$";
  const [ticker, setTicker] = useState("QQQ");
  const [lump, setLump] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(20);
  const [startDip, setStartDip] = useState(false);

  const etf = ETFs.find(e => e.ticker === ticker);
  const r = (etf?.avgReturn ?? 10) / 100 / 12;

  const dcaProj = useMemo(() => Array.from({ length: years + 1 }, (_, y) => {
    const n = y * 12;
    const v = r > 0 ? monthly * ((Math.pow(1 + r, n) - 1) / r) : monthly * n;
    return { y, v, c: monthly * n };
  }), [monthly, years, r]);

  const lumpProj = useMemo(() => Array.from({ length: years + 1 }, (_, y) => {
    const v = lump * Math.pow(1 + r, y * 12);
    return { y, v };
  }), [lump, years, r]);

  const hybridProj = useMemo(() => Array.from({ length: years + 1 }, (_, y) => {
    const n = y * 12;
    const lumpV = lump * Math.pow(1 + r, n);
    const dcaV = r > 0 ? monthly * ((Math.pow(1 + r, n) - 1) / r) : monthly * n;
    return { y, v: lumpV + dcaV };
  }), [lump, monthly, years, r]);

  const maxV = Math.max(...hybridProj.map(p => p.v), 1);
  const finalDCA = dcaProj[dcaProj.length - 1];
  const finalLump = lumpProj[lumpProj.length - 1];
  const finalHybrid = hybridProj[hybridProj.length - 1];

  // DCA vs Lump sum timing analysis
  const timingRows = [3, 5, 7, 10, 15, 20].map(y => {
    const n = y * 12;
    const dca = r > 0 ? monthly * ((Math.pow(1 + r, n) - 1) / r) : monthly * n;
    const ls = (lump + monthly * n * 0.5) * Math.pow(1 + r, n);
    return { y, dca, ls, diff: ls - dca, winner: ls > dca ? "Lump Sum" : "DCA" };
  });

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", height: "calc(100vh - 138px)" }} className="fade-up">
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div className="card" style={{ padding: "12px" }}>
            <div className="lbl" style={{ marginBottom: "8px" }}>Select ETF</div>
            <select className="si" value={ticker} onChange={e => setTicker(e.target.value)} style={{ width: "100%" }}>
              {ETFs.map(e => <option key={e.ticker} value={e.ticker}>{e.ticker} — {e.avgReturn}%</option>)}
            </select>
            {etf && (
              <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                {[["Avg Return", `${etf.avgReturn}%`, "var(--acc)"], ["Volatility", `${etf.vol}%`, "var(--acc5)"], ["Sharpe", etf.sharpe, "var(--acc3)"], ["Expense", `${etf.expense}%`, "var(--acc4)"]].map(([l, v, c]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="lbl">{l}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: c }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {[
            { l: "Lump Sum", v: lump, set: setLump, pre: sym },
            { l: "Monthly DCA", v: monthly, set: setMonthly, pre: sym },
            { l: "Years", v: years, set: setYears, suf: "yrs" },
          ].map(({ l, v, set, pre, suf }) => (
            <div key={l} className="card" style={{ padding: "10px 12px" }}>
              <div className="lbl" style={{ marginBottom: "4px" }}>{l}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                {pre && <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--t3)" }}>{pre}</span>}
                <input className="ni" type="number" value={v} onChange={e => set(+e.target.value)} style={{ fontSize: "18px" }} />
                {suf && <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)" }}>{suf}</span>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
            {[
              { l: `DCA Only (${years}yr)`, v: finalDCA.v, sub: `Contrib: ${fmt(finalDCA.c, sym)}`, c: "var(--acc)" },
              { l: `Lump Sum Only (${years}yr)`, v: finalLump.v, sub: `Invest: ${fmt(lump, sym)}`, c: "var(--acc2)" },
              { l: `Hybrid (${years}yr)`, v: finalHybrid.v, sub: "Lump + monthly DCA", c: "var(--acc3)" },
            ].map(({ l, v, sub, c }) => (
              <div key={l} className="card" style={{ padding: "12px", borderColor: c + "30" }}>
                <div className="lbl">{l}</div>
                <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "22px", color: c, marginTop: "4px" }}><AnimNum value={v} format={n => fmt(n, sym)} /></div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)", marginTop: "3px" }}>{sub}</div>
              </div>
            ))}
          </div>
          <div className="card scan-wrap" style={{ padding: "14px", flex: 1 }}>
            <div className="lbl" style={{ marginBottom: "10px" }}>DCA vs Lump Sum vs Hybrid</div>
            <svg width="100%" height="200" viewBox={`0 0 ${years} 200`} preserveAspectRatio="none">
              <defs>
                {[["g1","#00FF87"],["g2","#60EFFF"],["g3","#A78BFA"]].map(([id, c]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity="0.15"/><stop offset="100%" stopColor={c} stopOpacity="0"/></linearGradient>
                ))}
              </defs>
              {[0.25, 0.5, 0.75].map(f => <line key={f} x1="0" y1={200 - f * 185} x2={years} y2={200 - f * 185} stroke="var(--b1)" strokeWidth="0.3" />)}
              {[dcaProj, lumpProj, hybridProj].map((data, i) => {
                const c = ["#00FF87", "#60EFFF", "#A78BFA"][i];
                const gid = ["g1", "g2", "g3"][i];
                return (
                  <g key={i}>
                    <polygon points={[`0,200`, ...data.map(p => `${p.y},${200 - (p.v / maxV) * 185}`), `${years},200`].join(" ")} fill={`url(#${gid})`} />
                    <polyline points={data.map(p => `${p.y},${200 - (p.v / maxV) * 185}`).join(" ")} fill="none" stroke={c} strokeWidth="1.2" />
                  </g>
                );
              })}
            </svg>
            <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
              {[["var(--acc)", "DCA Only"], ["var(--acc2)", "Lump Sum"], ["var(--acc3)", "Hybrid"]].map(([c, l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "16px", height: "2px", background: c }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: "14px" }}>
        <div className="lbl" style={{ marginBottom: "8px" }}>Strategy Comparison by Year</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Year", "DCA Value", "Lump Sum Value", "Difference", "Winner"].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody>
            {timingRows.map(row => (
              <tr key={row.y} className="row-h">
                <td className="td">{row.y}yr</td>
                <td className="td td-acc">{fmt(row.dca, sym)}</td>
                <td className="td td-b">{fmt(row.ls, sym)}</td>
                <td className="td" style={{ color: row.diff > 0 ? "var(--acc2)" : "var(--acc)" }}>{fmt(Math.abs(row.diff), sym)}</td>
                <td className="td" style={{ color: row.winner === "Lump Sum" ? "var(--acc2)" : "var(--acc)" }}>{row.winner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MONTE CARLO MODULE ───────────────────────────────────────────────────────

function MonteCarloModule({ currency }) {
  const sym = CURRENCIES[currency]?.sym ?? "$";
  const [ticker, setTicker] = useState("QQQ");
  const [start, setStart] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(20);
  const [sims, setSims] = useState(500);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);

  const etf = ETFs.find(e => e.ticker === ticker);

  const runSim = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const mu = (etf?.avgReturn ?? 10) / 100 / 12;
      const sigma = (etf?.vol ?? 15) / 100 / Math.sqrt(12);
      const n = years * 12;
      const rand = seededRand(Date.now() % 100000);
      const paths = [];
      for (let s = 0; s < sims; s++) {
        let v = start;
        const path = [v];
        for (let m = 0; m < n; m++) {
          v = v * (1 + mu + sigma * normalRand(rand)) + monthly;
          path.push(Math.max(v, 0));
        }
        paths.push(path);
      }
      const finals = paths.map(p => p[p.length - 1]).sort((a, b) => a - b);
      const pct = p => finals[Math.floor(p * finals.length / 100)];
      const yearlyPcts = Array.from({ length: years + 1 }, (_, y) => {
        const vals = paths.map(p => p[y * 12]).sort((a, b) => a - b);
        return { y, p10: vals[Math.floor(0.10 * vals.length)], p25: vals[Math.floor(0.25 * vals.length)], p50: vals[Math.floor(0.50 * vals.length)], p75: vals[Math.floor(0.75 * vals.length)], p90: vals[Math.floor(0.90 * vals.length)] };
      });
      const contributed = start + monthly * n;
      const successRate = finals.filter(f => f > contributed).length / finals.length * 100;
      const ruin = finals.filter(f => f < start * 0.5).length / finals.length * 100;
      setResults({ finals, pct, yearlyPcts, successRate, ruin, paths: paths.slice(0, 80) });
      setRunning(false);
    }, 50);
  }, [etf, start, monthly, years, sims]);

  const maxPath = results ? Math.max(...results.yearlyPcts.map(p => p.p90)) : 1;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", height: "calc(100vh - 138px)" }} className="fade-up">
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { l: "ETF", type: "sel" },
            { l: "Starting Capital", v: start, set: setStart, pre: sym },
            { l: "Monthly Contribution", v: monthly, set: setMonthly, pre: sym },
            { l: "Years", v: years, set: setYears, suf: "yrs" },
            { l: "Simulations", v: sims, set: setSims, suf: "paths" },
          ].map(({ l, v, set, pre, suf, type }) => (
            <div key={l} className="card" style={{ padding: "10px 12px" }}>
              <div className="lbl" style={{ marginBottom: "4px" }}>{l}</div>
              {type === "sel" ? (
                <select className="si" value={ticker} onChange={e => setTicker(e.target.value)} style={{ width: "100%", marginTop: "4px" }}>
                  {ETFs.map(e => <option key={e.ticker} value={e.ticker}>{e.ticker} — {e.avgReturn}% σ{e.vol}%</option>)}
                </select>
              ) : (
                <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                  {pre && <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--t3)" }}>{pre}</span>}
                  <input className="ni" type="number" value={v} onChange={e => set(+e.target.value)} style={{ fontSize: "18px" }} />
                  {suf && <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)" }}>{suf}</span>}
                </div>
              )}
            </div>
          ))}
          <button className={`btn${running ? "" : " btn-acc"}`} onClick={runSim} disabled={running} style={{ padding: "12px", fontSize: "10px", letterSpacing: "3px" }}>
            {running ? "RUNNING..." : `RUN ${sims} SIMULATIONS`}
          </button>
          {!results && <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)", lineHeight: 1.6, padding: "8px", background: "var(--s1)", borderRadius: "3px", border: "1px solid var(--b1)" }}>
            Monte Carlo simulates {sims} random market paths using historical return & volatility data. Shows probability distribution of outcomes.
          </div>}
        </div>

        {results ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {[
                { l: "Median Outcome", v: fmt(results.pct(50), sym), c: "var(--acc)" },
                { l: "Best Case (90th)", v: fmt(results.pct(90), sym), c: "var(--acc2)" },
                { l: "Worst Case (10th)", v: fmt(results.pct(10), sym), c: "var(--acc4)" },
                { l: "Success Rate", v: `${results.successRate.toFixed(1)}%`, c: results.successRate > 80 ? "var(--acc)" : results.successRate > 60 ? "var(--acc5)" : "var(--acc4)" },
              ].map(({ l, v, c }) => (
                <div key={l} className="card" style={{ padding: "12px", borderColor: c + "25" }}>
                  <div className="lbl">{l}</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "20px", color: c, marginTop: "4px" }}>{v}</div>
                </div>
              ))}
            </div>
            {/* Fan chart */}
            <div className="card scan-wrap" style={{ padding: "14px" }}>
              <div className="lbl" style={{ marginBottom: "8px" }}>{sims} Simulation Paths — Percentile Fan</div>
              <svg width="100%" height="220" viewBox={`0 0 ${years} 220`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="mc90" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00FF87" stopOpacity="0.08"/><stop offset="100%" stopColor="#00FF87" stopOpacity="0"/></linearGradient>
                  <linearGradient id="mc75" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00FF87" stopOpacity="0.12"/><stop offset="100%" stopColor="#00FF87" stopOpacity="0"/></linearGradient>
                </defs>
                {/* Simulation paths (faint) */}
                {results.paths.map((path, i) => (
                  <polyline key={i} points={path.filter((_, j) => j % 12 === 0).map((v, y) => `${y},${220 - (v / maxPath) * 200}`).join(" ")} fill="none" stroke="#00FF87" strokeWidth="0.2" opacity="0.08" />
                ))}
                {/* P90-P10 band */}
                <polygon points={[`0,220`, ...results.yearlyPcts.map(p => `${p.y},${220 - (p.p90 / maxPath) * 200}`), ...results.yearlyPcts.slice().reverse().map(p => `${p.y},${220 - (p.p10 / maxPath) * 200}`)].join(" ")} fill="url(#mc90)" />
                <polygon points={[`0,220`, ...results.yearlyPcts.map(p => `${p.y},${220 - (p.p75 / maxPath) * 200}`), ...results.yearlyPcts.slice().reverse().map(p => `${p.y},${220 - (p.p25 / maxPath) * 200}`)].join(" ")} fill="url(#mc75)" />
                {/* Percentile lines */}
                {[["p90", "#00FF87", 0.4], ["p75", "#00FF87", 0.6], ["p50", "#00FF87", 1.0], ["p25", "#60EFFF", 0.6], ["p10", "#FF4D6D", 0.5]].map(([key, c, op]) => (
                  <polyline key={key} points={results.yearlyPcts.map(p => `${p.y},${220 - (p[key] / maxPath) * 200}`).join(" ")} fill="none" stroke={c} strokeWidth={key === "p50" ? 1.5 : 0.8} opacity={op} strokeDasharray={key !== "p50" ? "2,3" : ""} />
                ))}
              </svg>
              <div style={{ display: "flex", gap: "12px", marginTop: "6px", flexWrap: "wrap" }}>
                {[["#00FF87","P90 — Best 10%"],["#00FF87","P75"],["#00FF87","P50 — Median"],["#60EFFF","P25"],["#FF4D6D","P10 — Worst 10%"]].map(([c, l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "12px", height: "2px", background: c }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--t3)" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Distribution histogram */}
            <div className="card" style={{ padding: "14px" }}>
              <div className="lbl" style={{ marginBottom: "8px" }}>Outcome Distribution</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "1px", height: "60px" }}>
                {(() => {
                  const min = results.finals[0], max = results.finals[results.finals.length - 1];
                  const buckets = 40, bSize = (max - min) / buckets;
                  const counts = Array(buckets).fill(0);
                  results.finals.forEach(f => { const b = Math.min(Math.floor((f - min) / bSize), buckets - 1); counts[b]++; });
                  const maxC = Math.max(...counts);
                  const med = results.pct(50);
                  return counts.map((c, i) => {
                    const val = min + i * bSize;
                    const isMedian = i === Math.floor((med - min) / bSize);
                    return <div key={i} style={{ flex: 1, height: `${(c / maxC) * 60}px`, background: isMedian ? "var(--acc)" : val < start ? "var(--acc4)" : "var(--acc)", opacity: isMedian ? 1 : 0.4, minWidth: "2px" }} />;
                  });
                })()}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--t3)" }}>Worst: {fmt(results.finals[0], sym)}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--acc)" }}>Median: {fmt(results.pct(50), sym)}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--t3)" }}>Best: {fmt(results.finals[results.finals.length - 1], sym)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="card scan-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "24px", color: "var(--t3)" }}>⊞</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--t3)", letterSpacing: "2px" }}>RUN SIMULATION TO SEE RESULTS</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BUDGET MODULE ────────────────────────────────────────────────────────────

function BudgetModule({ currency }) {
  const sym = CURRENCIES[currency]?.sym ?? "$";
  const [income, setIncome] = useState(5000);
  const [period, setPeriod] = useState("monthly");
  const [expenses, setExpenses] = useState([
    { id: 1, name: "Rent / Mortgage", cat: "Housing", amount: 1500, essential: true },
    { id: 2, name: "Groceries", cat: "Food", amount: 400, essential: true },
    { id: 3, name: "Transport", cat: "Transport", amount: 200, essential: true },
    { id: 4, name: "Streaming", cat: "Subscriptions", amount: 40, essential: false },
    { id: 5, name: "Gym", cat: "Health", amount: 60, essential: false },
    { id: 6, name: "Dining Out", cat: "Dining Out", amount: 250, essential: false },
    { id: 7, name: "Investments", cat: "Savings/Invest", amount: 800, essential: true },
    { id: 8, name: "Utilities", cat: "Utilities", amount: 150, essential: true },
    { id: 9, name: "Insurance", cat: "Insurance", amount: 120, essential: true },
    { id: 10, name: "Entertainment", cat: "Entertainment", amount: 100, essential: false },
  ]);
  const [goals, setGoals] = useState([
    { id: 1, name: "Emergency Fund", target: 15000, saved: 3000 },
    { id: 2, name: "Investment Account", target: 100000, saved: 12000 },
    { id: 3, name: "Holiday", target: 5000, saved: 800 },
  ]);
  const [sub, setSub] = useState("overview");

  const moIncome = period === "annual" ? income / 12 : income;
  const totalExp = useMemo(() => expenses.reduce((a, e) => a + (e.amount || 0), 0), [expenses]);
  const essentialExp = useMemo(() => expenses.filter(e => e.essential).reduce((a, e) => a + e.amount, 0), [expenses]);
  const surplus = moIncome - totalExp;
  const savingsRate = moIncome > 0 ? (surplus / moIncome) * 100 : 0;
  const catTotals = useMemo(() => { const t = {}; expenses.forEach(e => { t[e.cat] = (t[e.cat] || 0) + (e.amount || 0); }); return t; }, [expenses]);

  const addExp = () => setExpenses(p => [...p, { id: Date.now(), name: "", cat: "Other", amount: 0, essential: false }]);
  const delExp = id => setExpenses(p => p.filter(e => e.id !== id));
  const upd = (id, f, v) => setExpenses(p => p.map(e => e.id === id ? { ...e, [f]: v } : e));
  const addGoal = () => setGoals(p => [...p, { id: Date.now(), name: "New Goal", target: 10000, saved: 0 }]);
  const delGoal = id => setGoals(p => p.filter(g => g.id !== id));
  const updG = (id, f, v) => setGoals(p => p.map(g => g.id === id ? { ...g, [f]: v } : g));

  const donutData = Object.entries(catTotals).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const dTotal = donutData.reduce((a, [, v]) => a + v, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 138px)", overflow: "hidden" }}>
      <div className="subtab-row" style={{ display: "flex", gap: "4px", padding: "8px", borderBottom: "1px solid var(--b1)", flexWrap: "wrap" }}>
        {[["overview", "Overview"], ["breakdown", "Breakdown"], ["goals", "Goals"], ["rules", "Budget Rules"], ["forecast", "Forecast"]].map(([id, l]) => (
          <button key={id} className={`subtab${sub === id ? " on" : ""}`} onClick={() => setSub(id)}>{l}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {sub === "overview" && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "10px" }}>
              <div className="card card-acc" style={{ padding: "12px" }}>
                <div className="lbl" style={{ marginBottom: "6px" }}>Monthly Income</div>
                <select className="si" value={period} onChange={e => setPeriod(e.target.value)} style={{ marginBottom: "8px" }}><option value="monthly">Monthly</option><option value="annual">Annual ÷12</option></select>
                <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--t3)" }}>{sym}</span>
                  <input className="ni" type="number" value={income} onChange={e => setIncome(+e.target.value)} style={{ fontSize: "26px", color: "var(--acc)" }} />
                </div>
              </div>
              <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {[
                  { l: "Total Expenses", v: fmt(totalExp, sym), c: "var(--acc4)" },
                  { l: "Monthly Surplus", v: fmt(surplus, sym), c: surplus >= 0 ? "var(--acc)" : "var(--acc4)" },
                  { l: "Savings Rate", v: `${savingsRate.toFixed(1)}%`, c: savingsRate >= 20 ? "var(--acc)" : savingsRate >= 10 ? "var(--acc5)" : "var(--acc4)" },
                  { l: "Essential Ratio", v: `${moIncome > 0 ? ((essentialExp / moIncome) * 100).toFixed(0) : 0}%`, c: "var(--t1)" },
                ].map(({ l, v, c }) => (
                  <div key={l} className="card" style={{ padding: "12px" }}>
                    <div className="lbl">{l}</div>
                    <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "20px", color: c, marginTop: "4px" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: "12px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span className="lbl">Expense Tracker</span>
                <button className="btn" onClick={addExp}>+ Add</button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Item", "Category", "Amount", "Type", ""].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp.id} className="row-h">
                      <td className="td"><input className="ti" value={exp.name} onChange={e => upd(exp.id, "name", e.target.value)} /></td>
                      <td className="td"><select className="si" value={exp.cat} onChange={e => upd(exp.id, "cat", e.target.value)} style={{ width: "100%" }}>{EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}</select></td>
                      <td className="td"><div style={{ display: "flex", gap: "2px", alignItems: "center" }}><span style={{ color: "var(--t3)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>{sym}</span><input type="number" value={exp.amount} onChange={e => upd(exp.id, "amount", +e.target.value)} style={{ background: "transparent", border: "none", color: "var(--t1)", fontFamily: "var(--font-mono)", fontSize: "12px", width: "80px", outline: "none" }} /></div></td>
                      <td className="td"><span onClick={() => upd(exp.id, "essential", !exp.essential)} style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "9px", color: exp.essential ? "var(--acc)" : "var(--t3)", padding: "2px 6px", border: `1px solid ${exp.essential ? "var(--acc)40" : "var(--b2)"}`, borderRadius: "2px" }}>{exp.essential ? "NEED" : "WANT"}</span></td>
                      <td className="td"><button className="btn-del" onClick={() => delExp(exp.id)}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {sub === "breakdown" && (
          <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <MiniDonut data={donutData.map(([cat, value]) => ({ cat, value, color: CAT_COLORS[cat] ?? "#888" }))} size={140} />
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {donutData.map(([cat, val]) => (
                  <div key={cat} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: CAT_COLORS[cat] ?? "#888", flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t2)", flex: 1 }}>{cat}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t1)" }}>{fmt(val, sym)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: "14px" }}>
              <div className="lbl" style={{ marginBottom: "12px" }}>Category Analysis</div>
              {donutData.map(([cat, val]) => (
                <div key={cat} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t2)" }}>{cat}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t1)" }}>{fmt(val, sym)} <span style={{ color: "var(--t3)" }}>({moIncome > 0 ? ((val / moIncome) * 100).toFixed(1) : 0}%)</span></span>
                  </div>
                  <div style={{ height: "4px", background: "var(--b1)", borderRadius: "2px" }}>
                    <div style={{ height: "100%", width: `${moIncome > 0 ? Math.min((val / moIncome) * 100, 100) : 0}%`, background: CAT_COLORS[cat] ?? "#888", borderRadius: "2px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {sub === "goals" && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span className="lbl">Savings Goals</span><button className="btn" onClick={addGoal}>+ Add Goal</button></div>
            {goals.map(g => {
              const pct = Math.min((g.saved / g.target) * 100, 100);
              const months = surplus > 0 ? Math.ceil((g.target - g.saved) / surplus) : null;
              return (
                <div key={g.id} className={`card${pct >= 100 ? " card-acc" : ""}`} style={{ padding: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <input className="ti" value={g.name} onChange={e => updG(g.id, "name", e.target.value)} style={{ fontSize: "13px", color: "var(--acc)", maxWidth: "200px" }} />
                    <button className="btn-del" onClick={() => delGoal(g.id)}>×</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "12px" }}>
                    {[{ l: "Target", v: g.target, field: "target" }, { l: "Saved", v: g.saved, field: "saved" }].map(({ l, v, field }) => (
                      <div key={l}>
                        <div className="lbl">{l}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--t3)" }}>{sym}</span>
                          <input type="number" value={v} onChange={e => updG(g.id, field, +e.target.value)} style={{ background: "transparent", border: "none", color: "var(--t1)", fontFamily: "var(--font-mono)", fontSize: "14px", width: "100%", outline: "none" }} />
                        </div>
                      </div>
                    ))}
                    <div><div className="lbl">Remaining</div><div style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "var(--acc4)" }}>{fmt(g.target - g.saved, sym)}</div></div>
                    <div><div className="lbl">ETA</div><div style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: pct >= 100 ? "var(--acc)" : "var(--acc2)" }}>{pct >= 100 ? "Done!" : months ? `${months}mo` : "—"}</div></div>
                  </div>
                  <div style={{ height: "6px", background: "var(--b1)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,var(--acc2),var(--acc))`, borderRadius: "3px", transition: "width 0.5s", boxShadow: pct >= 100 ? "0 0 8px var(--acc)" : "" }} />
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)", marginTop: "4px" }}>{pct.toFixed(1)}% complete</div>
                </div>
              );
            })}
          </div>
        )}
        {sub === "rules" && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="card" style={{ padding: "14px" }}>
              <div className="lbl" style={{ marginBottom: "12px" }}>50/30/20 Rule Analysis</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {[
                  { l: "Needs (50%)", target: 50, actual: moIncome > 0 ? (essentialExp / moIncome) * 100 : 0, val: fmt(essentialExp, sym), c: "var(--acc2)" },
                  { l: "Wants (30%)", target: 30, actual: moIncome > 0 ? ((totalExp - essentialExp) / moIncome) * 100 : 0, val: fmt(totalExp - essentialExp, sym), c: "var(--acc3)" },
                  { l: "Savings (20%)", target: 20, actual: Math.max(savingsRate, 0), val: fmt(Math.max(surplus, 0), sym), c: "var(--acc)" },
                ].map(({ l, target, actual, val, c }) => (
                  <div key={l} className="card" style={{ padding: "12px", background: "var(--s3)" }}>
                    <div className="lbl">{l}</div>
                    <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "26px", color: c, marginTop: "4px" }}>{actual.toFixed(1)}%</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)", marginBottom: "8px" }}>{val}/mo · target {target}%</div>
                    <div style={{ height: "4px", background: "var(--b1)", borderRadius: "2px" }}>
                      <div style={{ height: "100%", width: `${Math.min((actual / target) * 100, 100)}%`, background: c }} />
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: Math.abs(actual - target) < 5 ? "var(--acc)" : "var(--acc4)", marginTop: "4px" }}>
                      {actual > target + 5 ? "↑ Over" : actual < target - 5 ? "↓ Under" : "✓ On Target"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: "14px" }}>
              <div className="lbl" style={{ marginBottom: "10px" }}>Financial Health Score</div>
              {[
                { l: "Savings rate ≥ 20%", pass: savingsRate >= 20 },
                { l: "Essential spending ≤ 50% income", pass: moIncome > 0 && (essentialExp / moIncome) <= 0.5 },
                { l: "Monthly surplus is positive", pass: surplus > 0 },
                { l: "Discretionary ≤ 30% income", pass: moIncome > 0 && ((totalExp - essentialExp) / moIncome) <= 0.3 },
                { l: "Has savings goals set", pass: goals.length > 0 },
              ].map(({ l, pass }) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", borderBottom: "1px solid var(--b1)" }}>
                  <span style={{ color: pass ? "var(--acc)" : "var(--acc4)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{pass ? "✓" : "✗"}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--t2)", flex: 1 }}>{l}</span>
                </div>
              ))}
              <div style={{ marginTop: "10px", padding: "10px", background: "var(--s3)", borderRadius: "3px" }}>
                <span className="lbl">Score: </span>
                <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "22px", color: ["var(--acc4)", "var(--acc4)", "var(--acc5)", "var(--acc5)", "var(--acc)", "var(--acc)"][[savingsRate >= 20, moIncome > 0 && essentialExp / moIncome <= 0.5, surplus > 0, moIncome > 0 && (totalExp - essentialExp) / moIncome <= 0.3, goals.length > 0].filter(Boolean).length] }}>
                  {["Poor", "Poor", "Fair", "Good", "Great", "Excellent"][[savingsRate >= 20, moIncome > 0 && essentialExp / moIncome <= 0.5, surplus > 0, moIncome > 0 && (totalExp - essentialExp) / moIncome <= 0.3, goals.length > 0].filter(Boolean).length]}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)", marginLeft: "8px" }}>{[savingsRate >= 20, moIncome > 0 && essentialExp / moIncome <= 0.5, surplus > 0, moIncome > 0 && (totalExp - essentialExp) / moIncome <= 0.3, goals.length > 0].filter(Boolean).length}/5 checks</span>
              </div>
            </div>
          </div>
        )}
        {sub === "forecast" && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="card" style={{ padding: "14px" }}>
              <div className="lbl" style={{ marginBottom: "10px" }}>Invest Your Surplus — What It Becomes</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {[7, 10, 12].map(rate => (
                  <div key={rate} className="card" style={{ padding: "12px", background: "var(--s3)" }}>
                    <div className="lbl" style={{ marginBottom: "8px" }}>@ {rate}% p.a.</div>
                    {[5, 10, 20, 30].map(y => {
                      const r = rate / 100 / 12, n = y * 12;
                      const fv = surplus > 0 ? surplus * ((Math.pow(1 + r, n) - 1) / r) : 0;
                      return <div key={y} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--b1)" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)" }}>{y}yr</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--acc)" }}>{fmt(fv, sym)}</span>
                      </div>;
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: "14px" }}>
              <div className="lbl" style={{ marginBottom: "10px" }}>Expense Cut → 20yr Impact @ 12%</div>
              {[50, 100, 200, 300, 500, 1000].map(cut => {
                const r = 0.12 / 100 / 12, n = 240;
                const extra = cut * ((Math.pow(1 + r, n) - 1) / r);
                const pctInc = surplus > 0 ? (cut / surplus) * 100 : 0;
                return <div key={cut} style={{ display: "grid", gridTemplateColumns: "90px 80px 1fr 80px", padding: "5px 0", borderBottom: "1px solid var(--b1)", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--acc5)" }}>Cut {fmt(cut, sym)}/mo</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)" }}>+{pctInc.toFixed(0)}% surplus</span>
                  <div style={{ height: "3px", background: "var(--b1)", borderRadius: "2px" }}><div style={{ height: "100%", width: `${Math.min(pctInc, 100)}%`, background: "var(--acc5)" }} /></div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--acc)", textAlign: "right" }}>{fmt(extra, sym)}</span>
                </div>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NET WORTH MODULE ─────────────────────────────────────────────────────────

function NetWorthModule({ currency }) {
  const sym = CURRENCIES[currency]?.sym ?? "$";
  const [assets, setAssets] = useState([
    { id: 1, name: "Investment Portfolio", cat: "Investments", value: 25000, growth: 12 },
    { id: 2, name: "Cash / HYSA", cat: "Cash", value: 8000, growth: 4.5 },
    { id: 3, name: "Super / 401k", cat: "Retirement", value: 15000, growth: 8 },
    { id: 4, name: "Vehicle", cat: "Depreciating", value: 12000, growth: -12 },
    { id: 5, name: "Other Assets", cat: "Other", value: 3000, growth: 0 },
  ]);
  const [liabilities, setLiabilities] = useState([
    { id: 1, name: "Student Loan", cat: "Loans", balance: 8000, rate: 5.0, minPay: 200 },
    { id: 2, name: "Credit Card", cat: "Credit", balance: 1200, rate: 19.99, minPay: 60 },
  ]);
  const [history] = useState([
    { month: "Apr", nw: 32000 }, { month: "May", nw: 34500 }, { month: "Jun", nw: 36000 },
    { month: "Jul", nw: 35200 }, { month: "Aug", nw: 38000 }, { month: "Sep", nw: 40000 },
    { month: "Oct", nw: 39800 }, { month: "Nov", nw: 43000 }, { month: "Dec", nw: 45200 },
    { month: "Jan", nw: 46800 }, { month: "Feb", nw: 48000 }, { month: "Mar", nw: 50800 },
  ]);

  const totalAssets = useMemo(() => assets.reduce((a, x) => a + (x.value || 0), 0), [assets]);
  const totalLiab = useMemo(() => liabilities.reduce((a, x) => a + (x.balance || 0), 0), [liabilities]);
  const netWorth = totalAssets - totalLiab;
  const prevNW = history[history.length - 2]?.nw ?? 0;
  const nwChange = netWorth - prevNW;

  const addAsset = () => setAssets(p => [...p, { id: Date.now(), name: "", cat: "Cash", value: 0, growth: 0 }]);
  const addLiab = () => setLiabilities(p => [...p, { id: Date.now(), name: "", cat: "Loans", balance: 0, rate: 0, minPay: 0 }]);
  const delA = id => setAssets(p => p.filter(x => x.id !== id));
  const delL = id => setLiabilities(p => p.filter(x => x.id !== id));
  const updA = (id, f, v) => setAssets(p => p.map(x => x.id === id ? { ...x, [f]: v } : x));
  const updL = (id, f, v) => setLiabilities(p => p.map(x => x.id === id ? { ...x, [f]: v } : x));

  const nwSpark = [...history.map(h => h.nw), netWorth];
  const minNW = Math.min(...nwSpark), maxNW = Math.max(...nwSpark, 1);

  // Projected NW in 5/10 years
  const projNW = (yrs) => {
    const r = 0.10 / 12;
    const invAsset = assets.find(a => a.cat === "Investments");
    const inv = invAsset?.value ?? 0;
    return inv * Math.pow(1 + r, yrs * 12) + (totalAssets - inv) - totalLiab;
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", height: "calc(100vh - 138px)" }} className="fade-up">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", className: "rg-5", gap: "8px" }}>
        {[
          { l: "Net Worth", v: fmt(netWorth, sym), c: netWorth >= 0 ? "var(--acc)" : "var(--acc4)", big: true },
          { l: "Total Assets", v: fmt(totalAssets, sym), c: "var(--acc2)" },
          { l: "Total Liabilities", v: fmt(totalLiab, sym), c: "var(--acc4)" },
          { l: "D/A Ratio", v: `${totalAssets > 0 ? ((totalLiab / totalAssets) * 100).toFixed(1) : 0}%`, c: "var(--acc5)" },
          { l: "MoM Change", v: `${nwChange >= 0 ? "+" : ""}${fmt(nwChange, sym)}`, c: nwChange >= 0 ? "var(--acc)" : "var(--acc4)" },
        ].map(({ l, v, c, big }) => (
          <div key={l} className={`card${big ? " card-acc" : ""}`} style={{ padding: "12px" }}>
            <div className="lbl">{l}</div>
            <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: big ? "24px" : "18px", color: c, marginTop: "4px" }}>{v}</div>
          </div>
        ))}
      </div>
      {/* NW Trend */}
      <div className="card scan-wrap" style={{ padding: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span className="lbl">Net Worth Trend</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: nwChange >= 0 ? "var(--acc)" : "var(--acc4)" }}>{nwChange >= 0 ? "▲" : "▼"} {fmt(Math.abs(nwChange), sym)} this month</span>
        </div>
        <svg width="100%" height="80" viewBox={`0 0 ${nwSpark.length - 1} 80`} preserveAspectRatio="none">
          <defs><linearGradient id="nwg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00FF87" stopOpacity="0.2"/><stop offset="100%" stopColor="#00FF87" stopOpacity="0"/></linearGradient></defs>
          <polygon points={[`0,80`, ...nwSpark.map((v, i) => `${i},${80 - ((v - minNW) / (maxNW - minNW)) * 70}`), `${nwSpark.length - 1},80`].join(" ")} fill="url(#nwg)" />
          <polyline points={nwSpark.map((v, i) => `${i},${80 - ((v - minNW) / (maxNW - minNW)) * 70}`).join(" ")} fill="none" stroke="var(--acc)" strokeWidth="1.5" />
          {nwSpark.map((v, i) => <circle key={i} cx={i} cy={80 - ((v - minNW) / (maxNW - minNW)) * 70} r={i === nwSpark.length - 1 ? "2.5" : "1.2"} fill="var(--acc)" />)}
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
          {[...history.map(h => h.month), "Now"].map(m => <span key={m} style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--t3)" }}>{m}</span>)}
        </div>
      </div>
      {/* Projections */}
      <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
        {[1, 3, 5, 10].map(y => (
          <div key={y} className="card" style={{ padding: "12px" }}>
            <div className="lbl">Projected ({y}yr)</div>
            <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "18px", color: "var(--acc3)", marginTop: "4px" }}>{fmt(projNW(y), sym)}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {/* Assets */}
        <div className="card" style={{ padding: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}><span className="lbl">Assets</span><button className="btn" onClick={addAsset}>+ Add</button></div>
          <MiniDonut data={assets.filter(a => a.value > 0).map(a => ({ cat: a.cat, value: a.value, color: ["#00FF87","#60EFFF","#A78BFA","#FFD60A","#FF9F0A","#FB7185"][assets.indexOf(a) % 6] }))} size={100} />
          {assets.map((a, i) => (
            <div key={a.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 60px 24px", gap: "6px", alignItems: "center", padding: "5px 0", borderBottom: "1px solid var(--b1)" }} className="row-h">
              <input className="ti" value={a.name} onChange={e => updA(a.id, "name", e.target.value)} />
              <div style={{ display: "flex", gap: "2px" }}><span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)" }}>{sym}</span><input type="number" value={a.value} onChange={e => updA(a.id, "value", +e.target.value)} style={{ background: "transparent", border: "none", color: "var(--acc2)", fontFamily: "var(--font-mono)", fontSize: "11px", width: "75px", outline: "none" }} /></div>
              <div style={{ display: "flex", gap: "1px" }}><input type="number" value={a.growth} onChange={e => updA(a.id, "growth", +e.target.value)} style={{ background: "transparent", border: "none", color: a.growth >= 0 ? "var(--acc)" : "var(--acc4)", fontFamily: "var(--font-mono)", fontSize: "10px", width: "38px", outline: "none" }} /><span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)" }}>%</span></div>
              <button className="btn-del" onClick={() => delA(a.id)}>×</button>
            </div>
          ))}
        </div>
        {/* Liabilities */}
        <div className="card" style={{ padding: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}><span className="lbl">Liabilities</span><button className="btn" onClick={addLiab}>+ Add</button></div>
          {liabilities.map(l => {
            const r = l.rate / 100 / 12;
            const months = r > 0 && l.minPay > r * l.balance ? Math.ceil(-Math.log(1 - r * l.balance / l.minPay) / Math.log(1 + r)) : l.minPay > 0 ? Math.ceil(l.balance / l.minPay) : null;
            const totalInt = months ? l.minPay * months - l.balance : 0;
            return (
              <div key={l.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--b1)" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                  <input className="ti" value={l.name} onChange={e => updL(l.id, "name", e.target.value)} style={{ flex: 1, color: "var(--acc4)" }} />
                  <button className="btn-del" onClick={() => delL(l.id)}>×</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "6px" }}>
                  {[["Balance", l.balance, "balance", sym, "", "var(--acc4)"], ["Rate", l.rate, "rate", "", "%", "var(--acc5)"], ["Min Pay", l.minPay, "minPay", sym, "", "var(--t2)"]].map(([lbl, val, field, pre, suf, c]) => (
                    <div key={lbl}>
                      <div className="lbl">{lbl}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1px" }}>
                        {pre && <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)" }}>{pre}</span>}
                        <input type="number" value={val} onChange={e => updL(l.id, field, +e.target.value)} style={{ background: "transparent", border: "none", color: c, fontFamily: "var(--font-mono)", fontSize: "12px", width: "75px", outline: "none" }} />
                        {suf && <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)" }}>{suf}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                {months && <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)" }}>Payoff: <span style={{ color: "var(--acc5)" }}>{months}mo</span> · Interest: <span style={{ color: "var(--acc4)" }}>{fmt(totalInt, sym)}</span></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── FIRE MODULE ──────────────────────────────────────────────────────────────

function FIREModule({ currency }) {
  const sym = CURRENCIES[currency]?.sym ?? "$";
  const [portfolio, setPortfolio] = useState(50000);
  const [annIncome, setAnnIncome] = useState(60000);
  const [annExpenses, setAnnExpenses] = useState(40000);
  const [growthRate, setGrowthRate] = useState(10);
  const [wr, setWr] = useState(4);
  const [inflation, setInflation] = useState(3);
  const [age, setAge] = useState(25);
  const [sub, setSub] = useState("calculator");

  const fireNum = useMemo(() => (annExpenses * Math.pow(1 + inflation / 100, 10)) / (wr / 100), [annExpenses, wr, inflation]);
  const annSavings = annIncome - annExpenses;
  const savingsRate = annIncome > 0 ? (annSavings / annIncome) * 100 : 0;

  const proj = useMemo(() => {
    const r = growthRate / 100 / 12, mo = annSavings / 12;
    return Array.from({ length: 601 }, (_, m) => {
      const v = portfolio * Math.pow(1 + r, m) + (r > 0 ? mo * ((Math.pow(1 + r, m) - 1) / r) : mo * m);
      return { m, y: m / 12, age: age + m / 12, v };
    });
  }, [portfolio, annSavings, growthRate, age]);

  const yearlyProj = proj.filter(p => p.m % 12 === 0);
  const firePoint = proj.find(p => p.v >= fireNum);
  const maxV = Math.max(...yearlyProj.map(p => p.v), fireNum * 1.1, 1);

  // SWR analysis
  const swrRows = [3, 3.5, 4, 4.5, 5].map(rate => {
    const num = annExpenses / (rate / 100);
    const hit = proj.find(p => p.v >= num);
    return { rate, num, hit };
  });

  // Coast FIRE
  const coastRows = [55, 60, 65, 67, 70].map(retAge => {
    const yrsToRet = retAge - age;
    const coast = fireNum / Math.pow(1 + growthRate / 100, yrsToRet);
    const reached = portfolio >= coast;
    const yrToCoast = !reached ? (() => { for (let m = 0; m < 600; m++) { const r = growthRate / 100 / 12, mo = annSavings / 12; const v = portfolio * Math.pow(1 + r, m) + (r > 0 ? mo * ((Math.pow(1 + r, m) - 1) / r) : mo * m); if (v >= coast) return m / 12; } return null; })() : 0;
    return { retAge, coast, reached, yrToCoast };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 138px)", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: "4px", padding: "8px", borderBottom: "1px solid var(--b1)" }}>
        {[["calculator", "Calculator"], ["swr", "SWR Analysis"], ["coast", "Coast FIRE"], ["scenarios", "Scenarios"]].map(([id, l]) => (
          <button key={id} className={`subtab${sub === id ? " on" : ""}`} onClick={() => setSub(id)}>{l}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {sub === "calculator" && (
          <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {[
                { l: "Current Portfolio", v: portfolio, set: setPortfolio, pre: sym },
                { l: "Annual Income", v: annIncome, set: setAnnIncome, pre: sym },
                { l: "Annual Expenses", v: annExpenses, set: setAnnExpenses, pre: sym },
                { l: "Expected Return", v: growthRate, set: setGrowthRate, suf: "% p.a." },
                { l: "Withdrawal Rate", v: wr, set: setWr, suf: "%" },
                { l: "Inflation Rate", v: inflation, set: setInflation, suf: "%" },
                { l: "Current Age", v: age, set: setAge, suf: "yrs" },
              ].map(({ l, v, set, pre, suf }) => (
                <div key={l} className="card" style={{ padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="lbl">{l}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    {pre && <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--t3)" }}>{pre}</span>}
                    <input type="number" value={v} onChange={e => set(+e.target.value)} style={{ background: "transparent", border: "none", color: "var(--t1)", fontFamily: "var(--font-mono)", fontSize: "14px", width: "90px", textAlign: "right", outline: "none" }} />
                    {suf && <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)" }}>{suf}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                {[
                  { l: "FIRE Number", v: fmt(fireNum, sym), c: "var(--acc)", sub: `${wr}% SWR on inflated expenses` },
                  { l: "Years to FIRE", v: firePoint ? `${firePoint.y.toFixed(1)} yrs` : "50+ yrs", c: firePoint ? "var(--acc)" : "var(--t3)", sub: firePoint ? `Age ${firePoint.age.toFixed(0)}` : "Increase savings rate" },
                  { l: "Annual Savings", v: fmt(annSavings, sym), c: annSavings > 0 ? "var(--acc2)" : "var(--acc4)", sub: `${savingsRate.toFixed(1)}% of income` },
                  { l: "Monthly Passive", v: fmt(fireNum * (wr / 100) / 12, sym), c: "var(--acc5)", sub: "At withdrawal rate" },
                ].map(({ l, v, c, sub: s }) => (
                  <div key={l} className={`card${l === "FIRE Number" ? " card-acc" : ""}`} style={{ padding: "14px" }}>
                    <div className="lbl">{l}</div>
                    <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "22px", color: c, marginTop: "4px" }}>{v}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)", marginTop: "3px" }}>{s}</div>
                  </div>
                ))}
              </div>
              <div className="card scan-wrap" style={{ padding: "14px", flex: 1 }}>
                <div className="lbl" style={{ marginBottom: "8px" }}>Path to FIRE</div>
                <svg width="100%" height="190" viewBox={`0 0 50 190`} preserveAspectRatio="none">
                  <defs><linearGradient id="fg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00FF87" stopOpacity="0.2"/><stop offset="100%" stopColor="#00FF87" stopOpacity="0"/></linearGradient></defs>
                  <line x1="0" y1={190 - (fireNum / maxV) * 175} x2="50" y2={190 - (fireNum / maxV) * 175} stroke="var(--acc4)" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.7" />
                  <polygon points={[`0,190`, ...yearlyProj.slice(0, 51).map(p => `${p.y},${190 - (p.v / maxV) * 175}`), `50,190`].join(" ")} fill="url(#fg2)" />
                  <polyline points={yearlyProj.slice(0, 51).map(p => `${p.y},${190 - (p.v / maxV) * 175}`).join(" ")} fill="none" stroke="var(--acc)" strokeWidth="1.5" />
                  {firePoint && firePoint.y <= 50 && <circle cx={firePoint.y} cy={190 - (firePoint.v / maxV) * 175} r="3" fill="var(--acc)" style={{ filter: "drop-shadow(0 0 4px #00FF87)" }} />}
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  {[0, 10, 20, 30, 40, 50].map(y => <span key={y} style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--t3)" }}>Yr{y}</span>)}
                </div>
                {firePoint && <div style={{ marginTop: "8px", padding: "8px 12px", background: "#00FF8710", border: "1px solid #00FF8725", borderRadius: "3px", fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--acc)" }}>🎯 FIRE at age {firePoint.age.toFixed(0)} — Year {firePoint.y.toFixed(1)}</div>}
              </div>
            </div>
          </div>
        )}
        {sub === "swr" && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="card" style={{ padding: "14px" }}>
              <div className="lbl" style={{ marginBottom: "10px" }}>Safe Withdrawal Rate Analysis</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["SWR", "FIRE Number", "Reached Year", "Age", "Monthly Income", "Safety"].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
                <tbody>
                  {swrRows.map(row => (
                    <tr key={row.rate} className="row-h" style={{ background: row.rate === 4 ? "#00FF8708" : "" }}>
                      <td className="td td-acc">{row.rate}%</td>
                      <td className="td">{fmt(row.num, sym)}</td>
                      <td className="td" style={{ color: row.hit ? "var(--acc)" : "var(--acc4)" }}>{row.hit ? `Yr ${Math.ceil(row.hit.y)}` : "Not reached"}</td>
                      <td className="td td-b">{row.hit ? row.hit.age.toFixed(0) : "—"}</td>
                      <td className="td td-y">{fmt(row.num * row.rate / 100 / 12, sym)}</td>
                      <td className="td" style={{ color: row.rate <= 3.5 ? "var(--acc)" : row.rate <= 4 ? "var(--acc5)" : "var(--acc4)" }}>{row.rate <= 3.5 ? "Very Safe" : row.rate <= 4 ? "Safe" : row.rate <= 4.5 ? "Moderate" : "Aggressive"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {sub === "coast" && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)", lineHeight: 1.6, padding: "10px", background: "var(--s1)", borderRadius: "3px", border: "1px solid var(--b1)" }}>
              Coast FIRE: the portfolio value at which, even if you stop contributing, your investments will grow to your FIRE number by retirement age.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", className: "rg-5", gap: "8px" }}>
              {coastRows.map(row => (
                <div key={row.retAge} className={`card${row.reached ? " card-acc" : ""}`} style={{ padding: "12px" }}>
                  <div className="lbl">Retire {row.retAge}</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "18px", color: row.reached ? "var(--acc)" : "var(--t2)", marginTop: "4px" }}>{fmt(row.coast, sym)}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: row.reached ? "var(--acc)" : "var(--t3)", marginTop: "4px" }}>
                    {row.reached ? "✓ Already coasted!" : row.yrToCoast ? `${row.yrToCoast.toFixed(1)}yr to coast` : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {sub === "scenarios" && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="card" style={{ padding: "14px" }}>
              <div className="lbl" style={{ marginBottom: "10px" }}>Scenario Comparison</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Scenario", "Return", "FIRE Number", "Years to FIRE", "Age at FIRE"].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
                <tbody>
                  {[["Conservative", 7, 0.9], ["Base Case", 10, 1.0], ["Optimistic", 13, 1.05], ["Aggressive", 16, 1.1]].map(([name, ret, expMult]) => {
                    const fn = annExpenses * expMult / (wr / 100);
                    const r = ret / 100 / 12, mo = annSavings / 12;
                    let hit = null;
                    for (let m = 0; m < 600; m++) {
                      const v = portfolio * Math.pow(1 + r, m) + (r > 0 ? mo * ((Math.pow(1 + r, m) - 1) / r) : mo * m);
                      if (v >= fn) { hit = { y: m / 12, age: age + m / 12 }; break; }
                    }
                    return (
                      <tr key={name} className="row-h">
                        <td className="td td-acc">{name}</td>
                        <td className="td">{ret}%</td>
                        <td className="td">{fmt(fn, sym)}</td>
                        <td className="td" style={{ color: hit ? "var(--acc)" : "var(--acc4)" }}>{hit ? `${hit.y.toFixed(1)} yrs` : "50+ yrs"}</td>
                        <td className="td td-b">{hit ? hit.age.toFixed(0) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAX MODULE ───────────────────────────────────────────────────────────────

function TaxModule({ currency }) {
  const sym = CURRENCIES[currency]?.sym ?? "$";
  const [portfolio, setPortfolio] = useState(50000);
  const [annGain, setAnnGain] = useState(12);
  const [divYield, setDivYield] = useState(3);
  const [marginalRate, setMarginalRate] = useState(32.5);
  const [holdYears, setHoldYears] = useState(5);
  const [cgtDiscount, setCgtDiscount] = useState(true);

  const grossGain = portfolio * annGain / 100;
  const grossDiv = portfolio * divYield / 100;
  const effectiveCGT = cgtDiscount ? marginalRate * 0.5 : marginalRate;
  const taxOnGains = grossGain * effectiveCGT / 100;
  const taxOnDiv = grossDiv * marginalRate / 100;
  const netReturn = grossGain + grossDiv - taxOnGains - taxOnDiv;
  const netPct = portfolio > 0 ? (netReturn / portfolio) * 100 : 0;

  const rows = [15, 19, 32.5, 37, 45].map(rate => {
    const effCGT = cgtDiscount ? rate * 0.5 : rate;
    const tGain = grossGain * effCGT / 100;
    const tDiv = grossDiv * rate / 100;
    const net = grossGain + grossDiv - tGain - tDiv;
    return { rate, effCGT, tGain, tDiv, net, netPct: (net / portfolio) * 100 };
  });

  const fiveYearRows = [1, 2, 3, 5, 10].map(y => {
    const gross = portfolio * Math.pow(1 + annGain / 100, y) - portfolio;
    const effCGT = cgtDiscount ? marginalRate * 0.5 : marginalRate;
    const tax = gross * effCGT / 100;
    const net = gross - tax;
    return { y, gross, tax, net };
  });

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", height: "calc(100vh - 138px)" }} className="fade-up">
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          {[
            { l: "Portfolio Value", v: portfolio, set: setPortfolio, pre: sym },
            { l: "Annual Growth Rate", v: annGain, set: setAnnGain, suf: "%" },
            { l: "Dividend Yield", v: divYield, set: setDivYield, suf: "%" },
            { l: "Marginal Tax Rate", v: marginalRate, set: setMarginalRate, suf: "%" },
          ].map(({ l, v, set, pre, suf }) => (
            <div key={l} className="card" style={{ padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="lbl">{l}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                {pre && <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--t3)" }}>{pre}</span>}
                <input type="number" value={v} onChange={e => set(+e.target.value)} style={{ background: "transparent", border: "none", color: "var(--t1)", fontFamily: "var(--font-mono)", fontSize: "14px", width: "80px", textAlign: "right", outline: "none" }} />
                {suf && <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)" }}>{suf}</span>}
              </div>
            </div>
          ))}
          <div className="card" style={{ padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="lbl">CGT 50% Discount</span>
            <span onClick={() => setCgtDiscount(p => !p)} style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: cgtDiscount ? "var(--acc)" : "var(--t3)", cursor: "pointer", padding: "3px 8px", border: `1px solid ${cgtDiscount ? "var(--acc)40" : "var(--b2)"}`, borderRadius: "2px" }}>{cgtDiscount ? "ON (>12mo)" : "OFF"}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {[
              { l: "Gross Annual Gain", v: fmt(grossGain, sym), c: "var(--acc2)" },
              { l: "Tax on Gains", v: fmt(taxOnGains, sym), c: "var(--acc4)" },
              { l: "Net Return", v: fmt(netReturn, sym), c: "var(--acc)" },
              { l: "Net Return %", v: `${netPct.toFixed(2)}%`, c: "var(--acc3)" },
            ].map(({ l, v, c }) => (
              <div key={l} className="card" style={{ padding: "12px" }}>
                <div className="lbl">{l}</div>
                <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "20px", color: c, marginTop: "4px" }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: "14px" }}>
            <div className="lbl" style={{ marginBottom: "8px" }}>After-Tax Return by Marginal Rate</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Tax Rate", "Eff. CGT", "Tax on Gains", "Tax on Div", "Net Return", "Net %"].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.rate} className="row-h" style={{ background: row.rate === marginalRate ? "#00FF8708" : "" }}>
                    <td className="td" style={{ color: row.rate === marginalRate ? "var(--acc)" : "var(--t2)" }}>{row.rate}%{row.rate === marginalRate ? " ◀" : ""}</td>
                    <td className="td td-y">{row.effCGT.toFixed(1)}%</td>
                    <td className="td td-r">{fmt(row.tGain, sym)}</td>
                    <td className="td td-r">{fmt(row.tDiv, sym)}</td>
                    <td className="td td-acc">{fmt(row.net, sym)}</td>
                    <td className="td td-b">{row.netPct.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card" style={{ padding: "14px" }}>
            <div className="lbl" style={{ marginBottom: "8px" }}>Capital Gains Tax Over Time</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Hold Period", "Gross Gain", "CGT", "Net Gain", "Saved vs No Discount"].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody>
                {fiveYearRows.map(row => {
                  const noDisc = row.gross * marginalRate / 100;
                  return (
                    <tr key={row.y} className="row-h">
                      <td className="td td-acc">{row.y}yr</td>
                      <td className="td td-b">{fmt(row.gross, sym)}</td>
                      <td className="td td-r">{fmt(row.tax, sym)}</td>
                      <td className="td td-acc">{fmt(row.net, sym)}</td>
                      <td className="td" style={{ color: "var(--acc5)" }}>{cgtDiscount ? fmt(noDisc - row.tax, sym) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REBALANCER MODULE ────────────────────────────────────────────────────────

function RebalancerModule({ currency }) {
  const sym = CURRENCIES[currency]?.sym ?? "$";
  const [holdings, setHoldings] = useState([
    { id: 1, ticker: "QQQ", current: 8000, target: 40 },
    { id: 2, ticker: "VOO", current: 7000, target: 35 },
    { id: 3, ticker: "VGS", current: 6500, target: 25 },
  ]);
  const [threshold, setThreshold] = useState(5);
  const [newCash, setNewCash] = useState(0);

  const total = useMemo(() => holdings.reduce((a, h) => a + (h.current || 0), 0) + newCash, [holdings, newCash]);
  const targetTotal = holdings.reduce((a, h) => a + (h.target || 0), 0);

  const calcRebal = h => {
    const currentPct = total > 0 ? (h.current / total) * 100 : 0;
    const drift = currentPct - h.target;
    const targetVal = total * (h.target / 100);
    const action = targetVal - h.current;
    return { currentPct, drift, targetVal, action };
  };

  const addHolding = () => setHoldings(p => [...p, { id: Date.now(), ticker: "VTI", current: 0, target: 0 }]);
  const delH = id => setHoldings(p => p.filter(h => h.id !== id));
  const updH = (id, f, v) => setHoldings(p => p.map(h => h.id === id ? { ...h, [f]: v } : h));

  const needsRebal = holdings.some(h => Math.abs(calcRebal(h).drift) > threshold);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", height: "calc(100vh - 138px)" }} className="fade-up">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
        {[
          { l: "Portfolio Total", v: fmt(total, sym), c: "var(--acc)" },
          { l: "Target Allocation", v: `${targetTotal}%`, c: targetTotal === 100 ? "var(--acc)" : "var(--acc4)" },
          { l: "Rebal Threshold", v: `±${threshold}%`, c: "var(--acc5)" },
          { l: "Status", v: needsRebal ? "⚠ DRIFT" : "✓ BALANCED", c: needsRebal ? "var(--acc4)" : "var(--acc)" },
        ].map(({ l, v, c }) => (
          <div key={l} className={`card${l === "Status" ? (needsRebal ? " card-r" : " card-acc") : ""}`} style={{ padding: "12px" }}>
            <div className="lbl">{l}</div>
            <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "20px", color: c, marginTop: "4px" }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div className="card" style={{ padding: "12px" }}>
            <div className="lbl" style={{ marginBottom: "6px" }}>Drift Threshold</div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input type="range" min="1" max="15" value={threshold} onChange={e => setThreshold(+e.target.value)} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--acc5)", width: "30px" }}>±{threshold}%</span>
            </div>
          </div>
          <div className="card" style={{ padding: "12px" }}>
            <div className="lbl" style={{ marginBottom: "6px" }}>New Cash to Deploy</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--t3)" }}>{sym}</span>
              <input className="ni" type="number" value={newCash} onChange={e => setNewCash(+e.target.value)} style={{ fontSize: "18px", color: "var(--acc2)" }} />
            </div>
          </div>
          <button className="btn" onClick={addHolding}>+ Add Holding</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div className="card" style={{ padding: "14px" }}>
            <div className="lbl" style={{ marginBottom: "10px" }}>Portfolio Holdings & Drift</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["ETF", "Current Value", "Current %", "Target %", "Drift", "Action", "Amount", ""].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody>
                {holdings.map(h => {
                  const { currentPct, drift, targetVal, action } = calcRebal(h);
                  const over = Math.abs(drift) > threshold;
                  return (
                    <tr key={h.id} className="row-h" style={{ background: over ? (drift > 0 ? "#FF4D6D08" : "#00FF8708") : "" }}>
                      <td className="td">
                        <select className="si" value={h.ticker} onChange={e => updH(h.id, "ticker", e.target.value)}>
                          {ETFs.map(e => <option key={e.ticker} value={e.ticker}>{e.ticker}</option>)}
                        </select>
                      </td>
                      <td className="td"><div style={{ display: "flex", gap: "1px" }}><span style={{ color: "var(--t3)", fontSize: "9px" }}>{sym}</span><input type="number" value={h.current} onChange={e => updH(h.id, "current", +e.target.value)} style={{ background: "transparent", border: "none", color: "var(--t1)", fontFamily: "var(--font-mono)", fontSize: "11px", width: "80px", outline: "none" }} /></div></td>
                      <td className="td" style={{ color: "var(--t2)" }}>{currentPct.toFixed(1)}%</td>
                      <td className="td"><div style={{ display: "flex", gap: "1px" }}><input type="number" value={h.target} onChange={e => updH(h.id, "target", +e.target.value)} style={{ background: "transparent", border: "none", color: "var(--acc3)", fontFamily: "var(--font-mono)", fontSize: "11px", width: "40px", outline: "none" }} /><span style={{ color: "var(--t3)", fontSize: "9px" }}>%</span></div></td>
                      <td className="td" style={{ color: over ? (drift > 0 ? "var(--acc4)" : "var(--acc)") : "var(--t3)" }}>{drift > 0 ? "+" : ""}{drift.toFixed(1)}%{over ? " ⚠" : ""}</td>
                      <td className="td" style={{ color: action >= 0 ? "var(--acc)" : "var(--acc4)" }}>{action >= 0 ? "BUY" : "SELL"}</td>
                      <td className="td" style={{ color: action >= 0 ? "var(--acc)" : "var(--acc4)" }}>{fmt(Math.abs(action), sym)}</td>
                      <td className="td"><button className="btn-del" onClick={() => delH(h.id)}>×</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Visual allocation */}
          <div className="card" style={{ padding: "14px" }}>
            <div className="lbl" style={{ marginBottom: "10px" }}>Current vs Target Allocation</div>
            {holdings.map(h => {
              const { currentPct, drift } = calcRebal(h);
              const etf = ETFs.find(e => e.ticker === h.ticker);
              return (
                <div key={h.id} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: etf?.color ?? "var(--t2)" }}>{h.ticker}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)" }}>Current {currentPct.toFixed(1)}% · Target {h.target}%</span>
                  </div>
                  <div style={{ position: "relative", height: "8px", background: "var(--b1)", borderRadius: "4px", overflow: "visible" }}>
                    <div style={{ position: "absolute", height: "100%", width: `${Math.min(currentPct, 100)}%`, background: etf?.color ?? "var(--acc)", borderRadius: "4px", opacity: 0.8 }} />
                    <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: `${Math.min(h.target, 100)}%`, width: "2px", height: "14px", background: "var(--t1)", opacity: 0.6 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CRASH SIMULATOR ─────────────────────────────────────────────────────────

const CRASHES = [
  { name: "Black Monday 1987",  year: 1987, drop: -34, recovery: 24 },
  { name: "Dot-com Crash 2000", year: 2000, drop: -49, recovery: 84 },
  { name: "GFC 2008",           year: 2008, drop: -57, recovery: 54 },
  { name: "COVID Crash 2020",   year: 2020, drop: -34, recovery: 6  },
  { name: "2022 Bear Market",   year: 2022, drop: -25, recovery: 18 },
  { name: "Flash Crash 2010",   year: 2010, drop: -7,  recovery: 1  },
];

function CrashSimModule({ currency }) {
  const sym = CURRENCIES[currency]?.sym ?? "$";
  const [portfolio, setPortfolio] = useState(50000);
  const [crash, setCrash] = useState(CRASHES[2]);
  const [monthlyDCA, setMonthlyDCA] = useState(500);

  const afterCrash = portfolio * (1 + crash.drop / 100);
  const loss = portfolio - afterCrash;

  const path = useMemo(() => {
    const pts = [portfolio];
    let v = afterCrash;
    const ratePerMo = Math.pow(1.10, 1 / 12) - 1;
    for (let m = 1; m <= crash.recovery + 24; m++) {
      v = v * (1 + ratePerMo) + monthlyDCA;
      pts.push(v);
    }
    return pts;
  }, [portfolio, afterCrash, crash, monthlyDCA]);

  const maxP = Math.max(...path);
  const minP = Math.min(...path);
  const recovered = path[crash.recovery] ?? path[path.length - 1];
  const bonus = recovered - portfolio;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", height: "calc(100vh - 138px)" }} className="fade-up mob-scroll">
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "12px" }}>

        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div className="card" style={{ padding: "14px" }}>
            <div className="lbl" style={{ marginBottom: "10px" }}>Select Crash Event</div>
            {CRASHES.map(cr => (
              <div
                key={cr.name}
                onClick={() => setCrash(cr)}
                style={{ padding: "8px 10px", borderRadius: "3px", cursor: "pointer", marginBottom: "4px", background: crash.name === cr.name ? "var(--s3)" : "transparent", border: `1px solid ${crash.name === cr.name ? "var(--b3)" : "transparent"}` }}
              >
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: crash.name === cr.name ? "var(--acc)" : "var(--t2)" }}>{cr.name}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--acc4)" }}>{cr.drop}% drop · {cr.recovery}mo recovery</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: "12px" }}>
            <div className="lbl" style={{ marginBottom: "6px" }}>Portfolio Value</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--t3)" }}>{sym}</span>
              <input
                className="ni"
                type="number"
                value={portfolio}
                onChange={e => setPortfolio(+e.target.value)}
                style={{ fontSize: "22px", color: "var(--acc)" }}
              />
            </div>
          </div>

          <div className="card" style={{ padding: "12px" }}>
            <div className="lbl" style={{ marginBottom: "6px" }}>Monthly DCA During Crash</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--t3)" }}>{sym}</span>
              <input
                className="ni"
                type="number"
                value={monthlyDCA}
                onChange={e => setMonthlyDCA(+e.target.value)}
                style={{ fontSize: "22px", color: "var(--acc2)" }}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
            {[
              { l: "Before Crash",       v: fmt(portfolio, sym),   c: "var(--acc2)" },
              { l: `After ${Math.abs(crash.drop)}% Drop`, v: fmt(afterCrash, sym), c: "var(--acc4)" },
              { l: "Paper Loss",         v: fmt(loss, sym),        c: "var(--acc4)" },
              { l: "Recovery Time",      v: `${crash.recovery}mo`, c: "var(--acc5)" },
              { l: "Value at Recovery",  v: fmt(recovered, sym),   c: "var(--acc)"  },
              { l: "DCA Upside",         v: `${bonus >= 0 ? "+" : ""}${fmt(bonus, sym)}`, c: bonus >= 0 ? "var(--acc)" : "var(--acc4)" },
            ].map(({ l, v, c }) => (
              <div key={l} className="card" style={{ padding: "12px" }}>
                <div className="lbl">{l}</div>
                <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "18px", color: c, marginTop: "4px" }}>{v}</div>
              </div>
            ))}
          </div>

          <div className="card scan-wrap" style={{ padding: "14px", flex: 1 }}>
            <div className="lbl" style={{ marginBottom: "10px" }}>Recovery Simulation — {crash.name}</div>
            <svg width="100%" height="180" viewBox={`0 0 ${path.length - 1} 180`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="crUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00FF87" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#00FF87" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="crDn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4D6D" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#FF4D6D" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Original value line */}
              <line
                x1="0" y1={180 - ((portfolio - minP) / (maxP - minP)) * 165}
                x2={path.length - 1} y2={180 - ((portfolio - minP) / (maxP - minP)) * 165}
                stroke="var(--t3)" strokeWidth="0.6" strokeDasharray="3,3"
              />
              {/* Path area */}
              <polygon
                points={[`0,180`, ...path.map((v, i) => `${i},${180 - ((v - minP) / (maxP - minP)) * 165}`), `${path.length - 1},180`].join(" ")}
                fill={path[path.length - 1] >= portfolio ? "url(#crUp)" : "url(#crDn)"}
              />
              <polyline
                points={path.map((v, i) => `${i},${180 - ((v - minP) / (maxP - minP)) * 165}`).join(" ")}
                fill="none"
                stroke={path[path.length - 1] >= portfolio ? "var(--acc)" : "var(--acc4)"}
                strokeWidth="1.5"
              />
              {/* Crash point dot */}
              <circle cx={0} cy={180 - ((afterCrash - minP) / (maxP - minP)) * 165} r="3" fill="var(--acc4)" />
            </svg>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)", marginTop: "8px" }}>
              Key insight: staying invested + DCA during downturns dramatically accelerates recovery.
            </div>
          </div>
        </div>
      </div>

      {/* Crash comparison table */}
      <div className="card" style={{ padding: "14px" }}>
        <div className="lbl" style={{ marginBottom: "10px" }}>All Crash Scenarios — Your Portfolio</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Event", "Drop", "Value After Drop", "Loss", "Recovery", "Value at Recovery", "DCA Bonus"].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CRASHES.map(cr => {
              const after = portfolio * (1 + cr.drop / 100);
              const rr = Math.pow(1.10, 1 / 12) - 1;
              let v = after;
              for (let m = 0; m < cr.recovery; m++) {
                v = v * (1 + rr) + monthlyDCA;
              }
              return (
                <tr key={cr.name} className="row-h" style={{ background: crash.name === cr.name ? "var(--s3)" : "" }}>
                  <td className="td td-acc">{cr.name}</td>
                  <td className="td" style={{ color: "var(--acc4)" }}>{cr.drop}%</td>
                  <td className="td" style={{ color: "var(--acc4)" }}>{fmt(after, sym)}</td>
                  <td className="td" style={{ color: "var(--acc4)" }}>{fmt(portfolio - after, sym)}</td>
                  <td className="td" style={{ color: "var(--acc5)" }}>{cr.recovery}mo</td>
                  <td className="td" style={{ color: v >= portfolio ? "var(--acc)" : "var(--acc4)" }}>{fmt(v, sym)}</td>
                  <td className="td" style={{ color: "var(--acc3)" }}>{fmt(v - portfolio, sym)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── LOAN PAYOFF MODULE ───────────────────────────────────────────────────────

function LoanModule({ currency }) {
  const sym = CURRENCIES[currency]?.sym ?? "$";
  const [loans, setLoans] = useState([
    { id: 1, name: "Student Loan", balance: 25000, rate: 5.5,  minPay: 300, extra: 0 },
    { id: 2, name: "Credit Card",  balance: 3500,  rate: 19.99, minPay: 100, extra: 0 },
    { id: 3, name: "Car Loan",     balance: 12000, rate: 7.9,  minPay: 250, extra: 0 },
  ]);
  const [strategy, setStrategy] = useState("avalanche");

  const addLoan = () => setLoans(p => [...p, { id: Date.now(), name: "New Loan", balance: 10000, rate: 6.0, minPay: 150, extra: 0 }]);
  const delLoan = id => setLoans(p => p.filter(l => l.id !== id));
  const updL = (id, f, v) => setLoans(p => p.map(l => l.id === id ? { ...l, [f]: v } : l));

  const calcPayoff = (loan) => {
    const r = loan.rate / 100 / 12;
    const pay = loan.minPay + (loan.extra || 0);
    if (r === 0) return { months: Math.ceil(loan.balance / pay), totalInt: 0 };
    if (pay <= r * loan.balance) return { months: 999, totalInt: 999999 };
    const months = Math.ceil(-Math.log(1 - r * loan.balance / pay) / Math.log(1 + r));
    return { months, totalInt: pay * months - loan.balance };
  };

  const totalDebt = loans.reduce((a, l) => a + l.balance, 0);
  const totalMinPay = loans.reduce((a, l) => a + l.minPay, 0);
  const totalInt = loans.reduce((a, l) => a + calcPayoff(l).totalInt, 0);
  const ordered = strategy === "avalanche"
    ? [...loans].sort((a, b) => b.rate - a.rate)
    : [...loans].sort((a, b) => a.balance - b.balance);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", height: "calc(100vh - 138px)" }} className="fade-up mob-scroll">
      <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
        {[
          { l: "Total Debt",      v: fmt(totalDebt, sym),    c: "var(--acc4)" },
          { l: "Min Payments/mo", v: fmt(totalMinPay, sym),  c: "var(--acc5)" },
          { l: "Total Interest",  v: totalInt < 999999 ? fmt(totalInt, sym) : "∞", c: "var(--acc4)" },
          { l: "Loans Tracked",   v: loans.length.toString(), c: "var(--t1)" },
        ].map(({ l, v, c }) => (
          <div key={l} className="card" style={{ padding: "12px" }}>
            <div className="lbl">{l}</div>
            <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "22px", color: c, marginTop: "4px" }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span className="lbl">Strategy:</span>
        {[["avalanche", "Avalanche — Highest Rate First"], ["snowball", "Snowball — Lowest Balance First"]].map(([id, label]) => (
          <button key={id} className={`subtab${strategy === id ? " on" : ""}`} onClick={() => setStrategy(id)}>{label}</button>
        ))}
      </div>

      <div className="card" style={{ padding: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span className="lbl">Loan Tracker</span>
          <button className="btn-ghost" onClick={addLoan}>+ Add Loan</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name", "Balance", "Rate", "Min Pay", "Extra Pay", "Total Interest", "Payoff", "Savings vs Min", ""].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loans.map(l => {
              const base = calcPayoff({ ...l, extra: 0 });
              const withExtra = calcPayoff(l);
              const saving = base.totalInt - withExtra.totalInt;
              const moSaved = base.months - withExtra.months;
              return (
                <tr key={l.id} className="row-h">
                  <td className="td"><input className="ti" value={l.name} onChange={e => updL(l.id, "name", e.target.value)} /></td>
                  <td className="td">
                    <div style={{ display: "flex", gap: "2px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)" }}>{sym}</span>
                      <input type="number" value={l.balance} onChange={e => updL(l.id, "balance", +e.target.value)} style={{ background: "transparent", border: "none", color: "var(--acc4)", fontFamily: "var(--font-mono)", fontSize: "11px", width: "70px", outline: "none" }} />
                    </div>
                  </td>
                  <td className="td">
                    <div style={{ display: "flex", gap: "1px" }}>
                      <input type="number" value={l.rate} onChange={e => updL(l.id, "rate", +e.target.value)} style={{ background: "transparent", border: "none", color: "var(--acc5)", fontFamily: "var(--font-mono)", fontSize: "11px", width: "45px", outline: "none" }} />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)" }}>%</span>
                    </div>
                  </td>
                  <td className="td">
                    <div style={{ display: "flex", gap: "2px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)" }}>{sym}</span>
                      <input type="number" value={l.minPay} onChange={e => updL(l.id, "minPay", +e.target.value)} style={{ background: "transparent", border: "none", color: "var(--t2)", fontFamily: "var(--font-mono)", fontSize: "11px", width: "60px", outline: "none" }} />
                    </div>
                  </td>
                  <td className="td">
                    <div style={{ display: "flex", gap: "2px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)" }}>{sym}</span>
                      <input type="number" value={l.extra} onChange={e => updL(l.id, "extra", +e.target.value)} style={{ background: "transparent", border: "none", color: "var(--acc)", fontFamily: "var(--font-mono)", fontSize: "11px", width: "60px", outline: "none" }} />
                    </div>
                  </td>
                  <td className="td" style={{ color: "var(--acc4)" }}>{withExtra.totalInt < 999999 ? fmt(withExtra.totalInt, sym) : "Never"}</td>
                  <td className="td" style={{ color: "var(--acc5)" }}>{withExtra.months < 999 ? `${withExtra.months}mo` : "Never"}</td>
                  <td className="td" style={{ color: "var(--acc)" }}>{l.extra > 0 && saving > 0 ? `${fmt(saving, sym)} / ${moSaved}mo faster` : "—"}</td>
                  <td className="td"><button className="btn-danger" onClick={() => delLoan(l.id)}>×</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: "14px" }}>
        <div className="lbl" style={{ marginBottom: "10px" }}>{strategy === "avalanche" ? "Avalanche" : "Snowball"} Payoff Order</div>
        {ordered.map((l, i) => {
          const { months } = calcPayoff(l);
          const pct = Math.min((l.balance / totalDebt) * 100, 100);
          return (
            <div key={l.id} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--acc)" }}>{i + 1}. {l.name}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)" }}>{l.rate}% · {months < 999 ? `${months}mo` : "∞"}</span>
              </div>
              <div style={{ height: "5px", background: "var(--b1)", borderRadius: "3px" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: `hsl(${130 - i * 35}, 75%, 55%)`, borderRadius: "3px" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── INCOME STREAMS MODULE ────────────────────────────────────────────────────

const INCOME_TYPES = ["Salary", "Freelance", "Dividends", "Rental", "Business", "Side Hustle", "Royalties", "Other"];

function IncomeModule({ currency }) {
  const sym = CURRENCIES[currency]?.sym ?? "$";
  const [streams, setStreams] = useState([
    { id: 1, name: "Day Job",        type: "Salary",     amount: 5000, freq: "monthly", active: true,  growth: 3  },
    { id: 2, name: "Freelance",      type: "Freelance",  amount: 800,  freq: "monthly", active: true,  growth: 10 },
    { id: 3, name: "ETF Dividends",  type: "Dividends",  amount: 120,  freq: "monthly", active: true,  growth: 12 },
    { id: 4, name: "Rental Income",  type: "Rental",     amount: 0,    freq: "monthly", active: false, growth: 3  },
  ]);
  const [target, setTarget] = useState(10000);
  const [projYears, setProjYears] = useState(10);

  const addStream = () => setStreams(p => [...p, { id: Date.now(), name: "New Stream", type: "Other", amount: 0, freq: "monthly", active: true, growth: 5 }]);
  const delStream = id => setStreams(p => p.filter(s => s.id !== id));
  const updS = (id, f, v) => setStreams(p => p.map(s => s.id === id ? { ...s, [f]: v } : s));
  const toMonthly = s => s.freq === "annual" ? s.amount / 12 : s.freq === "weekly" ? s.amount * 4.33 : s.amount;

  const active = streams.filter(s => s.active);
  const totalMo = active.reduce((a, s) => a + toMonthly(s), 0);
  const prog = Math.min((totalMo / target) * 100, 100);

  const projTotal = (yrs) => active.reduce((a, s) => {
    const mo = toMonthly(s);
    const g = s.growth / 100 || 0.001;
    return a + mo * 12 * ((Math.pow(1 + g, yrs) - 1) / g);
  }, 0);

  const typeColors = ["#00FF87", "#60EFFF", "#A78BFA", "#FBBF24", "#FB7185", "#34D399", "#F472B6", "#FDE68A"];
  const byType = active.reduce((a, s) => {
    a[s.type] = (a[s.type] || 0) + toMonthly(s);
    return a;
  }, {});

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", height: "calc(100vh - 138px)" }} className="fade-up mob-scroll">
      <div className="rg-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
        {[
          { l: "Total Monthly",    v: fmt(totalMo, sym),           c: "var(--acc)"  },
          { l: "Active Streams",   v: `${active.length} / ${streams.length}`, c: "var(--acc2)" },
          { l: "Annual Income",    v: fmt(totalMo * 12, sym),      c: "var(--acc3)" },
          { l: `Projected (${projYears}yr)`, v: fmt(projTotal(projYears), sym), c: "var(--acc5)", sub: "cumulative with growth" },
        ].map(({ l, v, c }) => (
          <div key={l} className="card" style={{ padding: "12px", borderColor: l === "Total Monthly" ? "var(--acc-dim)" : "var(--b1)" }}>
            <div className="lbl">{l}</div>
            <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "20px", color: c, marginTop: "4px" }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Target progress */}
      <div className="card" style={{ padding: "14px", borderColor: "#00FF8725" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span className="lbl">Monthly Income Target</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--t3)" }}>{sym}</span>
            <input
              type="number"
              value={target}
              onChange={e => setTarget(+e.target.value)}
              style={{ background: "transparent", border: "none", color: "var(--acc)", fontFamily: "var(--font-mono)", fontSize: "16px", width: "100px", textAlign: "right", outline: "none" }}
            />
          </div>
        </div>
        <div style={{ height: "8px", background: "var(--b1)", borderRadius: "4px", overflow: "hidden", marginBottom: "6px" }}>
          <div style={{ height: "100%", width: `${prog}%`, background: "linear-gradient(90deg, var(--acc2), var(--acc))", borderRadius: "4px", transition: "width 0.5s", boxShadow: prog >= 100 ? "0 0 10px var(--acc)" : "" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--acc)" }}>{prog.toFixed(1)}% of target</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--t3)" }}>{fmt(Math.max(target - totalMo, 0), sym)} remaining</span>
        </div>
      </div>

      {/* Stream table */}
      <div className="card" style={{ padding: "14px", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span className="lbl">Income Streams</span>
          <button className="btn-ghost" onClick={addStream}>+ Add Stream</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name", "Type", "Amount", "Freq", "Growth", "Monthly", "Active", ""].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {streams.map(s => (
              <tr key={s.id} className="row-h" style={{ opacity: s.active ? 1 : 0.45 }}>
                <td className="td"><input className="ti" value={s.name} onChange={e => updS(s.id, "name", e.target.value)} /></td>
                <td className="td">
                  <select className="si" value={s.type} onChange={e => updS(s.id, "type", e.target.value)}>
                    {INCOME_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </td>
                <td className="td">
                  <div style={{ display: "flex", gap: "2px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)" }}>{sym}</span>
                    <input type="number" value={s.amount} onChange={e => updS(s.id, "amount", +e.target.value)} style={{ background: "transparent", border: "none", color: "var(--acc)", fontFamily: "var(--font-mono)", fontSize: "11px", width: "70px", outline: "none" }} />
                  </div>
                </td>
                <td className="td">
                  <select className="si" value={s.freq} onChange={e => updS(s.id, "freq", e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="annual">Annual</option>
                  </select>
                </td>
                <td className="td">
                  <div style={{ display: "flex", gap: "1px" }}>
                    <input type="number" value={s.growth} onChange={e => updS(s.id, "growth", +e.target.value)} style={{ background: "transparent", border: "none", color: "var(--acc3)", fontFamily: "var(--font-mono)", fontSize: "11px", width: "38px", outline: "none" }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t3)" }}>%</span>
                  </div>
                </td>
                <td className="td" style={{ color: "var(--acc)" }}>{fmt(toMonthly(s), sym)}</td>
                <td className="td">
                  <span
                    onClick={() => updS(s.id, "active", !s.active)}
                    style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "9px", color: s.active ? "var(--acc)" : "var(--t3)", padding: "2px 7px", border: `1px solid ${s.active ? "var(--acc)40" : "var(--b2)"}`, borderRadius: "2px" }}
                  >
                    {s.active ? "ON" : "OFF"}
                  </span>
                </td>
                <td className="td"><button className="btn-danger" onClick={() => delStream(s.id)}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* By type breakdown */}
      <div className="card" style={{ padding: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span className="lbl">Breakdown by Type</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="lbl">Projection horizon</span>
            <select className="si" value={projYears} onChange={e => setProjYears(+e.target.value)}>
              {[5, 10, 15, 20].map(y => <option key={y} value={y}>{y} years</option>)}
            </select>
          </div>
        </div>
        {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, mo], i) => (
          <div key={type} style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t2)" }}>{type}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--t1)" }}>
                {fmt(mo, sym)}/mo · {totalMo > 0 ? ((mo / totalMo) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div style={{ height: "5px", background: "var(--b1)", borderRadius: "3px" }}>
              <div style={{ height: "100%", width: `${totalMo > 0 ? (mo / totalMo) * 100 : 0}%`, background: typeColors[i % typeColors.length], borderRadius: "3px", opacity: 0.8 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

const TAB_CONFIG = [
  { id: "dashboard", label: "Home",      icon: "◈", short: "Home"      },
  { id: "etf",       label: "ETF Sim",   icon: "📈", short: "ETF"      },
  { id: "dca",       label: "DCA",       icon: "⟳",  short: "DCA"      },
  { id: "monte",     label: "Monte Carlo",icon: "⊞", short: "Monte"    },
  { id: "budget",    label: "Budget",    icon: "≡",  short: "Budget"   },
  { id: "networth",  label: "Net Worth", icon: "◎",  short: "Worth"    },
  { id: "fire",      label: "FIRE",      icon: "⬡",  short: "FIRE"     },
  { id: "tax",       label: "Tax",       icon: "∑",  short: "Tax"      },
  { id: "rebalance", label: "Rebalancer",icon: "⇌",  short: "Rebal"    },
  { id: "crash",     label: "Crash Sim", icon: "⚡", short: "Crash"    },
  { id: "loans",     label: "Loans",     icon: "⊖",  short: "Loans"    },
  { id: "income",    label: "Income",    icon: "⊕",  short: "Income"   },
];

export default function WealthStudioPRO() {
  return (
    <LiveProvider>
      <WealthStudioApp />
    </LiveProvider>
  );
}

function WealthStudioApp() {
  const [tab, setTab] = useState("dashboard");
  const [currency, setCurrency] = useState("USD");
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const sym = CURRENCIES[currency]?.sym ?? "$";
  const currentTab = TAB_CONFIG.find(t => t.id === tab);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", color: "var(--t1)", overflow: "hidden", position: "relative" }}>
      <style>{G}</style>
      <div className="grid-bg" />
      <div className="noise-overlay" />
      <div className="scanline-fx" />

      {/* ── DESKTOP HEADER ── */}
      <div className="content desk-header" style={{ borderBottom: "1px solid var(--b2)", background: "rgba(2,2,5,0.92)", flexShrink: 0, backdropFilter: "blur(20px)", flexDirection: "column", boxShadow: "0 1px 0 rgba(0,255,135,0.06)" }}>
        <div style={{ display: "flex", alignItems: "stretch", justifyContent: "space-between", padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ padding: "10px 0" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--t3)", letterSpacing: "5px", marginBottom: "1px" }}>WEALTH STUDIO</div>
              <div
                className="logo-glitch glow-g"
                data-text="PRO"
                style={{ fontFamily: "var(--font-ui)", fontSize: "22px", letterSpacing: "4px", color: "var(--acc)", lineHeight: 1 }}
              >PRO</div>
            </div>
            <div style={{ width: "1px", height: "32px", background: "linear-gradient(180deg,transparent,var(--b2),transparent)" }} />
            <div style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none" }}>
              {TAB_CONFIG.map(({ id, label }) => (
                <button key={id} className={`tab${tab === id ? " on" : ""}`} onClick={() => setTab(id)}>{label}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ApiKeyPanel />
            <select className="si" value={currency} onChange={e => setCurrency(e.target.value)}>
              {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--t3)", letterSpacing: "1px" }}>{time.toLocaleDateString()}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--acc)" }} className="blink">{time.toLocaleTimeString()}</div>
            </div>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--acc)", boxShadow: "0 0 10px var(--acc),0 0 20px rgba(0,255,135,0.4)" }} className="pulse-dot" />
          </div>
        </div>
        <div className="ticker-wrap">
          <TickerBar currency={currency} />
        </div>
        <ApiKeyBar />
      </div>

      {/* ── MOBILE HEADER ── */}
      <div className="content mob-header" style={{ borderBottom: "1px solid var(--b2)", background: "rgba(2,2,5,0.98)", flexShrink: 0, boxShadow: "0 1px 0 rgba(0,255,135,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "18px", color: "var(--acc)" }}>{currentTab?.icon}</span>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--t3)", letterSpacing: "3px" }}>WEALTH STUDIO PRO</div>
            <div className="mob-title">{currentTab?.label}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <select className="si" value={currency} onChange={e => setCurrency(e.target.value)} style={{ fontSize: "12px", padding: "5px 7px" }}>
            {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--acc)", boxShadow: "0 0 10px var(--acc)" }} className="pulse-dot" />
        </div>
      </div>
      {/* ApiKeyBar only shown once - after desktop header via desk-header class */}

      {/* ── CONTENT ── */}
      <div className="content mob-content" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {tab === "dashboard"  && <Dashboard onNav={setTab} currency={currency} />}
        {tab === "etf"        && <ETFModule currency={currency} />}
        {tab === "dca"        && <DCAModule currency={currency} />}
        {tab === "monte"      && <MonteCarloModule currency={currency} />}
        {tab === "budget"     && <BudgetModule currency={currency} />}
        {tab === "networth"   && <NetWorthModule currency={currency} />}
        {tab === "fire"       && <FIREModule currency={currency} />}
        {tab === "tax"        && <TaxModule currency={currency} />}
        {tab === "rebalance"  && <RebalancerModule currency={currency} />}
        {tab === "crash"      && <CrashSimModule currency={currency} />}
        {tab === "loans"      && <LoanModule currency={currency} />}
        {tab === "income"     && <IncomeModule currency={currency} />}
      </div>

      {/* ── DESKTOP FOOTER ── */}
      <div className="content desk-footer" style={{ padding: "5px 20px", borderTop: "1px solid var(--b1)", background: "rgba(2,2,5,0.95)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--t3)", letterSpacing: "1px" }}>⚠ Based on historical data. Not financial advice. Past performance ≠ future results.</span>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "var(--t3)", letterSpacing: "1px" }}>12 MODULES · 22 ETFs · {Object.keys(CURRENCIES).length} CURRENCIES</span>
          <div style={{ width: "1px", height: "12px", background: "var(--b2)" }} />
          <span style={{ fontFamily: "var(--font-ui)", fontSize: "12px", letterSpacing: "3px", color: "var(--acc)" }} className="glow-g">WEALTH STUDIO PRO</span>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mob-nav">
        <div className="mob-nav-inner">
          {TAB_CONFIG.map(({ id, icon, short }) => (
            <button key={id} className={`mob-tab${tab === id ? " on" : ""}`} onClick={() => setTab(id)}>
              <span className="mob-tab-icon">{icon}</span>
              <span>{short}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
