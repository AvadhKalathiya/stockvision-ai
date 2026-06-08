import { N as jsxRuntimeExports, X as reactExports } from "./server-Cgfy5VtR.js";
import { w as useAuthStore, L as Link, x as useNavigate } from "./router-C3k8-z80.js";
import { u as useQuery } from "./useQuery-DpcV55YJ.js";
import { u as useServerFn } from "./createSsrRpc-CXvRzAXX.js";
import { N as NIFTY50_TICKERS, a as NIFTY_NEXT50_TICKERS, T as TICKER_CONFIG, f as formatChangePct, b as formatPrice, A as ALL_TICKERS, c as formatVolume } from "./tickerConfig-7S1tvlm8.js";
import { t as topMovers, c as computeMarketBreadth, C as ChartColumn } from "./marketOverview-Cmjpw8gU.js";
import { a as getLiveHistory } from "./yahooFinance.functions-CNaRUXD5.js";
import { s as supabase } from "./client-T0sJvQy8.js";
import { G as GlobalSearch } from "./GlobalSearch-lo70RBD4.js";
import { R as Radio } from "./radio-B5QjGWC0.js";
import { S as Sparkline } from "./Sparkline-B4diw_8e.js";
import { u as useLiveQuotes } from "./useLiveQuotes-a6H7Jnr0.js";
import { P as PageShell } from "./PageShell-AvoXgHto.js";
import { Q as QueryError, a as QueryLoading } from "./QueryState-D4yWYCiQ.js";
import { g as getLimits } from "./planLimits-DfVfhYvW.js";
import { P as PlanGate } from "./PlanGate-DsC5xI-0.js";
import { S as Sparkles } from "./sparkles-BzGaueQV.js";
import { T as TrendingUp } from "./trending-up-r08gGgu4.js";
import { R as RefreshCw } from "./refresh-cw-BUr9OHaX.js";
import { A as Activity } from "./activity-q82JxRi-.js";
import { T as TrendingDown } from "./trending-down-DVlp6VhU.js";
import { B as Briefcase } from "./briefcase-CdypnbFT.js";
import { Z as Zap } from "./zap-s63ztzaO.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
import "./aiProvider-Cvi-Tcv4.js";
import "./createLucideIcon-DvD_YuaJ.js";
import "./types-BfPr8xct.js";
import "./search-CogVE9sq.js";
import "./x-DJQb9mxA.js";
import "./loader-circle-Byol8VGZ.js";
import "./triangle-alert-Vsq-qEcN.js";
import "./lock-DqkAvhsx.js";
function nseOpen(now = /* @__PURE__ */ new Date()) {
  const ist = new Date(now.getTime() + (5.5 * 60 - now.getTimezoneOffset()) * 6e4);
  const day = ist.getUTCDay();
  if (day === 0 || day === 6) return false;
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return mins >= 9 * 60 + 15 && mins <= 15 * 60 + 30;
}
function usOpen(now = /* @__PURE__ */ new Date()) {
  const day = now.getUTCDay();
  if (day === 0 || day === 6) return false;
  const mins = now.getUTCHours() * 60 + now.getUTCMinutes();
  return mins >= 14 * 60 + 30 && mins <= 21 * 60;
}
function MarketStatus() {
  const nse = nseOpen();
  const us = usOpen();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { label: "NSE", open: nse }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { label: "US", open: us }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { label: "CRYPTO", open: true })
  ] });
}
function Pill({ label, open }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: `inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border ${open ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary text-muted-foreground border-border"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: `size-3 ${open ? "animate-pulse" : ""}` }),
        label,
        " ",
        open ? "OPEN" : "CLOSED"
      ]
    }
  );
}
function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);
  const [filter, setFilter] = reactExports.useState("NIFTY50");
  const {
    quotes,
    isFetching,
    isLoading,
    isError,
    error,
    refetch,
    dataUpdatedAt
  } = useLiveQuotes();
  const stockQuotes = reactExports.useMemo(() => {
    if (filter === "NIFTY50") return quotes.filter((q) => NIFTY50_TICKERS.includes(q.ticker));
    if (filter === "NEXT50") return quotes.filter((q) => NIFTY_NEXT50_TICKERS.includes(q.ticker));
    return quotes.filter((q) => !["NIFTY50", "NIFTYNEXT50", "BANKNIFTY", "SENSEX"].includes(q.ticker));
  }, [filter, quotes]);
  const movers = reactExports.useMemo(() => topMovers(stockQuotes, 5), [stockQuotes]);
  const gainers = movers.gainers;
  const losers = movers.losers;
  const breadth = reactExports.useMemo(() => computeMarketBreadth(stockQuotes), [stockQuotes]);
  const avgChange = reactExports.useMemo(() => stockQuotes.length ? stockQuotes.reduce((a, b) => a + b.changePct, 0) / stockQuotes.length : 0, [stockQuotes]);
  const liveCount = quotes.filter((q) => q.source === "yahoo").length;
  const sentiment = reactExports.useMemo(() => {
    const bullish = gainers.length;
    const total = stockQuotes.length || 1;
    return Math.round(bullish / total * 100);
  }, [gainers.length, stockQuotes.length]);
  const nifty = quotes.find((q) => q.ticker === "NIFTY50");
  const niftyNext = quotes.find((q) => q.ticker === "NIFTYNEXT50");
  const sensex = quotes.find((q) => q.ticker === "SENSEX");
  const bankNifty = quotes.find((q) => q.ticker === "BANKNIFTY");
  const sectorLeaders = reactExports.useMemo(() => {
    const sectors = {};
    for (const q of stockQuotes) {
      const sector = TICKER_CONFIG[q.ticker]?.sector ?? "Other";
      if (!sectors[sector]) sectors[sector] = {
        total: 0,
        count: 0
      };
      sectors[sector].total += q.changePct;
      sectors[sector].count += 1;
    }
    return Object.entries(sectors).map(([sector, {
      total,
      count
    }]) => ({
      sector,
      avg: total / count
    })).sort((a, b) => b.avg - a.avg).slice(0, 4);
  }, [stockQuotes]);
  const topGainer = gainers[0];
  const topLoser = losers[0];
  const [holdings, setHoldings] = reactExports.useState([]);
  const [watch, setWatch] = reactExports.useState([]);
  const [recent, setRecent] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!user) return;
    supabase.from("portfolio").select("ticker,qty,buy_price").eq("user_id", user.id).then(({
      data
    }) => setHoldings(data ?? []));
    supabase.from("watchlist").select("ticker").eq("user_id", user.id).limit(3).order("added_at", {
      ascending: false
    }).then(({
      data
    }) => setWatch((data ?? []).map((r) => r.ticker)));
    supabase.from("forecast_history").select("id,ticker,model,recommendation,created_at").eq("user_id", user.id).order("created_at", {
      ascending: false
    }).limit(3).then(({
      data
    }) => setRecent(data ?? []));
  }, [user]);
  const portfolioSummary = reactExports.useMemo(() => {
    let invested = 0, value = 0;
    for (const h of holdings) {
      const q = quotes.find((x) => x.ticker === h.ticker);
      const live = q?.last ?? 0;
      invested += Number(h.buy_price) * Number(h.qty);
      value += live * Number(h.qty);
    }
    const pnl = value - invested;
    const pct = invested > 0 ? pnl / invested * 100 : 0;
    return {
      invested,
      value,
      pnl,
      pct,
      count: holdings.length
    };
  }, [holdings, quotes]);
  const aiBriefing = reactExports.useMemo(() => {
    const niftyPct = nifty?.changePct ?? 0;
    const mood = sentiment >= 60 ? "bullish" : sentiment <= 40 ? "bearish" : "mixed";
    const leader = sectorLeaders[0];
    return {
      mood,
      text: `NIFTY 50 is ${niftyPct >= 0 ? "up" : "down"} ${formatChangePct(niftyPct)}. Market sentiment is ${mood} with ${gainers.length} gainers vs ${losers.length} losers. ${leader ? `${leader.sector} leads sectors at ${formatChangePct(leader.avg)} avg.` : ""}`,
      topGainer: topGainer ? `${topGainer.ticker} (${formatChangePct(topGainer.changePct)})` : "—",
      topLoser: topLoser ? `${topLoser.ticker} (${formatChangePct(topLoser.changePct)})` : "—"
    };
  }, [nifty, sentiment, gainers.length, losers.length, sectorLeaders, topGainer, topLoser]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageShell, { title: "Market Dashboard", subtitle: "Live Indian equities terminal — NSE/BSE indices & top stocks.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/portfolio", className: "px-3 py-2 bg-secondary text-foreground rounded-md text-xs sm:text-sm font-semibold hover:bg-secondary/80 transition", children: "Portfolio" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/screener", className: "px-3 py-2 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-semibold hover:opacity-90 transition", children: "Screener" })
  ] }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalSearch, {}) }),
    isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(QueryError, { message: error?.message, onRetry: () => refetch(), label: "Market data unavailable" }) : isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(QueryLoading, { label: "Fetching live quotes…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(IndexCard, { label: "NIFTY 50", quote: nifty }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(IndexCard, { label: "NIFTY NEXT 50", quote: niftyNext }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(IndexCard, { label: "SENSEX", quote: sensex }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(IndexCard, { label: "BANK NIFTY", quote: bankNifty })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 sm:p-5 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-heading text-sm uppercase tracking-wider text-muted-foreground mb-3", children: "Market Breadth" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BreadthCell, { label: "Advances", value: breadth.advances, accent: "text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BreadthCell, { label: "Declines", value: breadth.declines, accent: "text-destructive" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BreadthCell, { label: "Unchanged", value: breadth.unchanged }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BreadthCell, { label: "A/D Ratio", value: breadth.ratio.toFixed(2) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sentiment-bar mt-3 flex h-2 rounded-full overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary", style: {
            width: `${breadth.total ? breadth.advances / breadth.total * 100 : 50}%`
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-destructive flex-1" })
        ] })
      ] }),
      limits.canAIMarketSummary ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 sm:p-6 mb-6 border-l-4 border-l-accent bg-accent/5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-heading font-bold text-base sm:text-lg mb-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-5 text-accent shrink-0" }),
          " AI Daily Briefing"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-3", children: aiBriefing.text }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-4" }),
            " ",
            sentiment,
            "% Bullish"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "Top Gainer:" }),
            " ",
            aiBriefing.topGainer
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "Top Loser:" }),
            " ",
            aiBriefing.topLoser
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sentiment-bar mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sentiment-fill bg-primary", style: {
          width: `${sentiment}%`
        } }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlanGate, { compact: true, requiredPlan: "student", title: "AI Market Summary", description: "Daily AI briefing with sector leaders, sentiment & movers — Student plan and above." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MarketStatus, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: `size-3.5 ${liveCount > 0 ? "text-primary animate-pulse" : "text-muted-foreground"}` }),
          liveCount,
          "/",
          quotes.length,
          " live",
          dataUpdatedAt ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-70", children: [
            "· ",
            new Date(dataUpdatedAt).toLocaleTimeString()
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => refetch(), disabled: isFetching, className: "px-3 py-1.5 rounded-md bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/70 transition disabled:opacity-50 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `size-3.5 ${isFetching ? "animate-spin" : ""}` }),
          " Refresh"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Tickers", value: quotes.length.toString(), icon: Activity }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Gainers", value: gainers.length.toString(), icon: TrendingUp, accent: "text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Losers", value: losers.length.toString(), icon: TrendingDown, accent: "text-destructive" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Avg Change", value: formatChangePct(avgChange), icon: ChartColumn, accent: avgChange >= 0 ? "text-primary" : "text-destructive" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PortfolioCard, { ...portfolioSummary }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(QuickForecastWidget, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RecentForecastsCard, { recent })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MoversCard, { title: "Top Gainers", items: gainers, positive: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MoversCard, { title: "Top Losers", items: losers, positive: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeCard, { title: "Volume Leaders", items: movers.volume }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MoversCard, { title: "Trending", items: movers.trending, positive: true })
      ] }),
      sectorLeaders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 sm:p-5 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-heading text-sm uppercase tracking-wider text-muted-foreground mb-3", children: "Sector Leaders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: sectorLeaders.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "metric-card p-3 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: s.sector }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-mono-nums font-bold text-sm mt-1 ${s.avg >= 0 ? "text-primary" : "text-destructive"}`, children: formatChangePct(s.avg) })
        ] }, s.sector)) })
      ] }),
      watch.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 sm:p-5 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-heading text-sm uppercase tracking-wider text-muted-foreground", children: "Watchlist" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/watchlist", className: "text-xs text-primary hover:underline", children: "View all →" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: watch.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(WatchlistMini, { ticker: t, quote: quotes.find((q) => q.ticker === t) }, t)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-4 flex-wrap", children: ["NIFTY50", "NEXT50", "ALL"].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(f), className: `px-4 py-1.5 rounded-md text-sm font-semibold transition ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`, children: f }, f)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-card page-table-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[600px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-secondary/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-xs uppercase tracking-wider text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Ticker" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 hidden sm:table-cell", children: "Exchange" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Change" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: stockQuotes.map((q) => {
          const cfg = TICKER_CONFIG[q.ticker];
          const up = q.changePct >= 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border hover:bg-secondary/30 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-semibold font-mono-nums text-sm", children: q.ticker }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm text-muted-foreground truncate max-w-[140px]", children: cfg?.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell", children: cfg?.exchange }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono-nums text-sm", children: formatPrice(q.last, cfg?.currency) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-3 text-right font-mono-nums text-sm font-semibold ${up ? "text-primary" : "text-destructive"}`, children: formatChangePct(q.changePct) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/forecast", search: {
              ticker: q.ticker,
              model: "Ensemble"
            }, className: "px-3 py-1 rounded-md bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition", children: "Forecast" }) })
          ] }, q.ticker);
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-6 text-center", children: "SEBI Disclaimer: All forecasts are AI-generated for educational purposes only. Not investment advice." })
  ] });
}
function BreadthCell({
  label,
  value,
  accent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "metric-card p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-mono-nums font-bold text-lg mt-1 ${accent ?? ""}`, children: value })
  ] });
}
function VolumeCard({
  title,
  items
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 sm:p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-heading text-sm uppercase tracking-wider text-muted-foreground mb-3", children: title }),
    items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No data" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: items.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex justify-between text-sm gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono-nums font-semibold truncate", children: q.ticker.replace(".NS", "") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono-nums text-muted-foreground shrink-0", children: formatVolume(q.volume) })
    ] }, q.ticker)) })
  ] });
}
function IndexCard({
  label,
  quote
}) {
  const up = (quote?.changePct ?? 0) >= 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "metric-card p-4 sm:p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-heading text-xl sm:text-2xl font-bold mt-2 font-mono-nums", children: quote?.last ? formatPrice(quote.last) : "—" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-sm font-mono-nums font-semibold mt-1 ${up ? "text-primary" : "text-destructive"}`, children: quote ? formatChangePct(quote.changePct) : "—" })
  ] });
}
function MoversCard({
  title,
  items,
  positive
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 sm:p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-heading text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2", children: [
      positive ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-4 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "size-4 text-destructive" }),
      title
    ] }),
    items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No movers today." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: items.map((q) => {
      const cfg = TICKER_CONFIG[q.ticker];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex justify-between items-center text-sm gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono-nums font-semibold", children: q.ticker }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground ml-2 truncate hidden sm:inline", children: cfg?.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-mono-nums font-bold shrink-0 ${positive ? "text-primary" : "text-destructive"}`, children: formatChangePct(q.changePct) })
      ] }, q.ticker);
    }) })
  ] });
}
function StatCard({
  label,
  value,
  icon: Icon,
  accent = "text-foreground"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 sm:p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `size-4 ${accent}` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-heading text-xl sm:text-2xl font-bold mt-2 font-mono-nums ${accent}`, children: value })
  ] });
}
function PortfolioCard({
  invested,
  value,
  pnl,
  pct,
  count
}) {
  const up = pnl >= 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 sm:p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "size-4 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Portfolio Snapshot" })
    ] }),
    count === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
      "No holdings.",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/portfolio", className: "text-primary hover:underline", children: "Add one →" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-heading text-xl sm:text-2xl font-bold font-mono-nums", children: formatPrice(value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `font-mono-nums text-sm font-semibold mt-1 ${up ? "text-primary" : "text-destructive"}`, children: [
        formatPrice(pnl),
        " (",
        formatChangePct(pct),
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-2", children: [
        count,
        " holdings · invested ",
        formatPrice(invested)
      ] })
    ] })
  ] });
}
function QuickForecastWidget() {
  const navigate = useNavigate();
  const [t, setT] = reactExports.useState("RELIANCE.NS");
  const [m, setM] = reactExports.useState("Ensemble");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 sm:p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "size-4 text-accent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Quick Forecast" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: t, onChange: (e) => setT(e.target.value), className: "w-full px-2 py-1.5 rounded-md bg-input border border-border text-sm mb-2", children: ALL_TICKERS.map((tk) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: tk, children: tk }, tk)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: m, onChange: (e) => setM(e.target.value), className: "w-full px-2 py-1.5 rounded-md bg-input border border-border text-sm mb-3", children: ["SARIMA", "Prophet", "LSTM", "Ensemble"].map((mm) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: mm, children: mm }, mm)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
      to: "/forecast",
      search: {
        ticker: t,
        model: m
      }
    }), className: "w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition", children: "Run forecast →" })
  ] });
}
function RecentForecastsCard({
  recent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 sm:p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Recent Forecasts" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/history", className: "text-xs text-primary hover:underline", children: "All →" })
    ] }),
    recent.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "No saved forecasts yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 text-sm", children: recent.map((r) => {
      const recColor = r.recommendation === "BUY" ? "text-primary" : r.recommendation === "SELL" ? "text-destructive" : "text-muted-foreground";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex justify-between items-center gap-2 border-b border-border pb-2 last:border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-nums font-semibold text-xs", children: r.ticker }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
            r.model,
            " · ",
            new Date(r.created_at).toLocaleDateString()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-bold shrink-0 ${recColor}`, children: r.recommendation })
      ] }, r.id);
    }) })
  ] });
}
function WatchlistMini({
  ticker,
  quote
}) {
  const fetchHistory = useServerFn(getLiveHistory);
  const {
    data
  } = useQuery({
    queryKey: ["mini-history", ticker],
    queryFn: () => fetchHistory({
      data: {
        ticker,
        range: "1mo"
      }
    }),
    staleTime: 5 * 6e4
  });
  const cfg = TICKER_CONFIG[ticker];
  const series = (data?.history?.length ? data.history : []).map((p) => p.close);
  const last = quote?.last ?? series[series.length - 1] ?? 0;
  const pct = quote?.changePct ?? 0;
  const up = pct >= 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/forecast", search: {
    ticker,
    model: "Ensemble"
  }, className: "block bg-secondary/30 hover:bg-secondary/50 rounded-md p-3 transition", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono-nums font-semibold text-sm", children: ticker }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-semibold ${up ? "text-primary" : "text-destructive"}`, children: formatChangePct(pct) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-nums text-sm", children: formatPrice(last, cfg?.currency) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground truncate", children: cfg?.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkline, { values: series.slice(-30), width: 72, height: 28, positive: up })
    ] })
  ] });
}
export {
  Dashboard as component
};
