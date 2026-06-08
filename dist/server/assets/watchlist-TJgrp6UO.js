import { X as reactExports, N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
import { w as useAuthStore, L as Link, v as toast } from "./router-C3k8-z80.js";
import { u as useQuery } from "./useQuery-DpcV55YJ.js";
import { u as useServerFn } from "./createSsrRpc-CXvRzAXX.js";
import { s as supabase } from "./client-T0sJvQy8.js";
import { A as ALL_TICKERS, T as TICKER_CONFIG, d as getTickerConfig, b as formatPrice, f as formatChangePct } from "./tickerConfig-7S1tvlm8.js";
import { b as getLiveQuotes, a as getLiveHistory } from "./yahooFinance.functions-CNaRUXD5.js";
import { S as Sparkline } from "./Sparkline-B4diw_8e.js";
import { G as GlobalSearch } from "./GlobalSearch-lo70RBD4.js";
import { g as getLimits } from "./planLimits-DfVfhYvW.js";
import { R as RefreshCw } from "./refresh-cw-BUr9OHaX.js";
import { P as Plus } from "./plus-CSvLupSh.js";
import { S as Star } from "./star-DhPIhgY3.js";
import { T as Trash2 } from "./trash-2-B3iTgfN2.js";
import { T as TrendingUp } from "./trending-up-r08gGgu4.js";
import { B as Briefcase } from "./briefcase-CdypnbFT.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
import "./aiProvider-Cvi-Tcv4.js";
import "./types-BfPr8xct.js";
import "./search-CogVE9sq.js";
import "./createLucideIcon-DvD_YuaJ.js";
import "./x-DJQb9mxA.js";
function WatchlistPage() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);
  const [items, setItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [selected, setSelected] = reactExports.useState("TCS.NS");
  const [sortMode, setSortMode] = reactExports.useState("movers");
  const fetchQuotes = useServerFn(getLiveQuotes);
  const fetchHistory = useServerFn(getLiveHistory);
  const load = async () => {
    if (!user) return;
    const {
      data
    } = await supabase.from("watchlist").select("id,ticker").eq("user_id", user.id).order("added_at", {
      ascending: false
    });
    setItems(data ?? []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    load();
  }, [user]);
  const tickers = reactExports.useMemo(() => items.map((i) => i.ticker), [items]);
  const quotesQuery = useQuery({
    queryKey: ["wl-quotes", tickers],
    queryFn: () => fetchQuotes({
      data: {
        tickers
      }
    }),
    enabled: tickers.length > 0,
    refetchInterval: 6e4,
    staleTime: 3e4
  });
  const histQuery = useQuery({
    queryKey: ["wl-hist", tickers],
    queryFn: async () => {
      const results = await Promise.all(tickers.map((t) => fetchHistory({
        data: {
          ticker: t,
          range: "1y"
        }
      }).catch(() => null)));
      const map = {};
      tickers.forEach((t, idx) => {
        const h = results[idx];
        if (!h) return;
        const closes = h.history.map((p) => p.close);
        const last = closes[closes.length - 1] ?? 0;
        map[t] = {
          closes: closes.slice(-30),
          high52: closes.length ? Math.max(...closes) : last,
          low52: closes.length ? Math.min(...closes) : last,
          vol: h.history[h.history.length - 1]?.volume ?? 0
        };
      });
      return map;
    },
    enabled: tickers.length > 0,
    staleTime: 10 * 6e4
  });
  const handleAdd = async () => {
    if (!user) return;
    if (limits.watchlistMax !== Infinity && items.length >= limits.watchlistMax) {
      toast.error(`Watchlist limit (${limits.watchlistMax}) reached. Upgrade for more.`);
      return;
    }
    if (items.some((i) => i.ticker === selected)) {
      toast.info("Already in watchlist");
      return;
    }
    const {
      error
    } = await supabase.from("watchlist").insert({
      user_id: user.id,
      ticker: selected
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Added");
      load();
    }
  };
  const handleRemove = async (id) => {
    const {
      error
    } = await supabase.from("watchlist").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };
  const handleAddToPortfolio = async (ticker, last) => {
    if (!user) return;
    const cfg = getTickerConfig(ticker);
    const {
      error
    } = await supabase.from("portfolio").insert({
      user_id: user.id,
      ticker,
      company_name: cfg?.name ?? ticker,
      qty: 1,
      buy_price: last || 0,
      buy_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    });
    if (error) toast.error(error.message);
    else toast.success(`${ticker} added to portfolio`);
  };
  const cards = reactExports.useMemo(() => {
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
        volume: h?.vol ?? 0
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
        rows.sort((a, b) => a.high52 ? b.last / b.high52 - a.last / a.high52 : 0);
        break;
    }
    return rows;
  }, [items, quotesQuery.data, histQuery.data, sortMode]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-6 flex items-start justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-heading text-3xl font-bold text-glow-green", children: "Watchlist" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Live prices, sparklines & 52-week ranges." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => quotesQuery.refetch(), className: "px-3 py-2 rounded-md bg-secondary text-foreground text-sm font-semibold flex items-center gap-1.5 hover:bg-secondary/70 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `size-4 ${quotesQuery.isFetching ? "animate-spin" : ""}` }),
        "Refresh"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalSearch, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-5 mb-6 flex flex-wrap gap-3 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: selected, onChange: (e) => setSelected(e.target.value), className: "flex-1 min-w-[200px] px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:border-primary", children: ALL_TICKERS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: t, children: [
        t,
        " — ",
        TICKER_CONFIG[t].name
      ] }, t)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleAdd, className: "px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
        " Add to watchlist"
      ] })
    ] }),
    items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mb-4", children: [{
      id: "movers",
      label: "Biggest movers"
    }, {
      id: "volume",
      label: "Highest volume"
    }, {
      id: "high52",
      label: "Near 52W high"
    }].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSortMode(s.id), className: `px-3 py-1.5 rounded-md text-xs font-semibold transition ${sortMode === s.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`, children: s.label }, s.id)) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: Array.from({
      length: 6
    }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-card p-5 animate-pulse h-44 bg-secondary/30" }, i)) }) : items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "size-12 text-muted-foreground mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Your watchlist is empty. Add a ticker above to start tracking." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: cards.map((c) => {
      const cfg = getTickerConfig(c.ticker);
      const up = c.changePct >= 0;
      const range = c.high52 - c.low52 || 1;
      const pos = Math.min(100, Math.max(0, (c.last - c.low52) / range * 100));
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-5 transition hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-heading font-bold", children: c.ticker }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground line-clamp-1", children: cfg?.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleRemove(c.id), title: "Remove", className: "text-muted-foreground hover:text-destructive transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-nums text-2xl font-bold", children: c.last ? formatPrice(c.last, cfg?.currency) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-mono-nums text-sm font-semibold mt-1 ${up ? "text-primary" : "text-destructive"}`, children: formatChangePct(c.changePct) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkline, { values: c.sparkline, width: 110, height: 36, positive: up })
        ] }),
        c.high52 > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "52W L ",
              formatPrice(c.low52, cfg?.currency)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "52W H ",
              formatPrice(c.high52, cfg?.currency)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 rounded bg-secondary relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 size-2 -mt-0.5 rounded-full bg-primary shadow-glow", style: {
            left: `${pos}%`,
            transform: "translateX(-50%)"
          } }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/forecast", search: {
            ticker: c.ticker,
            model: "Ensemble"
          }, className: "px-2 py-2 rounded-md bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition flex items-center justify-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-3.5" }),
            " Forecast"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleAddToPortfolio(c.ticker, c.last), className: "px-2 py-2 rounded-md bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/70 transition flex items-center justify-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "size-3.5" }),
            " Portfolio"
          ] })
        ] })
      ] }, c.id);
    }) })
  ] });
}
export {
  WatchlistPage as component
};
