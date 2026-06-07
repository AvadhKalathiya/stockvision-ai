import type { LiveQuote } from "@/hooks/useLiveQuotes";
import { NIFTY50_TICKERS, NIFTY_NEXT50_TICKERS } from "@/lib/tickerConfig";

export function computeMarketBreadth(stocks: LiveQuote[]) {
  const live = stocks.filter((q) => q.source === "yahoo" && q.last > 0);
  const advances = live.filter((q) => q.changePct > 0).length;
  const declines = live.filter((q) => q.changePct < 0).length;
  const unchanged = live.length - advances - declines;
  const ratio = declines > 0 ? advances / declines : advances;
  return { advances, declines, unchanged, total: live.length, ratio };
}

export function topMovers(stocks: LiveQuote[], n = 5) {
  const live = stocks.filter((q) => q.source === "yahoo");
  return {
    gainers: [...live].filter((q) => q.changePct > 0).sort((a, b) => b.changePct - a.changePct).slice(0, n),
    losers: [...live].filter((q) => q.changePct < 0).sort((a, b) => a.changePct - b.changePct).slice(0, n),
    volume: [...live].sort((a, b) => b.volume - a.volume).slice(0, n),
    trending: [...live].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, n),
  };
}

export function filterIndex(stocks: LiveQuote[], index: "NIFTY50" | "NEXT50" | "ALL") {
  const set =
    index === "NIFTY50"
      ? new Set(NIFTY50_TICKERS)
      : index === "NEXT50"
        ? new Set(NIFTY_NEXT50_TICKERS)
        : null;
  if (!set) return stocks;
  return stocks.filter((q) => set.has(q.ticker));
}
