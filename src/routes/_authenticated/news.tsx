import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { aiMarketNews } from "@/lib/ai.functions";
import { Newspaper, RefreshCw, TrendingUp, TrendingDown, Minus, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";

export const Route = createFileRoute("/_authenticated/news")({ component: NewsPage });

interface NewsItem {
  headline: string;
  summary: string;
  sentiment: string;
  ticker: string;
}

const TABS = [
  {
    id: "india",
    label: "India",
    topic: "Indian equity markets — NSE BSE, Nifty, Bank Nifty, large caps",
  },
  {
    id: "global",
    label: "Global",
    topic: "US tech stocks, S&P 500, Nasdaq, major global equities",
  },
  { id: "crypto", label: "Crypto", topic: "Bitcoin, Ethereum and altcoin markets" },
  { id: "watchlist", label: "Watchlist", topic: "" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function NewsPage() {
  const user = useAuthStore((s) => s.user);
  const fetchNews = useServerFn(aiMarketNews);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabId>("india");
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("watchlist")
      .select("ticker")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setWatchlist((data ?? []).map((r) => r.ticker));
      });
  }, [user]);

  const topic = useMemo(() => {
    if (tab === "watchlist") {
      if (!watchlist.length) return "global markets";
      return `news affecting these tickers: ${watchlist.join(", ")}`;
    }
    return TABS.find((t) => t.id === tab)?.topic ?? "";
  }, [tab, watchlist]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchNews({ data: { topic } });
      setItems(res.items ?? []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setItems([]);
  }, [tab]);

  const Icon = (s: string) =>
    s === "bullish" ? (
      <TrendingUp className="size-4 text-primary" />
    ) : s === "bearish" ? (
      <TrendingDown className="size-4 text-destructive" />
    ) : (
      <Minus className="size-4 text-muted-foreground" />
    );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-6 flex items-center gap-3">
        <Newspaper className="size-6 text-primary" />
        <div className="flex-1">
          <h1 className="font-heading text-3xl font-bold text-glow-green">Market News</h1>
          <p className="text-muted-foreground text-sm">AI-curated headlines with sentiment.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading…" : "Refresh"}
        </button>
      </header>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition flex items-center gap-1.5 ${
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.id === "watchlist" && <Star className="size-3.5" />} {t.label}
            {t.id === "watchlist" && watchlist.length > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-background/20">
                {watchlist.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "watchlist" && watchlist.length === 0 && (
        <div className="glass-card p-6 mb-4 text-sm text-muted-foreground">
          Add tickers to your watchlist to get personalized news.
        </div>
      )}

      {items.length === 0 && !loading && (
        <div className="glass-card p-12 text-center text-muted-foreground">
          Click <span className="text-primary font-semibold">Refresh</span> to fetch AI-generated
          market news.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse h-32 bg-secondary/30" />
          ))}
        {items.map((it, i) => (
          <div key={i} className="glass-card p-5 hover:border-primary/40 transition">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-heading font-bold text-foreground">{it.headline}</h3>
              {Icon(it.sentiment)}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{it.summary}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono-nums px-2 py-1 rounded bg-secondary text-foreground">
                {it.ticker}
              </span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {it.sentiment}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        SEBI Disclaimer: AI-generated content for informational purposes. Verify before acting.
      </p>
    </div>
  );
}
