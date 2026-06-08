import { X as reactExports, N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
import { v as toast, L as Link } from "./router-C3k8-z80.js";
import { S as SENSEX_TICKERS, B as BANK_NIFTY_STOCKS, N as NIFTY50_TICKERS, A as ALL_TICKERS, T as TICKER_CONFIG, g as getHeatmapColorClass, f as formatChangePct, b as formatPrice } from "./tickerConfig-7S1tvlm8.js";
import { G as GlobalSearch } from "./GlobalSearch-lo70RBD4.js";
import { u as useLiveQuotes } from "./useLiveQuotes-a6H7Jnr0.js";
import { P as PageShell } from "./PageShell-AvoXgHto.js";
import { Q as QueryError, a as QueryLoading } from "./QueryState-D4yWYCiQ.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-T0sJvQy8.js";
import "./index-ChW4vIqc.js";
import "./aiProvider-Cvi-Tcv4.js";
import "./search-CogVE9sq.js";
import "./createLucideIcon-DvD_YuaJ.js";
import "./x-DJQb9mxA.js";
import "./useQuery-DpcV55YJ.js";
import "./createSsrRpc-CXvRzAXX.js";
import "./yahooFinance.functions-CNaRUXD5.js";
import "./types-BfPr8xct.js";
import "./planLimits-DfVfhYvW.js";
import "./refresh-cw-BUr9OHaX.js";
import "./loader-circle-Byol8VGZ.js";
import "./triangle-alert-Vsq-qEcN.js";
const FILTER_SETS = {
  ALL: ALL_TICKERS,
  "NIFTY 50": NIFTY50_TICKERS,
  "BANK NIFTY": BANK_NIFTY_STOCKS,
  SENSEX: SENSEX_TICKERS
};
function HeatmapPage() {
  const [filter, setFilter] = reactExports.useState("ALL");
  const [search, setSearch] = reactExports.useState("");
  const {
    quotes,
    isFetching,
    isLoading,
    isError,
    error,
    refetch
  } = useLiveQuotes();
  const heatmapData = reactExports.useMemo(() => {
    const allowed = new Set(FILTER_SETS[filter]);
    return quotes.filter((q) => allowed.has(q.ticker)).map((q) => {
      const cfg = TICKER_CONFIG[q.ticker];
      return {
        ticker: q.ticker,
        name: cfg?.name ?? q.ticker,
        sector: cfg?.sector ?? "Unknown",
        price: q.last,
        pct: q.changePct,
        colorClass: getHeatmapColorClass(q.changePct)
      };
    }).filter((d) => {
      if (!search) return true;
      const term = search.toLowerCase();
      return d.name.toLowerCase().includes(term) || d.ticker.toLowerCase().includes(term);
    }).sort((a, b) => b.pct - a.pct);
  }, [quotes, filter, search]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageShell, { title: "Market Heatmap", subtitle: "Real-time Indian market performance — tap any tile to forecast.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalSearch, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: ["NIFTY 50", "BANK NIFTY", "SENSEX", "ALL"].map((f) => {
        const locked = !limits.canPremiumHeatmap && PREMIUM_FILTERS.includes(f);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          if (locked) {
            toast.error(`${f} heatmap requires Pro plan or higher`);
            return;
          }
          setFilter(f);
        }, className: `px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition ${filter === f ? "bg-primary text-primary-foreground" : locked ? "bg-secondary/50 text-muted-foreground/50" : "bg-secondary text-muted-foreground hover:text-foreground"}`, children: [
          f,
          locked ? " 🔒" : ""
        ] }, f);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "Search company…", value: search, onChange: (e) => setSearch(e.target.value), className: "px-3 py-1.5 rounded-md bg-input border border-border text-sm w-full sm:w-48" })
    ] }),
    isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(QueryError, { message: error?.message, onRetry: () => refetch() }) : isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(QueryLoading, { label: "Loading heatmap data…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      isFetching && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-3 animate-pulse", children: "Refreshing quotes…" }),
      heatmapData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-card p-8 text-center text-muted-foreground text-sm", children: "No tickers match your filter." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2", children: heatmapData.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/forecast", search: {
        ticker: d.ticker,
        model: "Ensemble"
      }, className: `p-3 rounded-lg shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] ${d.colorClass} flex flex-col justify-between min-h-[96px]`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm tracking-tight truncate", children: d.ticker.replace(".NS", "") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] opacity-80 truncate", children: d.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-nums font-semibold text-sm", children: formatChangePct(d.pct) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-nums text-[10px] opacity-90", children: formatPrice(d.price) })
        ] })
      ] }, d.ticker)) })
    ] })
  ] });
}
export {
  HeatmapPage as component
};
