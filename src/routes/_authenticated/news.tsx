import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { aiMarketNews } from "@/lib/ai.functions";
import { Newspaper, RefreshCw, TrendingUp, TrendingDown, Minus, Star, Search, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { PageShell } from "@/components/PageShell";
import { ALL_TICKERS, TICKER_CONFIG } from "@/lib/tickerConfig";
import { aiNotConfiguredMessage } from "@/lib/aiProvider";

export const Route = createFileRoute("/_authenticated/news")({ component: NewsPage });

interface NewsItem {
  headline: string;
  summary: string;
  sentiment: string;
  ticker: string;
}

const TABS = [
  { id: "india", label: "India", topic: "Indian equity markets NSE BSE NIFTY Bank Nifty" },
  { id: "sectors", label: "Sectors", topic: "Indian sector trends Banking IT FMCG Pharma Auto Energy" },
  { id: "ipo", label: "IPO", topic: "Indian IPO market upcoming listings subscription GMP" },
  { id: "watchlist", label: "Watchlist", topic: "" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const SUGGESTIONS = ["TCS", "Reliance", "Banking", "NIFTY", "IPO", "HDFCBANK", "IT Sector", "BANKNIFTY"];
const RECENT_KEY = "sv:news:recent";

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function NewsPage() {
  const user = useAuthStore((s) => s.user);
  const fetchNews = useServerFn(aiMarketNews);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabId>("india");
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    setRecent(loadRecent());
    if (!user) return;
    supabase
      .from("watchlist")
      .select("ticker")
      .eq("user_id", user.id)
      .then(({ data }) => setWatchlist((data ?? []).map((r) => r.ticker)));
  }, [user]);

  const topic = useMemo(() => {
    if (query.trim()) return query.trim();
    if (tab === "watchlist") {
      if (!watchlist.length) return "Indian equity markets";
      return `news for tickers: ${watchlist.join(", ")}`;
    }
    return TABS.find((t) => t.id === tab)?.topic ?? "Indian markets";
  }, [tab, watchlist, query]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (it) =>
        it.headline.toLowerCase().includes(q) ||
        it.summary.toLowerCase().includes(q) ||
        it.ticker.toLowerCase().includes(q),
    );
  }, [items, query]);

  const load = async (searchQ?: string) => {
    const q = (searchQ ?? query).trim();
    if (q) {
      const r = [q, ...loadRecent().filter((x) => x !== q)].slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(r));
      setRecent(r);
    }
    setLoading(true);
    setAiError(null);
    try {
      const res = await fetchNews({ data: { topic, query: q || topic } });
      if ((res as { error?: string }).error) {
        setAiError((res as { error?: string }).error!);
        setItems([]);
      } else {
        setItems(res.items ?? []);
      }
    } catch (e) {
      const msg = (e as Error).message;
      setAiError(msg.includes("not configured") ? aiNotConfiguredMessage() : msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const searchTickers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return ALL_TICKERS.filter((t) => {
      const cfg = TICKER_CONFIG[t as keyof typeof TICKER_CONFIG];
      return t.toLowerCase().includes(term) || cfg?.name?.toLowerCase().includes(term);
    }).slice(0, 6);
  }, [query]);

  const Icon = (s: string) =>
    s === "bullish" ? (
      <TrendingUp className="size-4 text-primary" />
    ) : s === "bearish" ? (
      <TrendingDown className="size-4 text-destructive" />
    ) : (
      <Minus className="size-4 text-muted-foreground" />
    );

  return (
    <PageShell title="Market News" subtitle="AI-curated headlines with sentiment and keyword search.">
      <div className="glass-card p-4 mb-6">
        <div className="flex gap-2 items-center">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search: TCS, Reliance, Banking, NIFTY, IPO…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground">
              <X className="size-4" />
            </button>
          )}
          <button
            onClick={() => load()}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Search
          </button>
        </div>
        {searchTickers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {searchTickers.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setQuery(t.replace(".NS", ""));
                  load(t.replace(".NS", ""));
                }}
                className="px-2 py-0.5 rounded bg-secondary text-xs font-mono-nums hover:bg-primary/15"
              >
                {t}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-muted-foreground w-full">Trending:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuery(s);
                load(s);
              }}
              className="px-2 py-0.5 rounded-full bg-secondary text-xs hover:bg-primary/15"
            >
              {s}
            </button>
          ))}
        </div>
        {recent.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs text-muted-foreground w-full">Recent:</span>
            {recent.map((s) => (
              <button key={s} onClick={() => { setQuery(s); load(s); }} className="px-2 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition flex items-center gap-1.5 ${
              tab === t.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.id === "watchlist" && <Star className="size-3.5" />} {t.label}
          </button>
        ))}
      </div>

      {aiError && (
        <div className="glass-card p-4 mb-4 border border-warning/30 text-sm text-muted-foreground">{aiError}</div>
      )}

      {filtered.length === 0 && !loading && !aiError && (
        <div className="glass-card p-12 text-center text-muted-foreground">
          Search or click <span className="text-primary font-semibold">Refresh</span> to load market news.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5 animate-pulse h-32 bg-secondary/30" />
        ))}
        {filtered.map((it, i) => (
          <div key={i} className="glass-card p-4 sm:p-5 hover:border-primary/40 transition">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-heading font-bold text-foreground text-sm sm:text-base">{it.headline}</h3>
              {Icon(it.sentiment)}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{it.summary}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono-nums px-2 py-1 rounded bg-secondary">{it.ticker}</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{it.sentiment}</span>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
