import { N as jsxRuntimeExports, X as reactExports } from "./server-Cgfy5VtR.js";
import { w as useAuthStore, L as Link, v as toast } from "./router-C3k8-z80.js";
import { u as useQuery } from "./useQuery-DpcV55YJ.js";
import { u as useServerFn } from "./createSsrRpc-CXvRzAXX.js";
import { s as supabase } from "./client-T0sJvQy8.js";
import { d as getTickerConfig, b as formatPrice, f as formatChangePct } from "./tickerConfig-7S1tvlm8.js";
import { b as getLiveQuotes } from "./yahooFinance.functions-CNaRUXD5.js";
import { D as Download, d as downloadCSV } from "./csv-BJhimuzA.js";
import { g as getLimits } from "./planLimits-DfVfhYvW.js";
import { P as PlanGate } from "./PlanGate-DsC5xI-0.js";
import { P as PageShell } from "./PageShell-AvoXgHto.js";
import { H as History } from "./history-6GR7AgXc.js";
import { S as Search } from "./search-CogVE9sq.js";
import { c as createLucideIcon } from "./createLucideIcon-DvD_YuaJ.js";
import { T as Trash2 } from "./trash-2-B3iTgfN2.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
import "./aiProvider-Cvi-Tcv4.js";
import "./types-BfPr8xct.js";
import "./lock-DqkAvhsx.js";
import "./sparkles-BzGaueQV.js";
const __iconNode = [
  ["path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8", key: "1p45f6" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }]
];
const RotateCw = createLucideIcon("rotate-cw", __iconNode);
function HistoryPage() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);
  if (!limits.canForecastHistory) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(PageShell, { title: "Forecast History", subtitle: "Track past predictions and model accuracy over time.", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlanGate, { requiredPlan: "pro", title: "Historical Forecast Tracking", description: "Review past forecasts, accuracy metrics, and export history. Available on Pro plan and above." }) });
  }
  const [items, setItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [q, setQ] = reactExports.useState("");
  const [tickerFilter, setTickerFilter] = reactExports.useState("ALL");
  const [modelFilter, setModelFilter] = reactExports.useState("ALL");
  const [recFilter, setRecFilter] = reactExports.useState("ALL");
  const [page, setPage] = reactExports.useState(0);
  const PAGE = 20;
  const fetchQuotes = useServerFn(getLiveQuotes);
  const load = async () => {
    if (!user) return;
    setLoading(true);
    const {
      data,
      error
    } = await supabase.from("forecast_history").select("*").order("created_at", {
      ascending: false
    }).limit(500);
    if (error) toast.error(error.message);
    else setItems(data ?? []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    load();
  }, [user]);
  const remove = async (id) => {
    const {
      error
    } = await supabase.from("forecast_history").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  };
  const uniqueTickers = reactExports.useMemo(() => Array.from(new Set(items.map((i) => i.ticker))).sort(), [items]);
  const uniqueModels = reactExports.useMemo(() => Array.from(new Set(items.map((i) => i.model))).sort(), [items]);
  const filtered = reactExports.useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((it) => {
      if (tickerFilter !== "ALL" && it.ticker !== tickerFilter) return false;
      if (modelFilter !== "ALL" && it.model !== modelFilter) return false;
      if (recFilter !== "ALL" && it.recommendation !== recFilter) return false;
      if (term && !`${it.ticker} ${it.model}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [items, tickerFilter, modelFilter, recFilter, q]);
  const paged = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const quotesQuery = useQuery({
    queryKey: ["hist-acc", uniqueTickers],
    queryFn: () => fetchQuotes({
      data: {
        tickers: uniqueTickers.slice(0, 30)
      }
    }),
    enabled: uniqueTickers.length > 0,
    staleTime: 5 * 6e4
  });
  const accuracy = reactExports.useMemo(() => {
    const priceMap = new Map(quotesQuery.data?.map((qu) => [qu.ticker, qu.last]) ?? []);
    const by = {
      BUY: {
        hit: 0,
        total: 0
      },
      SELL: {
        hit: 0,
        total: 0
      },
      HOLD: {
        hit: 0,
        total: 0
      }
    };
    items.forEach((it) => {
      const live = priceMap.get(it.ticker);
      if (!live || it.predicted_price == null) return;
      const bucket = by[it.recommendation];
      if (!bucket) return;
      bucket.total++;
      Number(it.predicted_price) >= Number(it.predicted_price);
      const correct = it.recommendation === "BUY" ? live >= Number(it.predicted_price) * 0.97 : it.recommendation === "SELL" ? live <= Number(it.predicted_price) * 1.03 : Math.abs((live - Number(it.predicted_price)) / live) < 0.05;
      if (correct) bucket.hit++;
    });
    return by;
  }, [items, quotesQuery.data]);
  const exportCsv = () => {
    downloadCSV(`forecast-history-${Date.now()}.csv`, filtered.map((it) => ({
      date: it.created_at,
      ticker: it.ticker,
      model: it.model,
      predicted_price: it.predicted_price,
      change_pct: it.predicted_change_pct,
      recommendation: it.recommendation
    })));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-6 flex items-center gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "size-6 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-heading text-3xl font-bold text-glow-green", children: "Forecast History" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Your saved AI predictions with live accuracy tracking." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: exportCsv, className: "px-3 py-1.5 rounded-md bg-secondary text-foreground text-xs font-semibold flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }),
        " Export CSV"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: ["BUY", "SELL", "HOLD"].map((rec) => {
      const a = accuracy[rec];
      const pct = a.total ? Math.round(a.hit / a.total * 100) : null;
      const color = rec === "BUY" ? "text-primary" : rec === "SELL" ? "text-destructive" : "text-muted-foreground";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: [
          rec,
          " accuracy"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-heading text-2xl font-bold mt-1 ${color}`, children: pct == null ? "—" : `${pct}%` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          a.hit,
          " / ",
          a.total,
          " predictions tracked"
        ] })
      ] }, rec);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => {
          setQ(e.target.value);
          setPage(0);
        }, placeholder: "Search ticker or model…", className: "w-full pl-9 pr-3 py-2 rounded-md bg-input border border-border text-sm" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: tickerFilter, onChange: (e) => {
        setTickerFilter(e.target.value);
        setPage(0);
      }, className: "px-3 py-2 rounded-md bg-input border border-border text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All tickers" }),
        uniqueTickers.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: modelFilter, onChange: (e) => {
        setModelFilter(e.target.value);
        setPage(0);
      }, className: "px-3 py-2 rounded-md bg-input border border-border text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All models" }),
        uniqueModels.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m, children: m }, m))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: recFilter, onChange: (e) => {
        setRecFilter(e.target.value);
        setPage(0);
      }, className: "px-3 py-2 rounded-md bg-input border border-border text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All recommendations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "BUY", children: "BUY only" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "SELL", children: "SELL only" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "HOLD", children: "HOLD only" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-card overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-secondary/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-xs uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Ticker" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Model" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Predicted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Change" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-center", children: "Rec." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-4 py-8 text-center text-muted-foreground", children: "Loading…" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 7, className: "px-4 py-8 text-center text-muted-foreground", children: [
        "No forecasts match these filters.",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/forecast", search: {
          ticker: "RELIANCE.NS",
          model: "Ensemble"
        }, className: "text-primary underline", children: "Run one →" })
      ] }) }) : paged.map((it) => {
        const cfg = getTickerConfig(it.ticker);
        const pct = Number(it.predicted_change_pct ?? 0);
        const recColor = it.recommendation === "BUY" ? "text-primary" : it.recommendation === "SELL" ? "text-destructive" : "text-muted-foreground";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border hover:bg-secondary/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-muted-foreground", children: new Date(it.created_at).toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-semibold font-mono-nums", children: it.ticker }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: it.model }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono-nums", children: it.predicted_price != null ? formatPrice(Number(it.predicted_price), cfg?.currency) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-3 text-right font-mono-nums font-semibold ${pct >= 0 ? "text-primary" : "text-destructive"}`, children: formatChangePct(pct) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-3 text-center font-bold ${recColor}`, children: it.recommendation }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/forecast", search: {
              ticker: it.ticker,
              model: it.model
            }, className: "text-accent hover:text-accent/80", title: "Re-run forecast", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: "size-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => remove(it.id), className: "text-destructive hover:text-destructive/80", title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
          ] }) })
        ] }, it.id);
      }) })
    ] }) }),
    filtered.length > PAGE && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mt-4 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
        "Page ",
        page + 1,
        " of ",
        totalPages,
        " · ",
        filtered.length,
        " results"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPage(Math.max(0, page - 1)), disabled: page === 0, className: "px-3 py-1.5 rounded-md bg-secondary text-foreground disabled:opacity-50", children: "Prev" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPage(Math.min(totalPages - 1, page + 1)), disabled: page >= totalPages - 1, className: "px-3 py-1.5 rounded-md bg-secondary text-foreground disabled:opacity-50", children: "Next" })
      ] })
    ] })
  ] });
}
export {
  HistoryPage as component
};
