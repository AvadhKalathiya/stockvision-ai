import { X as reactExports, N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
import { u as useQuery } from "./useQuery-DpcV55YJ.js";
import { u as useServerFn } from "./createSsrRpc-CXvRzAXX.js";
import { A as ALL_TICKERS, T as TICKER_CONFIG, b as formatPrice, f as formatChangePct } from "./tickerConfig-7S1tvlm8.js";
import { a as getLiveHistory } from "./yahooFinance.functions-CNaRUXD5.js";
import { u as useLiveQuotes } from "./useLiveQuotes-a6H7Jnr0.js";
import { G as GlobalSearch } from "./GlobalSearch-lo70RBD4.js";
import { w as useAuthStore } from "./router-C3k8-z80.js";
import { g as getLimits } from "./planLimits-DfVfhYvW.js";
import { P as PlanGate } from "./PlanGate-DsC5xI-0.js";
import { P as PageShell } from "./PageShell-AvoXgHto.js";
import { k as generateCategoricalChart, j as formatAxisMap, R as ResponsiveContainer, e as Tooltip, d as Legend } from "./generateCategoricalChart-DWEqI6XE.js";
import { X as XAxis, Y as YAxis, L as Line, C as CartesianGrid } from "./YAxis-d-0IhvJV.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./types-BfPr8xct.js";
import "./search-CogVE9sq.js";
import "./createLucideIcon-DvD_YuaJ.js";
import "./x-DJQb9mxA.js";
import "./client-T0sJvQy8.js";
import "./index-ChW4vIqc.js";
import "./aiProvider-Cvi-Tcv4.js";
import "./lock-DqkAvhsx.js";
import "./sparkles-BzGaueQV.js";
import "./clsx-DgYk2OaC.js";
var LineChart = generateCategoricalChart({
  chartName: "LineChart",
  GraphicalChild: Line,
  axisComponents: [{
    axisType: "xAxis",
    AxisComp: XAxis
  }, {
    axisType: "yAxis",
    AxisComp: YAxis
  }],
  formatAxisMap
});
function ComparePage() {
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);
  const [stockA, setStockA] = reactExports.useState("TCS.NS");
  const [stockB, setStockB] = reactExports.useState("INFY.NS");
  const [range, setRange] = reactExports.useState("1y");
  const fetchHistory = useServerFn(getLiveHistory);
  const {
    quoteMap
  } = useLiveQuotes();
  const {
    data: historyA,
    isFetching: fetchA
  } = useQuery({
    queryKey: ["history", stockA, range],
    queryFn: () => fetchHistory({
      data: {
        ticker: stockA,
        range
      }
    })
  });
  const {
    data: historyB,
    isFetching: fetchB
  } = useQuery({
    queryKey: ["history", stockB, range],
    queryFn: () => fetchHistory({
      data: {
        ticker: stockB,
        range
      }
    })
  });
  const chartData = reactExports.useMemo(() => {
    if (!historyA?.history || !historyB?.history) return [];
    const map = /* @__PURE__ */ new Map();
    for (const pt of historyA.history) {
      map.set(pt.date, {
        date: pt.date,
        A: pt.close,
        B: null
      });
    }
    for (const pt of historyB.history) {
      const existing = map.get(pt.date) || {
        date: pt.date,
        A: null,
        B: null
      };
      existing.B = pt.close;
      map.set(pt.date, existing);
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [historyA, historyB]);
  const cfgA = TICKER_CONFIG[stockA];
  const cfgB = TICKER_CONFIG[stockB];
  const qA = quoteMap.get(stockA);
  const qB = quoteMap.get(stockB);
  const winner = (qA?.changePct ?? 0) > (qB?.changePct ?? 0) ? stockA : stockB;
  if (!limits.canCompare) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(PageShell, { title: "Compare Stocks", subtitle: "Side-by-side performance, risk, and fundamentals.", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlanGate, { requiredPlan: "student", title: "Compare Stocks", description: "Compare two stocks side-by-side with charts, metrics, and AI winner analysis. Available on Student plan and above." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageShell, { title: "Compare Stocks", subtitle: "Side-by-side performance, risk, and fundamentals analysis.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GlobalSearch, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-5 mb-6 flex flex-wrap gap-4 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-muted-foreground uppercase mb-1 block", children: "Stock A" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: stockA, onChange: (e) => setStockA(e.target.value), className: "px-3 py-2 rounded bg-input border border-border", children: ALL_TICKERS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground font-bold italic pt-4", children: "VS" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-muted-foreground uppercase mb-1 block", children: "Stock B" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: stockB, onChange: (e) => setStockB(e.target.value), className: "px-3 py-2 rounded bg-input border border-border", children: ALL_TICKERS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: range, onChange: (e) => setRange(e.target.value), className: "px-3 py-2 rounded bg-secondary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "1mo", children: "1 Month" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "3mo", children: "3 Months" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "6mo", children: "6 Months" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "1y", children: "1 Year" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "5y", children: "5 Years" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold font-heading", children: cfgA?.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground mb-4", children: [
          stockA,
          " · ",
          cfgA?.sector
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-mono-nums font-bold mb-1", children: formatPrice(qA?.last ?? 0) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `font-semibold ${qA && qA.changePct >= 0 ? "text-primary" : "text-destructive"}`, children: [
          formatChangePct(qA?.changePct ?? 0),
          " Today"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-2 border-t border-border pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "P/E Ratio" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono-nums", children: "28.4" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Market Cap" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono-nums", children: "₹14.2T" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Dividend Yield" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono-nums", children: "1.8%" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold font-heading", children: cfgB?.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground mb-4", children: [
          stockB,
          " · ",
          cfgB?.sector
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-mono-nums font-bold mb-1", children: formatPrice(qB?.last ?? 0) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `font-semibold ${qB && qB.changePct >= 0 ? "text-primary" : "text-destructive"}`, children: [
          formatChangePct(qB?.changePct ?? 0),
          " Today"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-2 border-t border-border pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "P/E Ratio" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono-nums", children: "24.1" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Market Cap" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono-nums", children: "₹7.1T" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Dividend Yield" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono-nums", children: "2.1%" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-heading text-lg mb-4", children: [
        "Historical Performance Overlay (",
        range,
        ")"
      ] }),
      fetchA || fetchB ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-pulse h-64 bg-secondary/50 rounded flex items-center justify-center", children: "Loading charts..." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-80 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: chartData, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "oklch(0.87 0.20 165 / 0.1)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: {
          fontSize: 11
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "left", tick: {
          fontSize: 11
        }, stroke: "#10b981" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "right", orientation: "right", tick: {
          fontSize: 11
        }, stroke: "#3b82f6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
          background: "#1e293b",
          border: "none"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "left", type: "monotone", dataKey: "A", name: stockA, stroke: "#10b981", strokeWidth: 2, dot: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "B", name: stockB, stroke: "#3b82f6", strokeWidth: 2, dot: false })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6 bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-l-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-heading font-bold text-lg mb-2", children: "AI Winner Summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "Based on recent momentum and technical strength, ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: winner }),
        " shows a stronger short-term trajectory. However, both stocks remain solid picks in their respective sectors. Ensure proper portfolio diversification."
      ] })
    ] })
  ] });
}
export {
  ComparePage as component
};
