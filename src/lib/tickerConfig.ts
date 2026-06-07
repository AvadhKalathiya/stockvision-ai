import {
  NIFTY50_SYMBOLS,
  NIFTY_NEXT50_SYMBOLS,
  STOCK_SECTOR_MAP,
  displayName,
} from "./niftyConstituents";

function stockEntry(sym: string, sector?: string) {
  const key = `${sym}.NS`;
  return {
    [key]: {
      yf: key,
      name: displayName(sym),
      currency: "INR" as const,
      exchange: "NSE" as const,
      sector: sector ?? STOCK_SECTOR_MAP[sym] ?? "Equity",
      fallbackBase: 1000,
      vol: 0.018,
    },
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
    vol: 0.012,
  },
  NIFTYNEXT50: {
    yf: "^NSMIDCP",
    name: "NIFTY NEXT 50",
    currency: "INR",
    exchange: "NSE",
    sector: "Index",
    fallbackBase: 42000,
    vol: 0.013,
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
} as const;

const generated: Record<string, (typeof BASE_CONFIG)[keyof typeof BASE_CONFIG]> = {};
for (const sym of NIFTY50_SYMBOLS) Object.assign(generated, stockEntry(sym));
for (const sym of NIFTY_NEXT50_SYMBOLS) Object.assign(generated, stockEntry(sym));

export const TICKER_CONFIG = { ...BASE_CONFIG, ...generated } as const;

export type TickerKey = keyof typeof TICKER_CONFIG;

export const INDEX_TICKERS = ["NIFTY50", "NIFTYNEXT50", "BANKNIFTY", "SENSEX"] as const;

export const NIFTY50_TICKERS = NIFTY50_SYMBOLS.map((s) => `${s}.NS`) as readonly string[];
export const NIFTY_NEXT50_TICKERS = NIFTY_NEXT50_SYMBOLS.map((s) => `${s}.NS`) as readonly string[];

export const NIFTY50_STOCKS = [...NIFTY50_TICKERS] as readonly string[];

export const BANK_NIFTY_STOCKS = [
  "HDFCBANK.NS", "SBIN.NS", "ICICIBANK.NS", "AXISBANK.NS", "KOTAKBANK.NS",
  "INDUSINDBK.NS", "BANKBARODA.NS", "PNB.NS", "CANBK.NS",
] as const;

export const INDIA_TICKERS = [
  ...NIFTY50_TICKERS,
  ...NIFTY_NEXT50_TICKERS.filter((t) => !NIFTY50_TICKERS.includes(t)),
  ...INDEX_TICKERS,
] as const;

export const ALL_TICKERS = [...INDIA_TICKERS] as readonly string[];

export const SENSEX_TICKERS = ["SENSEX", ...NIFTY50_TICKERS] as readonly string[];

export function getHeatmapColorClass(pct: number): string {
  if (pct >= 2) return "bg-primary/90 text-primary-foreground";
  if (pct > 0) return "bg-primary/50 text-primary-foreground";
  if (pct <= -2) return "bg-destructive/90 text-destructive-foreground";
  if (pct < 0) return "bg-destructive/50 text-destructive-foreground";
  return "bg-muted text-muted-foreground";
}

export const CRYPTO_TICKERS: readonly string[] = [];
export const GLOBAL_TICKERS: readonly string[] = [...INDIA_TICKERS];

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

export function formatVolume(vol: number): string {
  if (vol >= 1e7) return (vol / 1e7).toFixed(2) + " Cr";
  if (vol >= 1e5) return (vol / 1e5).toFixed(2) + " L";
  if (vol >= 1e3) return (vol / 1e3).toFixed(1) + " K";
  return String(vol);
}
