const NIFTY50_SYMBOLS = [
  "RELIANCE",
  "TCS",
  "HDFCBANK",
  "INFY",
  "ICICIBANK",
  "HINDUNILVR",
  "ITC",
  "SBIN",
  "BHARTIARTL",
  "KOTAKBANK",
  "LT",
  "AXISBANK",
  "ASIANPAINT",
  "MARUTI",
  "TITAN",
  "SUNPHARMA",
  "BAJFINANCE",
  "WIPRO",
  "HCLTECH",
  "ULTRACEMCO",
  "NTPC",
  "POWERGRID",
  "M&M",
  "TATAMOTORS",
  "ONGC",
  "ADANIENT",
  "ADANIPORTS",
  "JSWSTEEL",
  "TATASTEEL",
  "INDUSINDBK",
  "TECHM",
  "HINDALCO",
  "COALINDIA",
  "DIVISLAB",
  "GRASIM",
  "BPCL",
  "EICHERMOT",
  "CIPLA",
  "DRREDDY",
  "APOLLOHOSP",
  "HEROMOTOCO",
  "BRITANNIA",
  "NESTLEIND",
  "TRENT",
  "BEL",
  "SHRIRAMFIN",
  "BAJAJ-AUTO",
  "TATACONSUM",
  "LTIM",
  "HDFCLIFE"
];
const NIFTY_NEXT50_SYMBOLS = [
  "ABB",
  "ADANIENSOL",
  "AMBUJACEM",
  "AUROPHARMA",
  "BAJAJFINSV",
  "BANKBARODA",
  "BERGEPAINT",
  "BOSCHLTD",
  "CANBK",
  "CHOLAFIN",
  "COLPAL",
  "DABUR",
  "DLF",
  "DMART",
  "GAIL",
  "GODREJCP",
  "HAL",
  "HAVELLS",
  "HDFCAMC",
  "ICICIPRULI",
  "ICICIGI",
  "INDIGO",
  "IOC",
  "IRCTC",
  "JINDALSTEL",
  "LICI",
  "MARICO",
  "MOTHERSON",
  "NAUKRI",
  "OFSS",
  "PERSISTENT",
  "PETRONET",
  "PIDILITIND",
  "PNB",
  "RECLTD",
  "SRF",
  "SIEMENS",
  "TATAPOWER",
  "TATAELXSI",
  "TVSMOTOR",
  "UPL",
  "VBL",
  "VEDL",
  "ZOMATO",
  "INDHOTEL",
  "JIOFIN",
  "MAXHEALTH",
  "NHPC",
  "NYKAA",
  "POLYCAB"
];
const STOCK_SECTOR_MAP = {
  RELIANCE: "Conglomerate",
  TCS: "IT Services",
  HDFCBANK: "Banking",
  INFY: "IT Services",
  ICICIBANK: "Banking",
  HINDUNILVR: "FMCG",
  ITC: "FMCG",
  SBIN: "Banking",
  BHARTIARTL: "Telecom",
  KOTAKBANK: "Banking",
  LT: "Infrastructure",
  AXISBANK: "Banking",
  ASIANPAINT: "Paints",
  MARUTI: "Auto",
  TITAN: "Consumer",
  SUNPHARMA: "Pharma",
  BAJFINANCE: "NBFC",
  WIPRO: "IT Services",
  HCLTECH: "IT Services",
  ULTRACEMCO: "Cement",
  NTPC: "Power",
  POWERGRID: "Power",
  "M&M": "Auto",
  TATAMOTORS: "Auto",
  ONGC: "Energy",
  ADANIENT: "Conglomerate",
  ADANIPORTS: "Infrastructure",
  JSWSTEEL: "Metals",
  TATASTEEL: "Metals",
  INDUSINDBK: "Banking",
  TECHM: "IT Services",
  HINDALCO: "Metals",
  COALINDIA: "Energy",
  DIVISLAB: "Pharma",
  GRASIM: "Diversified",
  BPCL: "Energy",
  EICHERMOT: "Auto",
  CIPLA: "Pharma",
  DRREDDY: "Pharma",
  APOLLOHOSP: "Healthcare",
  HEROMOTOCO: "Auto",
  BRITANNIA: "FMCG",
  NESTLEIND: "FMCG",
  TRENT: "Retail",
  BEL: "Defence",
  SHRIRAMFIN: "NBFC",
  "BAJAJ-AUTO": "Auto",
  TATACONSUM: "FMCG",
  LTIM: "IT Services",
  HDFCLIFE: "Insurance"
};
function displayName(sym) {
  return sym.replace(/-/g, " ");
}
function stockEntry(sym, sector) {
  const key = `${sym}.NS`;
  return {
    [key]: {
      yf: key,
      name: displayName(sym),
      currency: "INR",
      exchange: "NSE",
      sector: STOCK_SECTOR_MAP[sym] ?? "Equity",
      fallbackBase: 1e3,
      vol: 0.018
    }
  };
}
const BASE_CONFIG = {
  NIFTY50: {
    yf: "^NSEI",
    name: "NIFTY 50",
    currency: "INR",
    exchange: "NSE",
    sector: "Index",
    fallbackBase: 22400,
    vol: 0.012
  },
  NIFTYNEXT50: {
    yf: "^NSMIDCP",
    name: "NIFTY NEXT 50",
    currency: "INR",
    exchange: "NSE",
    sector: "Index",
    fallbackBase: 42e3,
    vol: 0.013
  },
  BANKNIFTY: {
    yf: "^NSEBANK",
    name: "Bank NIFTY",
    currency: "INR",
    exchange: "NSE",
    sector: "Index",
    fallbackBase: 47500,
    vol: 0.015
  },
  SENSEX: {
    yf: "^BSESN",
    name: "BSE SENSEX",
    currency: "INR",
    exchange: "BSE",
    sector: "Index",
    fallbackBase: 74e3,
    vol: 0.012
  }
};
const generated = {};
for (const sym of NIFTY50_SYMBOLS) Object.assign(generated, stockEntry(sym));
for (const sym of NIFTY_NEXT50_SYMBOLS) Object.assign(generated, stockEntry(sym));
const TICKER_CONFIG = { ...BASE_CONFIG, ...generated };
const INDEX_TICKERS = ["NIFTY50", "NIFTYNEXT50", "BANKNIFTY", "SENSEX"];
const NIFTY50_TICKERS = NIFTY50_SYMBOLS.map((s) => `${s}.NS`);
const NIFTY_NEXT50_TICKERS = NIFTY_NEXT50_SYMBOLS.map((s) => `${s}.NS`);
[...NIFTY50_TICKERS];
const BANK_NIFTY_STOCKS = [
  "HDFCBANK.NS",
  "SBIN.NS",
  "ICICIBANK.NS",
  "AXISBANK.NS",
  "KOTAKBANK.NS",
  "INDUSINDBK.NS",
  "BANKBARODA.NS",
  "PNB.NS",
  "CANBK.NS"
];
const INDIA_TICKERS = [
  ...NIFTY50_TICKERS,
  ...NIFTY_NEXT50_TICKERS.filter((t) => !NIFTY50_TICKERS.includes(t)),
  ...INDEX_TICKERS
];
const ALL_TICKERS = [...INDIA_TICKERS];
const SENSEX_TICKERS = ["SENSEX", ...NIFTY50_TICKERS];
function getHeatmapColorClass(pct) {
  if (pct >= 2) return "bg-primary/90 text-primary-foreground";
  if (pct > 0) return "bg-primary/50 text-primary-foreground";
  if (pct <= -2) return "bg-destructive/90 text-destructive-foreground";
  if (pct < 0) return "bg-destructive/50 text-destructive-foreground";
  return "bg-muted text-muted-foreground";
}
const CRYPTO_TICKERS = [];
const GLOBAL_TICKERS = [...INDIA_TICKERS];
function getTickerConfig(ticker) {
  return TICKER_CONFIG[ticker] ?? null;
}
function formatPrice(value, currency = "INR") {
  const sym = currency === "INR" ? "₹" : "$";
  if (Math.abs(value) >= 1e3)
    return sym + value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  return sym + value.toFixed(2);
}
function formatChangePct(pct) {
  return (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%";
}
function formatVolume(vol) {
  if (vol >= 1e7) return (vol / 1e7).toFixed(2) + " Cr";
  if (vol >= 1e5) return (vol / 1e5).toFixed(2) + " L";
  if (vol >= 1e3) return (vol / 1e3).toFixed(1) + " K";
  return String(vol);
}
export {
  ALL_TICKERS as A,
  BANK_NIFTY_STOCKS as B,
  CRYPTO_TICKERS as C,
  GLOBAL_TICKERS as G,
  INDIA_TICKERS as I,
  NIFTY50_TICKERS as N,
  SENSEX_TICKERS as S,
  TICKER_CONFIG as T,
  NIFTY_NEXT50_TICKERS as a,
  formatPrice as b,
  formatVolume as c,
  getTickerConfig as d,
  formatChangePct as f,
  getHeatmapColorClass as g
};
