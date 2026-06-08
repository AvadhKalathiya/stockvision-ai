import { N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
import { L as Link } from "./router-C3k8-z80.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-T0sJvQy8.js";
import "./index-ChW4vIqc.js";
import "./aiProvider-Cvi-Tcv4.js";
function Index() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center justify-between px-8 py-6 max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-heading text-2xl font-bold tracking-wider text-glow-green", children: [
        "STOCKVISION",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: " AI" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", search: {
          redirect: "/dashboard"
        }, className: "text-muted-foreground hover:text-foreground transition", children: "Sign in" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", search: {
          redirect: "/dashboard"
        }, className: "px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition animate-cta-pulse", children: "Start Free" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "max-w-5xl mx-auto px-8 py-24 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-heading text-6xl md:text-7xl font-black tracking-wider mb-6 text-gradient-hero", children: "STOCKVISION AI" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-heading text-2xl md:text-3xl text-accent mb-8 tracking-widest", children: "India's AI Investing Platform" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", search: {
          redirect: "/dashboard"
        }, className: "px-8 py-4 rounded-md bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition animate-cta-pulse", children: "Start Free →" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", className: "px-8 py-4 rounded-md border border-border text-foreground hover:bg-secondary transition", children: "Live Demo" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "max-w-7xl mx-auto px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-6", children: [{
      v: "₹2.4Cr+",
      l: "Portfolio Tracked"
    }, {
      v: "48,000+",
      l: "Forecasts Run"
    }, {
      v: "97.4%",
      l: "Backtest Accuracy"
    }, {
      v: "12+",
      l: "Global Markets"
    }].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-heading text-3xl font-bold text-primary text-glow-green font-mono-nums", children: s.v }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mt-2", children: s.l })
    ] }, s.l)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "max-w-7xl mx-auto px-8 py-12 text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "StockVision AI provides AI-generated analysis for educational purposes only. Not investment advice." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2", children: "© 2026 StockVision AI" })
    ] })
  ] });
}
export {
  Index as component
};
