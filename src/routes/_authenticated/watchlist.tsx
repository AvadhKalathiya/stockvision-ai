import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import {
  ALL_TICKERS,
  TICKER_CONFIG,
  formatPrice,
  formatChangePct,
  getTickerConfig,
} from "@/lib/tickerConfig";
import { getLiveQuotes, getLiveHistory } from "@/lib/yahooFinance.functions";
import { Sparkline } from "@/components/Sparkline";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Star, Plus, Trash2, Briefcase, TrendingUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/watchlist")({
  component: WatchlistPage,
});

interface Item {
  id: string;
  ticker: string;
}

type SortMode = "movers" | "volume" | "high52";

function WatchlistPage() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("TCS.NS");
  const [sortMode, setSortMode] = useState<SortMode>("movers");

  const fetchQuotes = useServerFn(getLiveQuotes);
  const fetchHistory = useServerFn(getLiveHistory);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("watchlist")
      .select("id,ticker")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });
    setItems((data ?? []) as Item[]);
    setLoading(false);
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [user]);

  const tickers = useMemo(() => items.map((i) => i.ticker), [items]);

  const quotesQuery = useQuery({
    queryKey: ["wl-quotes", tickers],
    queryFn: () => fetchQuotes({ data: { tickers } }),
    enabled: tickers.length > 0,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const histQuery = useQuery({
    queryKey: ["wl-hist", tickers],
    queryFn: async () => {
      const results = await Promise.all(
        tickers.map((t) => fetchHistory({ data: { ticker: t, range: "1y" } }).catch(() => null)),
      );
      const map: Record<string, { closes: number[]; high52: number; low52: number; vol: number }> =
        {};
      tickers.forEach((t, idx) => {
        const h = results[idx];
        if (!h) return;
        const closes = h.history.map((p) => p.close);
        const last = closes[closes.length - 1] ?? 0;
        map[t] = {
          closes: closes.slice(-30),
          high52: closes.length ? Math.max(...closes) : last,
          low52: closes.length ? Math.min(...closes) : last,
          vol: h.history[h.history.length - 1]?.volume ?? 0,
        };
      });
      return map;
    },
    enabled: tickers.length > 0,
    staleTime: 10 * 60_000,
  });

  const handleAdd = async () => {
    if (!user) return;
    if (items.some((i) => i.ticker === selected)) {
      toast.info("Already in watchlist");
      return;
    }
    const { error } = await supabase
      .from("watchlist")
      .insert({ user_id: user.id, ticker: selected });
    if (error) toast.error(error.message);
    else {
      toast.success("Added");
      load();
    }
  };

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from("watchlist").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  const handleAddToPortfolio = async (ticker: string, last: number) => {
    if (!user) return;
    const cfg = getTickerConfig(ticker);
    const { error } = await supabase.from("portfolio").insert({
      user_id: user.id,
      ticker,
      company_name: cfg?.name ?? ticker,
      qty: 1,
      buy_price: last || 0,
      buy_date: new Date().toISOString().split("T")[0],
    });
    if (error) toast.error(error.message);
    else toast.success(`${ticker} added to portfolio`);
  };

  const cards = useMemo(() => {
    const qmap = new Map(quotesQuery.data?.map((q) => [q.ticker, q]) ?? []);
    const hmap = histQuery.data ?? {};
    const rows = items.map((it) => {
      const q = qmap.get(it.ticker);
      const h = hmap[it.ticker];
      return {
        id: it.id,
        ticker: it.ticker,
        last: q?.last ?? 0,
        changePct: q?.changePct ?? 0,
        sparkline: h?.closes ?? [],
        high52: h?.high52 ?? 0,
        low52: h?.low52 ?? 0,
        volume: h?.vol ?? 0,
      };
    });
    switch (sortMode) {
      case "movers":
        rows.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
        break;
      case "volume":
        rows.sort((a, b) => b.volume - a.volume);
        break;
      case "high52":
        rows.sort((a, b) => (a.high52 ? b.last / b.high52 - a.last / a.high52 : 0));
        break;
    }
    return rows;
  }, [items, quotesQuery.data, histQuery.data, sortMode]);

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
      <header className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-glow-green">Watchlist</h1>
          <p className="text-muted-foreground mt-1 text-sm">Live prices, sparklines & 52-week ranges.</p>
        </div>
        <button
          onClick={() => quotesQuery.refetch()}
          className="px-3 py-2 rounded-md bg-secondary text-foreground text-sm font-semibold flex items-center gap-1.5 hover:bg-secondary/70 transition"
        >
          <RefreshCw className={`size-4 ${quotesQuery.isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      <div className="mb-6">
        <GlobalSearch />
      </div>

      <div className="glass-card p-5 mb-6 flex flex-wrap gap-3 items-center">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:border-primary"
        >
          {ALL_TICKERS.map((t) => (
            <option key={t} value={t}>
              {t} — {TICKER_CONFIG[t as keyof typeof TICKER_CONFIG].name}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition flex items-center gap-2"
        >
          <Plus className="size-4" /> Add to watchlist
        </button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {(
            [
              { id: "movers", label: "Biggest movers" },
              { id: "volume", label: "Highest volume" },
              { id: "high52", label: "Near 52W high" },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setSortMode(s.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                sortMode === s.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse h-44 bg-secondary/30" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Star className="size-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Your watchlist is empty. Add a ticker above to start tracking.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => {
            const cfg = getTickerConfig(c.ticker);
            const up = c.changePct >= 0;
            const range = c.high52 - c.low52 || 1;
            const pos = Math.min(100, Math.max(0, ((c.last - c.low52) / range) * 100));
            return (
              <div
                key={c.id}
                className="glass-card p-5 transition hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-heading font-bold">{c.ticker}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{cfg?.name}</div>
                  </div>
                  <button
                    onClick={() => handleRemove(c.id)}
                    title="Remove"
                    className="text-muted-foreground hover:text-destructive transition"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="flex items-end justify-between gap-2 mb-3">
                  <div>
                    <div className="font-mono-nums text-2xl font-bold">
                      {c.last ? formatPrice(c.last, cfg?.currency) : "—"}
                    </div>
                    <div
                      className={`font-mono-nums text-sm font-semibold mt-1 ${up ? "text-primary" : "text-destructive"}`}
                    >
                      {formatChangePct(c.changePct)}
                    </div>
                  </div>
                  <Sparkline values={c.sparkline} width={110} height={36} positive={up} />
                </div>

                {c.high52 > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      <span>52W L {formatPrice(c.low52, cfg?.currency)}</span>
                      <span>52W H {formatPrice(c.high52, cfg?.currency)}</span>
                    </div>
                    <div className="h-1 rounded bg-secondary relative">
                      <div
                        className="absolute top-0 size-2 -mt-0.5 rounded-full bg-primary shadow-glow"
                        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/forecast"
                    search={{ ticker: c.ticker, model: "Ensemble" }}
                    className="px-2 py-2 rounded-md bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition flex items-center justify-center gap-1"
                  >
                    <TrendingUp className="size-3.5" /> Forecast
                  </Link>
                  <button
                    onClick={() => handleAddToPortfolio(c.ticker, c.last)}
                    className="px-2 py-2 rounded-md bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/70 transition flex items-center justify-center gap-1"
                  >
                    <Briefcase className="size-3.5" /> Portfolio
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
