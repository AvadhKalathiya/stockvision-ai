export type TickerKey = keyof typeof TICKER_CONFIG;

export const TICKER_CONFIG = {
  // India NSE
  "TCS.NS": {
    yf: "TCS.NS",
    name: "Tata Consultancy Services",
    currency: "INR",
    exchange: "NSE",
    sector: "IT Services",
    fallbackBase: 3680,
    vol: 0.015,
  },
  "RELIANCE.NS": {
    yf: "RELIANCE.NS",
    name: "Reliance Industries",
    currency: "INR",
    exchange: "NSE",
    sector: "Conglomerate",
    fallbackBase: 2890,
    vol: 0.018,
  },
  "INFY.NS": {
    yf: "INFY.NS",
    name: "Infosys",
    currency: "INR",
    exchange: "NSE",
    sector: "IT Services",
    fallbackBase: 1520,
    vol: 0.017,
  },
  "HDFCBANK.NS": {
    yf: "HDFCBANK.NS",
    name: "HDFC Bank",
    currency: "INR",
    exchange: "NSE",
    sector: "Banking",
    fallbackBase: 1680,
    vol: 0.014,
  },
  "SBIN.NS": {
    yf: "SBIN.NS",
    name: "State Bank of India",
    currency: "INR",
    exchange: "NSE",
    sector: "Banking",
    fallbackBase: 630,
    vol: 0.02,
  },
  "WIPRO.NS": {
    yf: "WIPRO.NS",
    name: "Wipro",
    currency: "INR",
    exchange: "NSE",
    sector: "IT Services",
    fallbackBase: 480,
    vol: 0.018,
  },
  "ICICIBANK.NS": {
    yf: "ICICIBANK.NS",
    name: "ICICI Bank",
    currency: "INR",
    exchange: "NSE",
    sector: "Banking",
    fallbackBase: 1020,
    vol: 0.016,
  },
  "BAJFINANCE.NS": {
    yf: "BAJFINANCE.NS",
    name: "Bajaj Finance",
    currency: "INR",
    exchange: "NSE",
    sector: "NBFC",
    fallbackBase: 6800,
    vol: 0.022,
  },
  NIFTY50: {
    yf: "^NSEI",
    name: "NIFTY 50",
    currency: "INR",
    exchange: "NSE",
    sector: "Index",
    fallbackBase: 22400,
    vol: 0.012,
  },
  BANKNIFTY: {
    yf: "^NSEBANK",
    name: "Bank NIFTY",
    currency: "INR",
    exchange: "NSE",
    sector: "Index",
    fallbackBase: 47500,
    vol: 0.015,
  },
  SENSEX: {
    yf: "^BSESN",
    name: "BSE SENSEX",
    currency: "INR",
    exchange: "BSE",
    sector: "Index",
    fallbackBase: 74000,
    vol: 0.012,
  },
  // Indian Stocks Expansion
  "ITC.NS": {
    yf: "ITC.NS",
    name: "ITC Limited",
    currency: "INR",
    exchange: "NSE",
    sector: "FMCG",
    fallbackBase: 420,
    vol: 0.012,
  },
  "LT.NS": {
    yf: "LT.NS",
    name: "Larsen & Toubro",
    currency: "INR",
    exchange: "NSE",
    sector: "Infrastructure",
    fallbackBase: 3600,
    vol: 0.018,
  },
  "HINDUNILVR.NS": {
    yf: "HINDUNILVR.NS",
    name: "Hindustan Unilever",
    currency: "INR",
    exchange: "NSE",
    sector: "FMCG",
    fallbackBase: 2400,
    vol: 0.015,
  },
  "AXISBANK.NS": {
    yf: "AXISBANK.NS",
    name: "Axis Bank",
    currency: "INR",
    exchange: "NSE",
    sector: "Banking",
    fallbackBase: 1050,
    vol: 0.018,
  },
  "KOTAKBANK.NS": {
    yf: "KOTAKBANK.NS",
    name: "Kotak Mahindra Bank",
    currency: "INR",
    exchange: "NSE",
    sector: "Banking",
    fallbackBase: 1750,
    vol: 0.016,
  },
  "TATAMOTORS.NS": {
    yf: "TATAMOTORS.NS",
    name: "Tata Motors",
    currency: "INR",
    exchange: "NSE",
    sector: "Auto",
    fallbackBase: 950,
    vol: 0.025,
  },
  "SUNPHARMA.NS": {
    yf: "SUNPHARMA.NS",
    name: "Sun Pharma",
    currency: "INR",
    exchange: "NSE",
    sector: "Pharma",
    fallbackBase: 1550,
    vol: 0.017,
  },
  "ONGC.NS": {
    yf: "ONGC.NS",
    name: "ONGC",
    currency: "INR",
    exchange: "NSE",
    sector: "Energy",
    fallbackBase: 280,
    vol: 0.02,
  },
} as const;

export const INDIA_TICKERS = [
  "TCS.NS",
  "RELIANCE.NS",
  "INFY.NS",
  "HDFCBANK.NS",
  "SBIN.NS",
  "WIPRO.NS",
  "ICICIBANK.NS",
  "BAJFINANCE.NS",
  "ITC.NS",
  "LT.NS",
  "HINDUNILVR.NS",
  "AXISBANK.NS",
  "KOTAKBANK.NS",
  "TATAMOTORS.NS",
  "SUNPHARMA.NS",
  "ONGC.NS",
  "NIFTY50",
  "BANKNIFTY",
  "SENSEX",
] as const;

export const ALL_TICKERS = [...INDIA_TICKERS] as readonly string[];

export type TickerConfig = (typeof TICKER_CONFIG)[keyof typeof TICKER_CONFIG];

export function getTickerConfig(ticker: string): TickerConfig | null {
  return (TICKER_CONFIG as Record<string, TickerConfig>)[ticker] ?? null;
}

export function formatPrice(value: number, currency = "INR"): string {
  const sym = currency === "INR" ? "₹" : "$";
  if (Math.abs(value) >= 1000)
    return sym + value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  return sym + value.toFixed(2);
}

export function formatChangePct(pct: number): string {
  return (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%";
}
