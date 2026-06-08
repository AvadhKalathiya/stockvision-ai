import { N as jsxRuntimeExports, X as reactExports } from "./server-Cgfy5VtR.js";
import { w as useAuthStore, L as Link } from "./router-C3k8-z80.js";
import { u as useLiveQuotes } from "./useLiveQuotes-a6H7Jnr0.js";
import { N as NIFTY50_TICKERS, T as TICKER_CONFIG, f as formatChangePct } from "./tickerConfig-7S1tvlm8.js";
import { P as PageShell } from "./PageShell-AvoXgHto.js";
import { Q as QueryError, a as QueryLoading } from "./QueryState-D4yWYCiQ.js";
import { g as getLimits } from "./planLimits-DfVfhYvW.js";
import { P as PlanGate } from "./PlanGate-DsC5xI-0.js";
import { T as TrendingUp } from "./trending-up-r08gGgu4.js";
import { T as TrendingDown } from "./trending-down-DVlp6VhU.js";
import { S as ShieldAlert } from "./shield-alert-DdNirUSM.js";
import { A as Activity } from "./activity-q82JxRi-.js";
import { c as createLucideIcon } from "./createLucideIcon-DvD_YuaJ.js";
import { S as Sparkles } from "./sparkles-BzGaueQV.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-T0sJvQy8.js";
import "./index-ChW4vIqc.js";
import "./aiProvider-Cvi-Tcv4.js";
import "./useQuery-DpcV55YJ.js";
import "./createSsrRpc-CXvRzAXX.js";
import "./yahooFinance.functions-CNaRUXD5.js";
import "./types-BfPr8xct.js";
import "./refresh-cw-BUr9OHaX.js";
import "./loader-circle-Byol8VGZ.js";
import "./triangle-alert-Vsq-qEcN.js";
import "./lock-DqkAvhsx.js";
const __iconNode = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
];
const ArrowRight = createLucideIcon("arrow-right", __iconNode);
function InsightsPage() {
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);
  const {
    quotes,
    isLoading,
    isError,
    error,
    refetch
  } = useLiveQuotes();
  if (!limits.canInsights) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(PageShell, { title: "AI Insights", subtitle: "Algorithmic market intelligence and trading signals.", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlanGate, { requiredPlan: "student", title: "AI Insights Engine", description: "Live bullish/bearish signals, sector trends, and actionable opportunities. Available on Student plan and above." }) });
  }
  const insights = reactExports.useMemo(() => {
    const stocks = quotes.filter((q) => NIFTY50_TICKERS.includes(q.ticker));
    const sorted = [...stocks].sort((a, b) => b.changePct - a.changePct);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    stocks.length ? stocks.reduce((a, b) => a + b.changePct, 0) / stocks.length : 0;
    const bullishCount = stocks.filter((q) => q.changePct > 0).length;
    const sentiment = stocks.length ? Math.round(bullishCount / stocks.length * 100) : 50;
    const itStocks = stocks.filter((q) => TICKER_CONFIG[q.ticker]?.sector === "IT Services");
    const itAvg = itStocks.length ? itStocks.reduce((a, b) => a + b.changePct, 0) / itStocks.length : 0;
    const auto = stocks.find((q) => q.ticker === "TATAMOTORS.NS");
    const nifty = quotes.find((q) => q.ticker === "NIFTY50");
    const list = [];
    if (top && top.changePct > 0) {
      const cfg = TICKER_CONFIG[top.ticker];
      list.push({
        id: 1,
        type: "Bullish",
        title: `${cfg?.sector ?? "Market"} Momentum`,
        confidence: Math.min(95, 70 + Math.round(top.changePct * 5)),
        riskScore: 35,
        data: `${top.ticker} leads gainers at ${formatChangePct(top.changePct)} on live Yahoo data.`,
        action: `Monitor ${top.ticker} for continuation; set alerts on pullbacks.`,
        icon: TrendingUp,
        color: "text-primary",
        bg: "bg-primary/20"
      });
    }
    if (bottom && bottom.changePct < 0) {
      list.push({
        id: 2,
        type: "Bearish",
        title: "Weakness Detected",
        confidence: Math.min(90, 65 + Math.round(Math.abs(bottom.changePct) * 4)),
        riskScore: 72,
        data: `${bottom.ticker} is the session laggard at ${formatChangePct(bottom.changePct)}.`,
        action: "Review stop-loss levels on correlated positions.",
        icon: TrendingDown,
        color: "text-destructive",
        bg: "bg-destructive/20"
      });
    }
    if (nifty) {
      const peProxy = nifty.last > 22e3 ? 78 : 55;
      list.push({
        id: 3,
        type: "Warning",
        title: nifty.changePct < -0.5 ? "Index Pullback" : "Index Valuation Watch",
        confidence: peProxy,
        riskScore: nifty.changePct < 0 ? 65 : 45,
        data: `NIFTY 50 at ${formatChangePct(nifty.changePct)} — market breadth ${sentiment}% bullish.`,
        action: sentiment < 45 ? "Consider defensive sectors (FMCG, Pharma)." : "Maintain balanced exposure.",
        icon: ShieldAlert,
        color: "text-warning",
        bg: "bg-warning/20"
      });
    }
    if (itAvg > 0.5 || auto && auto.changePct < -1) {
      list.push({
        id: 4,
        type: "Opportunity",
        title: itAvg > 0.5 ? "IT Sector Opportunity" : "Dividend Defensive Play",
        confidence: 82,
        riskScore: 30,
        data: itAvg > 0.5 ? `IT Services averaging ${formatChangePct(itAvg)} — sector rotation signal.` : "ITC & ONGC offer stable yield amid volatility.",
        action: itAvg > 0.5 ? "Accumulate IT large caps on dips." : "Add dividend yield for portfolio stability.",
        icon: Activity,
        color: "text-accent",
        bg: "bg-accent/20"
      });
    }
    if (list.length === 0) {
      list.push({
        id: 0,
        type: "Warning",
        title: "Awaiting Live Data",
        confidence: 0,
        riskScore: 50,
        data: "Connect to market data to generate live algorithmic signals.",
        action: "Refresh the page or check your network connection.",
        icon: ShieldAlert,
        color: "text-muted-foreground",
        bg: "bg-secondary"
      });
    }
    return list;
  }, [quotes]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageShell, { title: "AI Insights Engine", subtitle: "Live algorithmic signals derived from real-time market data.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full font-bold text-xs sm:text-sm border border-primary/20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4" }),
    " Live Processing"
  ] }), children: [
    isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(QueryError, { message: error?.message, onRetry: () => refetch() }) : isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(QueryLoading, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8", children: insights.map((insight) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 sm:p-6 relative overflow-hidden group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 rounded-full transition-transform group-hover:scale-150 ${insight.bg}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-4 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-2 sm:p-3 rounded-lg shrink-0 ${insight.bg} ${insight.color}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(insight.icon, { className: "size-5 sm:size-6" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs uppercase tracking-wider font-bold text-muted-foreground", children: [
                insight.type,
                " Signal"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-heading text-base sm:text-lg font-bold truncate", children: insight.title })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono-nums font-bold text-lg sm:text-xl", children: [
              insight.confidence,
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase text-muted-foreground", children: "Confidence" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground mt-1", children: [
              "Risk ",
              insight.riskScore,
              "/100"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground font-semibold uppercase mb-1", children: "Supporting Data" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: insight.data })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-secondary/50 rounded-lg border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground font-semibold uppercase mb-1 flex items-center gap-1", children: [
              "Suggested Action ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-3" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm", children: insight.action })
          ] })
        ] })
      ] })
    ] }, insight.id)) }),
    limits.canPremiumInsights ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-5 border-l-4 border-l-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase font-bold text-primary mb-1", children: "Hidden Gem Detection" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-heading font-bold text-lg mb-2", children: "Undervalued Momentum Pick" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: insights.find((i) => i.type === "Opportunity")?.data ?? "Scanning NIFTY 50 for low-visibility stocks with strong volume & price action." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-5 border-l-4 border-l-accent", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase font-bold text-accent mb-1", children: "High Conviction Picks" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-heading font-bold text-lg mb-2", children: "Top Confidence Signal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: insights.reduce((best, i) => i.confidence > (best?.confidence ?? 0) ? i : best, insights[0])?.action ?? "Awaiting sufficient live data for conviction scoring." })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlanGate, { compact: true, requiredPlan: "pro", title: "Premium AI Insights (Hidden Gems & High Conviction Picks)" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6 sm:p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-10 sm:size-12 mx-auto text-accent mb-4 opacity-80" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-heading text-xl sm:text-2xl font-bold mb-2", children: "Personalized portfolio insights" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-6 max-w-lg mx-auto text-sm", children: "Connect holdings for concentration risk scans and AI rebalancing suggestions." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/portfolio", className: "px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition inline-flex text-sm", children: "Analyze My Portfolio" })
    ] })
  ] });
}
export {
  InsightsPage as component
};
