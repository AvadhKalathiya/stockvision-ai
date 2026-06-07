import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ALL_TICKERS } from "@/lib/tickerConfig";
import { getLiveQuotes } from "@/lib/yahooFinance.functions";
import { useAuthStore } from "@/stores/authStore";
import { getLimits } from "@/lib/planLimits";

export const LIVE_QUOTES_KEY = ["live-quotes", "all"] as const;

export interface LiveQuote {
  ticker: string;
  last: number;
  changePct: number;
  volume: number;
  source: "yahoo" | "fallback";
}

export function useLiveQuotes() {
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);
  const refreshMs = limits.priorityRefresh ? 30_000 : 60_000;
  const fetchQuotes = useServerFn(getLiveQuotes);

  const query = useQuery({
    queryKey: [...LIVE_QUOTES_KEY, limits.priorityRefresh],
    queryFn: () => fetchQuotes({ data: { tickers: [...ALL_TICKERS] } }),
    staleTime: refreshMs,
    refetchInterval: refreshMs,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  const quotes: LiveQuote[] = useMemo(
    () =>
      ALL_TICKERS.map((t) => {
        const live = query.data?.find((q) => q.ticker === t);
        if (live && live.source === "yahoo" && live.last > 0) {
          return {
            ticker: t,
            last: live.last,
            changePct: live.changePct,
            volume: live.volume ?? 0,
            source: "yahoo" as const,
          };
        }
        return {
          ticker: t,
          last: live?.last ?? 0,
          changePct: live?.changePct ?? 0,
          volume: live?.volume ?? 0,
          source: (live?.source ?? "fallback") as "yahoo" | "fallback",
        };
      }),
    [query.data],
  );

  const quoteMap = useMemo(() => new Map(quotes.map((q) => [q.ticker, q])), [quotes]);

  return { ...query, quotes, quoteMap };
}
