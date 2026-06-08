import { X as reactExports, N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
import { u as useQuery } from "./useQuery-DpcV55YJ.js";
import { u as useServerFn } from "./createSsrRpc-CXvRzAXX.js";
import { a as getIpoCalendar } from "./ipoFutures.functions-bX0OmTq4.js";
import { P as PageShell } from "./PageShell-AvoXgHto.js";
import { Q as QueryError, a as QueryLoading, E as EmptyState } from "./QueryState-D4yWYCiQ.js";
import { w as useAuthStore } from "./router-C3k8-z80.js";
import { g as getLimits } from "./planLimits-DfVfhYvW.js";
import { P as PlanGate } from "./PlanGate-DsC5xI-0.js";
import { C as Calendar } from "./calendar-Myi_kxH_.js";
import { R as Rocket } from "./rocket-CQuq0BNT.js";
import { T as TrendingUp } from "./trending-up-r08gGgu4.js";
import { c as createLucideIcon } from "./createLucideIcon-DvD_YuaJ.js";
import { R as RefreshCw } from "./refresh-cw-BUr9OHaX.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./types-BfPr8xct.js";
import "./loader-circle-Byol8VGZ.js";
import "./triangle-alert-Vsq-qEcN.js";
import "./client-T0sJvQy8.js";
import "./index-ChW4vIqc.js";
import "./aiProvider-Cvi-Tcv4.js";
import "./lock-DqkAvhsx.js";
import "./sparkles-BzGaueQV.js";
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const CircleCheck = createLucideIcon("circle-check", __iconNode);
function IPOPage() {
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);
  const ipoFn = useServerFn(getIpoCalendar);
  const [filter, setFilter] = reactExports.useState("all");
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["ipo-calendar-live"],
    queryFn: () => ipoFn({
      data: {
        market: "INDIA"
      }
    }),
    staleTime: 5 * 6e4,
    retry: 2
  });
  const ipos = (data ?? []).filter((ipo) => filter === "all" || ipo.status === filter);
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const listingToday = (data ?? []).filter((i) => i.listingDate?.startsWith(today));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageShell, { title: "IPO Intelligence", subtitle: "Live NSE & BSE IPO calendar — upcoming, open, closed & listing analysis.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => refetch(), disabled: isFetching, className: "px-3 py-1.5 rounded-md bg-secondary text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `size-3.5 ${isFetching ? "animate-spin" : ""}` }),
    " Refresh"
  ] }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-6 flex-wrap", children: ["all", "upcoming", "open", "closed", "listed"].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(f), className: `px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold capitalize transition ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`, children: f === "all" ? "All" : f }, f)) }),
    listingToday.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 mb-4 border-l-4 border-l-primary flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "size-5 text-primary shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm", children: "Listing Today" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: listingToday.map((i) => i.name).join(", ") })
      ] })
    ] }),
    isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(QueryError, { message: error?.message, onRetry: () => refetch() }) : isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(QueryLoading, { label: "Fetching NSE/BSE IPO data…" }) : ipos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "No IPO data available", description: "NSE/BSE feeds may be temporarily unavailable. Try refreshing.", action: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => refetch(), className: "px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold", children: "Retry" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-card page-table-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[760px] text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-secondary/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-xs uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Company" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Exchange" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Price Band" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Issue Size" }),
        limits.canPremiumIPO ? /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Subscription" }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Dates" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: ipos.map((ipo, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border hover:bg-secondary/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: ipo.name }),
          ipo.symbol ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground font-mono-nums", children: ipo.symbol }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: ipo.status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: ipo.exchange ?? "NSE/BSE" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono-nums", children: ipo.priceBand ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right text-xs", children: ipo.issueSize ?? "—" }),
        limits.canPremiumIPO ? /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono-nums", children: ipo.subscription ?? "—" }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-muted-foreground whitespace-nowrap", children: ipo.openDate && ipo.closeDate ? `${ipo.openDate} → ${ipo.closeDate}` : ipo.listingDate ?? "—" })
      ] }, `${ipo.name}-${i}`)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Rocket, label: "Upcoming", value: (data ?? []).filter((i) => i.status === "upcoming").length }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: TrendingUp, label: "Open", value: (data ?? []).filter((i) => i.status === "open").length }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: CircleCheck, label: "Listed", value: (data ?? []).filter((i) => i.status === "listed").length }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Calendar, label: "Today", value: listingToday.length })
    ] }),
    limits.canPremiumIPO ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-heading font-bold mb-3", children: "GMP Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
          (data ?? []).filter((i) => i.gmp != null).slice(0, 5).map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b border-border/50 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold truncate pr-2", children: i.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono-nums text-primary shrink-0", children: [
              "₹",
              i.gmp
            ] })
          ] }, i.name)),
          (data ?? []).filter((i) => i.gmp != null).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "No GMP data available from exchanges." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-heading font-bold mb-3", children: "Listing Gain Analysis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          (data ?? []).filter((i) => i.status === "listed").length,
          " recent listings tracked. Monitor subscription oversubscription for listing-day pop signals."
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlanGate, { compact: true, requiredPlan: "pro_plus", title: "Premium IPO Intelligence (GMP, Subscription & Listing Analysis)" }) })
  ] });
}
function Stat({
  icon: Icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "metric-card p-4 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-5 mx-auto text-primary mb-2" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold font-mono-nums", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground uppercase", children: label })
  ] });
}
function StatusBadge({
  status
}) {
  const styles = status === "open" ? "bg-primary/20 text-primary" : status === "upcoming" ? "bg-accent/20 text-accent" : status === "listed" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-0.5 rounded text-xs font-bold uppercase ${styles}`, children: status });
}
export {
  IPOPage as component
};
