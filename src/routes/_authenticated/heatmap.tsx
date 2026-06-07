import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  TICKER_CONFIG,
  formatChangePct,
  formatPrice,
  getHeatmapColorClass,
  NIFTY50_TICKERS,
  BANK_NIFTY_STOCKS,
  SENSEX_TICKERS,
  ALL_TICKERS,
} from "@/lib/tickerConfig";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { PageShell } from "@/components/PageShell";
import { QueryError, QueryLoading } from "@/components/QueryState";
import { useAuthStore } from "@/stores/authStore";
import { getLimits } from "@/lib/planLimits";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/heatmap")({
  component: HeatmapPage,
});

type Filter = "NIFTY 50" | "BANK NIFTY" | "SENSEX" | "ALL";

const FILTER_SETS: Record<Filter, readonly string[]> = {
  ALL: ALL_TICKERS,
  "NIFTY 50": NIFTY50_TICKERS,
  "BANK NIFTY": BANK_NIFTY_STOCKS,
  SENSEX: SENSEX_TICKERS,
};

function HeatmapPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const { quotes, isFetching, isLoading, isError, error, refetch } = useLiveQuotes();

  const heatmapData = useMemo(() => {
    const allowed = new Set(FILTER_SETS[filter]);
    return quotes
      .filter((q) => allowed.has(q.ticker))
      .map((q) => {
        const cfg = TICKER_CONFIG[q.ticker as keyof typeof TICKER_CONFIG];
        return {
          ticker: q.ticker,
          name: cfg?.name ?? q.ticker,
          sector: cfg?.sector ?? "Unknown",
          price: q.last,
          pct: q.changePct,
          colorClass: getHeatmapColorClass(q.changePct),
        };
      })
      .filter((d) => {
        if (!search) return true;
        const term = search.toLowerCase();
        return d.name.toLowerCase().includes(term) || d.ticker.toLowerCase().includes(term);
      })
      .sort((a, b) => b.pct - a.pct);
  }, [quotes, filter, search]);

  return (
    <PageShell
      title="Market Heatmap"
      subtitle="Real-time Indian market performance — tap any tile to forecast."
    >
      <div className="mb-6">
        <GlobalSearch />
      </div>

      <div className="glass-card p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {(["NIFTY 50", "BANK NIFTY", "SENSEX", "ALL"] as Filter[]).map((f) => {
            const locked = !limits.canPremiumHeatmap && PREMIUM_FILTERS.includes(f);
            return (
              <button
                key={f}
                onClick={() => {
                  if (locked) {
                    toast.error(`${f} heatmap requires Pro plan or higher`);
                    return;
                  }
                  setFilter(f);
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : locked
                      ? "bg-secondary/50 text-muted-foreground/50"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}{locked ? " 🔒" : ""}
              </button>
            );
          })}
        </div>
        <input
          type="text"
          placeholder="Search company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded-md bg-input border border-border text-sm w-full sm:w-48"
        />
      </div>

      {isError ? (
        <QueryError message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <QueryLoading label="Loading heatmap data…" />
      ) : (
        <>
          {isFetching && (
            <p className="text-xs text-muted-foreground mb-3 animate-pulse">Refreshing quotes…</p>
          )}
          {heatmapData.length === 0 ? (
            <div className="glass-card p-8 text-center text-muted-foreground text-sm">
              No tickers match your filter.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {heatmapData.map((d) => (
                <Link
                  key={d.ticker}
                  to="/forecast"
                  search={{ ticker: d.ticker, model: "Ensemble" }}
                  className={`p-3 rounded-lg shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] ${d.colorClass} flex flex-col justify-between min-h-[96px]`}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-sm tracking-tight truncate">
                      {d.ticker.replace(".NS", "")}
                    </div>
                    <div className="text-[10px] opacity-80 truncate">{d.name}</div>
                  </div>
                  <div className="mt-2 text-right">
                    <div className="font-mono-nums font-semibold text-sm">{formatChangePct(d.pct)}</div>
                    <div className="font-mono-nums text-[10px] opacity-90">{formatPrice(d.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
