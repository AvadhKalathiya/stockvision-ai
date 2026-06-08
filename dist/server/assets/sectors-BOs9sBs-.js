import { X as reactExports, N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
import { A as ALL_TICKERS, T as TICKER_CONFIG, f as formatChangePct, b as formatPrice, g as getHeatmapColorClass } from "./tickerConfig-7S1tvlm8.js";
import { u as useLiveQuotes } from "./useLiveQuotes-a6H7Jnr0.js";
import { P as PageShell } from "./PageShell-AvoXgHto.js";
import { Q as QueryError, a as QueryLoading } from "./QueryState-D4yWYCiQ.js";
import { w as useAuthStore } from "./router-C3k8-z80.js";
import { g as getLimits } from "./planLimits-DfVfhYvW.js";
import { P as PlanGate } from "./PlanGate-DsC5xI-0.js";
import { C as ChartColumn, c as computeMarketBreadth } from "./marketOverview-Cmjpw8gU.js";
import { B as Briefcase } from "./briefcase-CdypnbFT.js";
import { T as TrendingUp } from "./trending-up-r08gGgu4.js";
import { T as TrendingDown } from "./trending-down-DVlp6VhU.js";
import { S as Sparkles } from "./sparkles-BzGaueQV.js";
import { c as createLucideIcon } from "./createLucideIcon-DvD_YuaJ.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useQuery-DpcV55YJ.js";
import "./createSsrRpc-CXvRzAXX.js";
import "./yahooFinance.functions-CNaRUXD5.js";
import "./types-BfPr8xct.js";
import "./refresh-cw-BUr9OHaX.js";
import "./loader-circle-Byol8VGZ.js";
import "./triangle-alert-Vsq-qEcN.js";
import "./client-T0sJvQy8.js";
import "./index-ChW4vIqc.js";
import "./aiProvider-Cvi-Tcv4.js";
import "./lock-DqkAvhsx.js";
const __iconNode = [
  ["path", { d: "M10 12h4", key: "a56b0p" }],
  ["path", { d: "M10 8h4", key: "1sr2af" }],
  ["path", { d: "M14 21v-3a2 2 0 0 0-4 0v3", key: "1rgiei" }],
  [
    "path",
    {
      d: "M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2",
      key: "secmi2"
    }
  ],
  ["path", { d: "M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16", key: "16ra0t" }]
];
const Building2 = createLucideIcon("building-2", __iconNode);
const SECTORS = ["Banking", "IT Services", "FMCG", "Pharma", "Auto", "Energy", "Infrastructure"];
function SectorsPage() {
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);
  const [activeSector, setActiveSector] = reactExports.useState(SECTORS[0]);
  const {
    quotes,
    isLoading,
    isError,
    error,
    refetch
  } = useLiveQuotes();
  const sectorStocks = reactExports.useMemo(() => {
    return ALL_TICKERS.filter((t) => {
      const cfg = TICKER_CONFIG[t];
      return cfg?.sector === activeSector;
    }).map((t) => {
      const cfg = TICKER_CONFIG[t];
      const q = quotes.find((x) => x.ticker === t);
      return {
        ticker: t,
        name: cfg?.name,
        price: q?.last ?? 0,
        pct: q?.changePct ?? 0
      };
    }).sort((a, b) => b.pct - a.pct);
  }, [quotes, activeSector]);
  const avgChange = sectorStocks.length ? sectorStocks.reduce((a, b) => a + b.pct, 0) / sectorStocks.length : 0;
  const topGainer = sectorStocks[0];
  const topLoser = sectorStocks[sectorStocks.length - 1];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PageShell, { title: "Sector Analytics", subtitle: "Deep dive into Indian market sectors and industry performance.", children: isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(QueryError, { message: error?.message, onRetry: () => refetch() }) : isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(QueryLoading, {}) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto pb-4 mb-6 hide-scrollbar", children: SECTORS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveSector(s), className: `px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeSector === s ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`, children: s }, s)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6 md:col-span-1 border-t-4 border-t-blue-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center text-muted-foreground mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "size-4" }),
          " Sector Performance"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-3xl font-bold font-mono-nums ${avgChange >= 0 ? "text-primary" : "text-destructive"}`, children: formatChangePct(avgChange) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6 md:col-span-1 border-t-4 border-t-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center text-muted-foreground mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-4" }),
          " Top Gainer"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold", children: topGainer?.ticker || "N/A" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-primary font-mono-nums font-bold", children: formatChangePct(topGainer?.pct || 0) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6 md:col-span-1 border-t-4 border-t-destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center text-muted-foreground mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "size-4" }),
          " Top Loser"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold", children: topLoser?.ticker || "N/A" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-destructive font-mono-nums font-bold", children: formatChangePct(topLoser?.pct || 0) })
      ] }),
      limits.canAIMarketSummary ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6 md:col-span-1 border-t-4 border-t-accent bg-accent/5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center text-accent font-bold mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4" }),
          " AI Outlook"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: avgChange > 0 ? "Bullish trend supported by strong institutional buying and volume expansion." : "Bearish consolidation phase. Wait for key support levels to bounce." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-card p-4 md:col-span-1 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlanGate, { compact: true, requiredPlan: "student", title: "AI Sector Outlook" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-heading text-lg font-bold mb-4", children: [
        activeSector,
        " Heatmap & Constituents"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: [
        sectorStocks.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-4 rounded-lg flex flex-col justify-between h-24 ${getHeatmapColorClass(s.pct)}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: s.ticker.replace(".NS", "") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-80", children: formatPrice(s.price) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-nums font-bold", children: formatChangePct(s.pct) })
          ] })
        ] }, s.ticker)),
        sectorStocks.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full py-8 text-center text-muted-foreground", children: "No tickers mapped to this sector in configuration yet." })
      ] })
    ] }),
    limits.canAdvancedSector ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-bold mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "size-5 text-primary" }),
          " Market Breadth"
        ] }),
        (() => {
          const breadth = computeMarketBreadth(sectorStocks.map((s) => ({
            ticker: s.ticker,
            changePct: s.pct,
            last: s.price,
            volume: 0,
            source: "yahoo"
          })));
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 text-center text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-primary", children: breadth.advances }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Advances" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-destructive", children: breadth.declines }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Declines" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: breadth.ratio.toFixed(2) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "A/D Ratio" })
            ] })
          ] });
        })()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-bold mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "size-5 text-accent" }),
          " Institutional Activity"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: avgChange > 0 ? "FII/DII net buying observed in sector leaders — momentum likely to persist short-term." : "Institutional profit-booking detected — watch for support zone entries." })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlanGate, { compact: true, requiredPlan: "pro_plus", title: "Advanced Sector Analytics & Institutional Dashboard" }) })
  ] }) });
}
export {
  SectorsPage as component
};
