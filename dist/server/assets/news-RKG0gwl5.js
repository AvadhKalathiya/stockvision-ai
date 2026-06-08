import { k as createServerFn, X as reactExports, N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
import { c as createSsrRpc, u as useServerFn } from "./createSsrRpc-CXvRzAXX.js";
import { r as requireSupabaseAuth } from "./auth-middleware-BerO8flI.js";
import { w as useAuthStore, v as toast } from "./router-C3k8-z80.js";
import { s as supabase } from "./client-T0sJvQy8.js";
import { P as PageShell } from "./PageShell-AvoXgHto.js";
import { A as ALL_TICKERS, T as TICKER_CONFIG } from "./tickerConfig-7S1tvlm8.js";
import { c as aiNotConfiguredMessage } from "./aiProvider-Cvi-Tcv4.js";
import { S as Search } from "./search-CogVE9sq.js";
import { X } from "./x-DJQb9mxA.js";
import { R as RefreshCw } from "./refresh-cw-BUr9OHaX.js";
import { S as Star } from "./star-DhPIhgY3.js";
import { T as TrendingUp } from "./trending-up-r08gGgu4.js";
import { T as TrendingDown } from "./trending-down-DVlp6VhU.js";
import { c as createLucideIcon } from "./createLucideIcon-DvD_YuaJ.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
const __iconNode = [["path", { d: "M5 12h14", key: "1ays0h" }]];
const Minus = createLucideIcon("minus", __iconNode);
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("52c6530446fcacbae40b7cd8c260a8d9841cd92a76c694b3e29238c1b3a56552"));
const aiMarketNews = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("848fff2f03dcc14a4bc91973ff2de552afd0bce241221ad2a2769017aa444d5b"));
const TABS = [{
  id: "india",
  label: "India",
  topic: "Indian equity markets NSE BSE NIFTY Bank Nifty"
}, {
  id: "sectors",
  label: "Sectors",
  topic: "Indian sector trends Banking IT FMCG Pharma Auto Energy"
}, {
  id: "ipo",
  label: "IPO",
  topic: "Indian IPO market upcoming listings subscription GMP"
}, {
  id: "watchlist",
  label: "Watchlist",
  topic: ""
}];
const SUGGESTIONS = ["TCS", "Reliance", "Banking", "NIFTY", "IPO", "HDFCBANK", "IT Sector", "BANKNIFTY"];
const RECENT_KEY = "sv:news:recent";
function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}
function NewsPage() {
  const user = useAuthStore((s) => s.user);
  const fetchNews = useServerFn(aiMarketNews);
  const [items, setItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [tab, setTab] = reactExports.useState("india");
  const [watchlist, setWatchlist] = reactExports.useState([]);
  const [query, setQuery] = reactExports.useState("");
  const [recent, setRecent] = reactExports.useState([]);
  const [aiError, setAiError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    setRecent(loadRecent());
    if (!user) return;
    supabase.from("watchlist").select("ticker").eq("user_id", user.id).then(({
      data
    }) => setWatchlist((data ?? []).map((r) => r.ticker)));
  }, [user]);
  const topic = reactExports.useMemo(() => {
    if (query.trim()) return query.trim();
    if (tab === "watchlist") {
      if (!watchlist.length) return "Indian equity markets";
      return `news for tickers: ${watchlist.join(", ")}`;
    }
    return TABS.find((t) => t.id === tab)?.topic ?? "Indian markets";
  }, [tab, watchlist, query]);
  const filtered = reactExports.useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((it) => it.headline.toLowerCase().includes(q) || it.summary.toLowerCase().includes(q) || it.ticker.toLowerCase().includes(q));
  }, [items, query]);
  const load = async (searchQ) => {
    const q = (searchQ ?? query).trim();
    if (q) {
      const r = [q, ...loadRecent().filter((x) => x !== q)].slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(r));
      setRecent(r);
    }
    setLoading(true);
    setAiError(null);
    try {
      const res = await fetchNews({
        data: {
          topic,
          query: q || topic
        }
      });
      if (res.error) {
        setAiError(res.error);
        setItems([]);
      } else {
        setItems(res.items ?? []);
      }
    } catch (e) {
      const msg = e.message;
      setAiError(msg.includes("not configured") ? aiNotConfiguredMessage() : msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  const searchTickers = reactExports.useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return ALL_TICKERS.filter((t) => {
      const cfg = TICKER_CONFIG[t];
      return t.toLowerCase().includes(term) || cfg?.name?.toLowerCase().includes(term);
    }).slice(0, 6);
  }, [query]);
  const Icon = (s) => s === "bullish" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-4 text-primary" }) : s === "bearish" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "size-4 text-destructive" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "size-4 text-muted-foreground" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageShell, { title: "Market News", subtitle: "AI-curated headlines with sentiment and keyword search.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-4 text-muted-foreground shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: query, onChange: (e) => setQuery(e.target.value), onKeyDown: (e) => e.key === "Enter" && load(), placeholder: "Search: TCS, Reliance, Banking, NIFTY, IPO…", className: "flex-1 bg-transparent outline-none text-sm" }),
        query && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setQuery(""), className: "text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => load(), disabled: loading, className: "px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1 disabled:opacity-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `size-3.5 ${loading ? "animate-spin" : ""}` }),
          " Search"
        ] })
      ] }),
      searchTickers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mt-3", children: searchTickers.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        setQuery(t.replace(".NS", ""));
        load(t.replace(".NS", ""));
      }, className: "px-2 py-0.5 rounded bg-secondary text-xs font-mono-nums hover:bg-primary/15", children: t }, t)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground w-full", children: "Trending:" }),
        SUGGESTIONS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setQuery(s);
          load(s);
        }, className: "px-2 py-0.5 rounded-full bg-secondary text-xs hover:bg-primary/15", children: s }, s))
      ] }),
      recent.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground w-full", children: "Recent:" }),
        recent.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setQuery(s);
          load(s);
        }, className: "px-2 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground", children: s }, s))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mb-6", children: TABS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab(t.id), className: `px-4 py-2 rounded-md text-sm font-semibold transition flex items-center gap-1.5 ${tab === t.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`, children: [
      t.id === "watchlist" && /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "size-3.5" }),
      " ",
      t.label
    ] }, t.id)) }),
    aiError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-card p-4 mb-4 border border-warning/30 text-sm text-muted-foreground", children: aiError }),
    filtered.length === 0 && !loading && !aiError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-12 text-center text-muted-foreground", children: [
      "Search or click ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-semibold", children: "Refresh" }),
      " to load market news."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      loading && Array.from({
        length: 4
      }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-card p-5 animate-pulse h-32 bg-secondary/30" }, i)),
      filtered.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 sm:p-5 hover:border-primary/40 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-heading font-bold text-foreground text-sm sm:text-base", children: it.headline }),
          Icon(it.sentiment)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-3", children: it.summary }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono-nums px-2 py-1 rounded bg-secondary", children: it.ticker }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: it.sentiment })
        ] })
      ] }, i))
    ] })
  ] });
}
export {
  NewsPage as component
};
