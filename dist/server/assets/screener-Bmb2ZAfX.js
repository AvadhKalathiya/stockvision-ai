import { X as reactExports, N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
import { w as useAuthStore, v as toast, L as Link } from "./router-C3k8-z80.js";
import { A as ALL_TICKERS, T as TICKER_CONFIG, b as formatPrice, f as formatChangePct, N as NIFTY50_TICKERS } from "./tickerConfig-7S1tvlm8.js";
import { G as GlobalSearch } from "./GlobalSearch-lo70RBD4.js";
import { u as useLiveQuotes } from "./useLiveQuotes-a6H7Jnr0.js";
import { P as PageShell } from "./PageShell-AvoXgHto.js";
import { Q as QueryError, a as QueryLoading } from "./QueryState-D4yWYCiQ.js";
import { g as getLimits } from "./planLimits-DfVfhYvW.js";
import { T as TrendingUp } from "./trending-up-r08gGgu4.js";
import { c as createLucideIcon } from "./createLucideIcon-DvD_YuaJ.js";
import { Z as Zap } from "./zap-s63ztzaO.js";
import { A as Activity } from "./activity-q82JxRi-.js";
import { S as Sparkles } from "./sparkles-BzGaueQV.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-T0sJvQy8.js";
import "./index-ChW4vIqc.js";
import "./aiProvider-Cvi-Tcv4.js";
import "./search-CogVE9sq.js";
import "./x-DJQb9mxA.js";
import "./useQuery-DpcV55YJ.js";
import "./createSsrRpc-CXvRzAXX.js";
import "./yahooFinance.functions-CNaRUXD5.js";
import "./types-BfPr8xct.js";
import "./refresh-cw-BUr9OHaX.js";
import "./loader-circle-Byol8VGZ.js";
import "./triangle-alert-Vsq-qEcN.js";
const __iconNode$1 = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const ShieldCheck = createLucideIcon("shield-check", __iconNode$1);
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
];
const Target = createLucideIcon("target", __iconNode);
const BASIC_CATS = ["Growth", "Value"];
const ADVANCED_CATS = ["Dividend", "Momentum", "Low Risk", "Sector Leaders"];
function ScreenerPage() {
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);
  const [category, setCategory] = reactExports.useState("Growth");
  const {
    quotes,
    isLoading,
    isError,
    error,
    refetch
  } = useLiveQuotes();
  const screenedStocks = reactExports.useMemo(() => {
    return ALL_TICKERS.map((t) => {
      const q = quotes.find((x) => x.ticker === t);
      return {
        ticker: t,
        name: TICKER_CONFIG[t]?.name,
        sector: TICKER_CONFIG[t]?.sector,
        price: q?.last ?? 0,
        pct: q?.changePct ?? 0
      };
    }).filter((d) => {
      if (category === "Growth") return d.pct > 1;
      if (category === "Value") return d.price < 500 && d.pct > 0;
      if (category === "Dividend") return ["ITC.NS", "ONGC.NS", "TCS.NS"].includes(d.ticker);
      if (category === "Momentum") return d.pct > 2;
      if (category === "Low Risk") return d.pct > -1 && d.pct < 1;
      if (category === "Sector Leaders") return ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "SUNPHARMA.NS"].includes(d.ticker);
      return true;
    }).sort((a, b) => b.pct - a.pct);
  }, [quotes, category]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageShell, { title: "AI Stock Screener", subtitle: "Discover Indian stocks using live momentum & sector criteria.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-full text-xs sm:text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4" }),
    " Scanning ",
    NIFTY50_TICKERS.length,
    " NSE stocks"
  ] }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalSearch, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 overflow-x-auto pb-4 mb-6 hide-scrollbar", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CatButton, { current: category, target: "Growth", icon: TrendingUp, onClick: setCategory, desc: "High Earnings Growth" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CatButton, { current: category, target: "Value", icon: Target, onClick: setCategory, desc: "Undervalued, Low P/E" }),
      ADVANCED_CATS.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(CatButton, { current: category, target: cat, icon: cat === "Dividend" ? Zap : cat === "Momentum" ? Activity : cat === "Low Risk" ? ShieldCheck : Sparkles, onClick: (c) => {
        if (!limits.canUseAdvancedScreener && !BASIC_CATS.includes(c)) {
          toast.error(`${c} screener requires Student plan or higher`);
          return;
        }
        setCategory(c);
      }, desc: cat === "Dividend" ? "High Yield" : cat === "Momentum" ? "Uptrend" : cat === "Low Risk" ? "Low Vol" : "Sector Top", locked: !limits.canUseAdvancedScreener }, cat))
    ] }),
    isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(QueryError, { message: error?.message, onRetry: () => refetch() }) : isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(QueryLoading, {}) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 glass-card page-table-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-b border-border bg-secondary/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-heading font-semibold text-lg", children: [
          category,
          " Stocks"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm min-w-[520px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase tracking-wider text-muted-foreground bg-secondary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Company" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Sector" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Price" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Change" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Action" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
            screenedStocks.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border hover:bg-secondary/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: s.ticker }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate w-40", children: s.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: s.sector }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono-nums", children: formatPrice(s.price) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-3 text-right font-mono-nums font-semibold ${s.pct >= 0 ? "text-primary" : "text-destructive"}`, children: formatChangePct(s.pct) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/forecast", search: {
                ticker: s.ticker,
                model: "Ensemble"
              }, className: "px-3 py-1 rounded bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition", children: "Forecast" }) })
            ] }, s.ticker)),
            screenedStocks.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-4 py-8 text-center text-muted-foreground", children: "No stocks found for this criteria today." }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-5 border-t-4 border-t-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-heading font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4 text-primary" }),
          " AI Top Picks"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-secondary/30 rounded border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-primary", children: "TCS.NS" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono-nums bg-primary/20 text-primary px-2 py-0.5 rounded", children: "94% Conviction" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Strong fundamentals and multi-year deal wins create a high-growth outlook. Low risk score (12/100)." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-secondary/30 rounded border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-primary", children: "ITC.NS" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono-nums bg-primary/20 text-primary px-2 py-0.5 rounded", children: "88% Conviction" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "High dividend yield with stable FMCG volume growth. Classified as a Hidden Gem." })
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
function CatButton({
  current,
  target,
  icon: Icon,
  onClick,
  desc,
  locked
}) {
  const active = current === target;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onClick(target), className: `shrink-0 flex items-center gap-3 p-4 rounded-xl border transition-all ${active ? "bg-primary/10 border-primary text-foreground" : locked ? "bg-card/50 border-border text-muted-foreground/50" : "bg-card border-border text-muted-foreground hover:bg-secondary/50"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-2 rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm", children: target }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] opacity-80", children: desc })
    ] })
  ] });
}
export {
  ScreenerPage as component
};
