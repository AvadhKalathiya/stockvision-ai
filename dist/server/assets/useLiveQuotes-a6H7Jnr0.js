import { X as reactExports } from "./server-Cgfy5VtR.js";
import { u as useQuery } from "./useQuery-DpcV55YJ.js";
import { u as useServerFn } from "./createSsrRpc-CXvRzAXX.js";
import { A as ALL_TICKERS } from "./tickerConfig-7S1tvlm8.js";
import { b as getLiveQuotes } from "./yahooFinance.functions-CNaRUXD5.js";
import { w as useAuthStore } from "./router-C3k8-z80.js";
import { g as getLimits } from "./planLimits-DfVfhYvW.js";
const LIVE_QUOTES_KEY = ["live-quotes", "all"];
function useLiveQuotes() {
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);
  const refreshMs = limits.priorityRefresh ? 3e4 : 6e4;
  const fetchQuotes = useServerFn(getLiveQuotes);
  const query = useQuery({
    queryKey: [...LIVE_QUOTES_KEY, limits.priorityRefresh],
    queryFn: () => fetchQuotes({ data: { tickers: [...ALL_TICKERS] } }),
    staleTime: refreshMs,
    refetchInterval: refreshMs,
    retry: 3,
    retryDelay: (attempt) => Math.min(1e3 * 2 ** attempt, 1e4)
  });
  const quotes = reactExports.useMemo(
    () => ALL_TICKERS.map((t) => {
      const live = query.data?.find((q) => q.ticker === t);
      if (live && live.source === "yahoo" && live.last > 0) {
        return {
          ticker: t,
          last: live.last,
          changePct: live.changePct,
          volume: live.volume ?? 0,
          source: "yahoo"
        };
      }
      return {
        ticker: t,
        last: live?.last ?? 0,
        changePct: live?.changePct ?? 0,
        volume: live?.volume ?? 0,
        source: live?.source ?? "fallback"
      };
    }),
    [query.data]
  );
  const quoteMap = reactExports.useMemo(() => new Map(quotes.map((q) => [q.ticker, q])), [quotes]);
  return { ...query, quotes, quoteMap };
}
export {
  useLiveQuotes as u
};
