import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Rocket, TrendingUp, RefreshCw, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { getIpoCalendar, getFutures } from "@/lib/ipoFutures.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";

export const Route = createFileRoute("/_authenticated/ipo-futures")({
  component: IpoFuturesPage,
  head: () => ({
    meta: [
      { title: "IPO & Futures · StockVision AI" },
      {
        name: "description",
        content: "Live IPO calendar (India & Global) and futures market data.",
      },
    ],
  }),
});

type Tab = "ipo" | "futures";
type Market = "ALL" | "INDIA" | "GLOBAL";

function IpoFuturesPage() {
  const [tab, setTab] = useState<Tab>("ipo");
  const [market, setMarket] = useState<Market>("ALL");
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const ipoFn = useServerFn(getIpoCalendar);
  const futFn = useServerFn(getFutures);

  const ipoQuery = useQuery({
    queryKey: ["ipo-calendar", market],
    queryFn: () => ipoFn({ data: { market } }),
    enabled: tab === "ipo",
    staleTime: 5 * 60 * 1000,
  });

  const futQuery = useQuery({
    queryKey: ["futures"],
    queryFn: () => futFn({}),
    enabled: tab === "futures",
    refetchInterval: 60_000,
  });

  const addToWatchlist = useMutation({
    mutationFn: async (ticker: string) => {
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase.from("watchlist").insert({ user_id: user.id, ticker });
      if (error) throw error;
    },
    onSuccess: (_d, ticker) => {
      toast.success(`${ticker} added to watchlist`);
      qc.invalidateQueries({ queryKey: ["watchlist"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">IPO & Futures</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Live IPO calendar and global futures market data.
          </p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg glass-card">
          <button
            onClick={() => setTab("ipo")}
            className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition ${
              tab === "ipo"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Rocket className="size-4" /> IPOs
          </button>
          <button
            onClick={() => setTab("futures")}
            className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition ${
              tab === "futures"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="size-4" /> Futures
          </button>
        </div>
      </header>

      {tab === "ipo" ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-1 p-1 rounded-md glass-card">
              {(["ALL", "INDIA", "GLOBAL"] as Market[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMarket(m)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                    market === m
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              onClick={() => ipoQuery.refetch()}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`size-3.5 ${ipoQuery.isFetching ? "animate-spin" : ""}`} />{" "}
              Refresh
            </button>
          </div>

          <div className="glass-card rounded-lg overflow-hidden">
            {ipoQuery.isLoading ? (
              <div className="p-12 text-center text-muted-foreground text-sm">
                Loading IPO calendar…
              </div>
            ) : ipoQuery.isError ? (
              <div className="p-12 text-center text-destructive text-sm flex items-center justify-center gap-2">
                <AlertTriangle className="size-4" /> Failed to load IPOs.
              </div>
            ) : !ipoQuery.data?.length ? (
              <div className="p-12 text-center text-muted-foreground text-sm">
                No IPOs found for this market.
              </div>
            ) : (
              <div className="page-table-wrap">
                <table className="w-full min-w-[700px] text-sm">
                  <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3">Company</th>
                      <th className="text-left px-4 py-3">Market</th>
                      <th className="text-left px-4 py-3">Open</th>
                      <th className="text-left px-4 py-3">Close</th>
                      <th className="text-left px-4 py-3">Listing</th>
                      <th className="text-left px-4 py-3">Price Band</th>
                      <th className="text-left px-4 py-3">Size</th>
                      <th className="text-right px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ipoQuery.data.map((ipo, i) => (
                      <tr key={i} className="border-t border-border/50 hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{ipo.name}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded bg-secondary">
                            {ipo.market}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{ipo.openDate ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{ipo.closeDate ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {ipo.listingDate ?? "—"}
                        </td>
                        <td className="px-4 py-3">{ipo.priceBand ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{ipo.issueSize ?? "—"}</td>
                        <td className="px-4 py-3 text-right">
                          {ipo.symbol ? (
                            <button
                              onClick={() => addToWatchlist.mutate(ipo.symbol!)}
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <Plus className="size-3" /> Watch
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Data scraped live from Chittorgarh (India) and Nasdaq (Global). Refreshed on demand.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Live futures across indices, commodities, currencies & crypto.
            </p>
            <button
              onClick={() => futQuery.refetch()}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`size-3.5 ${futQuery.isFetching ? "animate-spin" : ""}`} />{" "}
              Refresh
            </button>
          </div>

          {(["INDEX", "COMMODITY", "CURRENCY", "CRYPTO"] as const).map((cat) => {
            const rows = (futQuery.data ?? []).filter((f) => f.category === cat);
            if (!rows.length && !futQuery.isLoading) return null;
            return (
              <div key={cat} className="space-y-2">
                <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  {cat}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rows.map((f) => {
                    const up = f.changePct >= 0;
                    return (
                      <div key={f.symbol} className="glass-card rounded-lg p-4 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-muted-foreground">
                            {f.symbol}
                          </span>
                          <button
                            onClick={() => addToWatchlist.mutate(f.symbol)}
                            className="text-xs text-muted-foreground hover:text-primary"
                            title="Add to watchlist"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <div className="font-semibold text-sm">{f.name}</div>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="font-heading text-xl tabular-nums">
                            {f.last
                              ? f.last.toLocaleString(undefined, { maximumFractionDigits: 2 })
                              : "—"}
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              up ? "text-primary" : "text-destructive"
                            }`}
                          >
                            {up ? "▲" : "▼"} {Math.abs(f.changePct).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {futQuery.isLoading && (
            <div className="p-12 text-center text-muted-foreground text-sm">Loading futures…</div>
          )}
        </section>
      )}
    </div>
  );
}
