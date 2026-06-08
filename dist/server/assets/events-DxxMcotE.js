import { X as reactExports, N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
import { C as Calendar } from "./calendar-Myi_kxH_.js";
import { B as Briefcase } from "./briefcase-CdypnbFT.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./createLucideIcon-DvD_YuaJ.js";
const ECONOMIC_EVENTS = [{
  id: 1,
  date: "2026-06-10",
  time: "10:00 AM",
  event: "RBI Monetary Policy Committee (MPC) Decision",
  impact: "High",
  actual: "-",
  forecast: "6.50%",
  prev: "6.50%"
}, {
  id: 2,
  date: "2026-06-12",
  time: "05:30 PM",
  event: "India CPI Inflation (YoY)",
  impact: "High",
  actual: "-",
  forecast: "4.8%",
  prev: "4.83%"
}, {
  id: 3,
  date: "2026-06-12",
  time: "05:30 PM",
  event: "India Industrial Production (IIP)",
  impact: "Medium",
  actual: "-",
  forecast: "4.5%",
  prev: "4.9%"
}, {
  id: 4,
  date: "2026-06-30",
  time: "05:30 PM",
  event: "India GDP Growth Rate (QoQ)",
  impact: "High",
  actual: "-",
  forecast: "6.1%",
  prev: "8.4%"
}];
const CORP_ACTIONS = [{
  id: 1,
  ticker: "TCS.NS",
  type: "Dividend",
  detail: "₹28.00 per share",
  exDate: "2026-06-15",
  recordDate: "2026-06-16"
}, {
  id: 2,
  ticker: "RELIANCE.NS",
  type: "Bonus",
  detail: "1:1 Ratio",
  exDate: "2026-06-22",
  recordDate: "2026-06-23"
}, {
  id: 3,
  ticker: "HDFCBANK.NS",
  type: "Dividend",
  detail: "₹19.50 per share",
  exDate: "2026-06-28",
  recordDate: "2026-06-29"
}, {
  id: 4,
  ticker: "ITC.NS",
  type: "Stock Split",
  detail: "Old FV: ₹10, New FV: ₹1",
  exDate: "2026-07-05",
  recordDate: "2026-07-06"
}];
function EventsPage() {
  const [tab, setTab] = reactExports.useState("Economy");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-heading text-3xl font-bold text-glow-green", children: "Events & Actions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Indian Economic Calendar & Corporate Actions Center." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 border-b border-border mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab("Economy"), className: `pb-3 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 ${tab === "Economy" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`, children: "Economic Calendar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab("Corporate"), className: `pb-3 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 ${tab === "Corporate" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`, children: "Corporate Actions" })
    ] }),
    tab === "Economy" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card overflow-hidden animate-in fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border bg-secondary/30 flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-heading font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "size-5 text-primary" }),
          " Key Macro Events"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Times in IST" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-secondary/20 text-muted-foreground text-left uppercase text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-4", children: "Date/Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-4", children: "Event" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-4", children: "Impact" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-4 text-right", children: "Forecast" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-4 text-right", children: "Previous" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: ECONOMIC_EVENTS.map((ev) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border hover:bg-secondary/30 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: new Date(ev.date).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric"
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: ev.time })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 font-semibold", children: ev.event }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-1 rounded text-xs font-bold ${ev.impact === "High" ? "bg-destructive/20 text-destructive" : "bg-yellow-500/20 text-yellow-500"}`, children: ev.impact }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-right font-mono-nums font-bold", children: ev.forecast }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-right font-mono-nums text-muted-foreground", children: ev.prev })
        ] }, ev.id)) })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card overflow-hidden animate-in fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-b border-border bg-secondary/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-heading font-bold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "size-5 text-accent" }),
        " Upcoming Corporate Actions"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-secondary/20 text-muted-foreground text-left uppercase text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-4", children: "Ticker" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-4", children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-4", children: "Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-4 text-right", children: "Ex-Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-4 text-right", children: "Record Date" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: CORP_ACTIONS.map((ca) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border hover:bg-secondary/30 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 font-bold", children: ca.ticker }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-1 rounded text-xs font-bold ${ca.type === "Dividend" ? "bg-green-500/20 text-green-500" : ca.type === "Bonus" ? "bg-purple-500/20 text-purple-500" : "bg-blue-500/20 text-blue-500"}`, children: ca.type }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 font-semibold", children: ca.detail }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-right font-mono-nums", children: new Date(ca.exDate).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric"
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-4 text-right font-mono-nums", children: new Date(ca.recordDate).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric"
          }) })
        ] }, ca.id)) })
      ] })
    ] })
  ] });
}
export {
  EventsPage as component
};
