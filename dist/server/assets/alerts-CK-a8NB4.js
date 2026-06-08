import { X as reactExports, N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
import { s as supabase } from "./client-T0sJvQy8.js";
import { w as useAuthStore, v as toast } from "./router-C3k8-z80.js";
import { d as getTickerConfig, b as formatPrice, A as ALL_TICKERS, T as TICKER_CONFIG, f as formatChangePct } from "./tickerConfig-7S1tvlm8.js";
import { P as PageShell } from "./PageShell-AvoXgHto.js";
import { u as useLiveQuotes } from "./useLiveQuotes-a6H7Jnr0.js";
import { g as getLimits } from "./planLimits-DfVfhYvW.js";
import { P as PlanGate } from "./PlanGate-DsC5xI-0.js";
import { P as Plus } from "./plus-CSvLupSh.js";
import { T as Trash2 } from "./trash-2-B3iTgfN2.js";
import { c as createLucideIcon } from "./createLucideIcon-DvD_YuaJ.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
import "./aiProvider-Cvi-Tcv4.js";
import "./useQuery-DpcV55YJ.js";
import "./createSsrRpc-CXvRzAXX.js";
import "./yahooFinance.functions-CNaRUXD5.js";
import "./types-BfPr8xct.js";
import "./lock-DqkAvhsx.js";
import "./sparkles-BzGaueQV.js";
const __iconNode$1 = [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }
  ],
  ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1q6k2b" }],
  ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728", key: "ijwkga" }]
];
const Volume2 = createLucideIcon("volume-2", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }
  ],
  ["line", { x1: "22", x2: "16", y1: "9", y2: "15", key: "1ewh16" }],
  ["line", { x1: "16", x2: "22", y1: "9", y2: "15", key: "5ykzw1" }]
];
const VolumeX = createLucideIcon("volume-x", __iconNode);
function AlertsPage() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);
  const [alerts, setAlerts] = reactExports.useState([]);
  const [ticker, setTicker] = reactExports.useState("RELIANCE.NS");
  const [target, setTarget] = reactExports.useState("");
  const [condition, setCondition] = reactExports.useState("above");
  const [loading, setLoading] = reactExports.useState(true);
  const [soundOn, setSoundOn] = reactExports.useState(true);
  const triggeredRef = reactExports.useRef(/* @__PURE__ */ new Set());
  const {
    quoteMap,
    isFetching: quotesFetching
  } = useLiveQuotes();
  const priceMap = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    quoteMap.forEach((q, t) => m.set(t, q.last));
    return m;
  }, [quoteMap]);
  reactExports.useEffect(() => {
    if (priceMap.size === 0 && alerts.length === 0) return;
    alerts.forEach((a) => {
      if (!a.is_active) return;
      const price = priceMap.get(a.ticker);
      if (!price) return;
      const hit = a.condition === "above" ? price >= Number(a.target_price) : price <= Number(a.target_price);
      if (hit && !triggeredRef.current.has(a.id)) {
        triggeredRef.current.add(a.id);
        const cfg = getTickerConfig(a.ticker);
        const msg = `${a.ticker} crossed ${a.condition} ${formatPrice(Number(a.target_price), cfg?.currency)} — now ${formatPrice(price, cfg?.currency)}`;
        toast.success(msg, {
          duration: 8e3
        });
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("StockVision price alert", {
            body: msg
          });
        }
        if (soundOn) {
          try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            const ctx = new Ctx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = a.condition === "above" ? 880 : 440;
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.6);
            osc.start();
            osc.stop(ctx.currentTime + 0.6);
          } catch {
          }
        }
      }
    });
  }, [alerts, priceMap, soundOn]);
  const load = async () => {
    if (!user) return;
    setLoading(true);
    const {
      data,
      error
    } = await supabase.from("price_alerts").select("*").order("created_at", {
      ascending: false
    });
    if (error) toast.error(error.message);
    else setAlerts(data ?? []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    load();
  }, [user]);
  const requestBrowserNotifications = async () => {
    if (typeof Notification === "undefined") return toast.error("Notifications not supported");
    const perm = await Notification.requestPermission();
    if (perm === "granted") toast.success("Browser notifications enabled");
    else toast.error("Permission denied");
  };
  const add = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (limits.alertsMax === 0) {
      toast.error("Price alerts require Student plan or higher");
      return;
    }
    if (limits.alertsMax !== Infinity && alerts.length >= limits.alertsMax) {
      toast.error(`Alert limit (${limits.alertsMax}) reached. Upgrade to Pro for unlimited.`);
      return;
    }
    const price = Number(target);
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Enter a valid target");
      return;
    }
    const {
      error
    } = await supabase.from("price_alerts").insert({
      user_id: user.id,
      ticker,
      target_price: price,
      condition,
      alert_via: "in-app",
      is_active: true
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Alert created");
      setTarget("");
      load();
    }
  };
  const toggle = async (a) => {
    const {
      error
    } = await supabase.from("price_alerts").update({
      is_active: !a.is_active
    }).eq("id", a.id);
    if (error) toast.error(error.message);
    else load();
  };
  const remove = async (id) => {
    const {
      error
    } = await supabase.from("price_alerts").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageShell, { title: "Price Alerts", subtitle: `Live monitoring · ${quotesFetching ? "updating…" : "active"}`, className: "max-w-6xl", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSoundOn((s) => !s), className: "px-3 py-1.5 rounded-md bg-secondary text-foreground text-xs font-semibold flex items-center gap-1.5", children: [
      soundOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "size-4" }),
      "Sound ",
      soundOn ? "on" : "off"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: requestBrowserNotifications, className: "px-3 py-1.5 rounded-md bg-secondary text-foreground text-xs font-semibold", children: "Notifications" })
  ] }), children: [
    limits.alertsMax === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(PlanGate, { requiredPlan: "student", title: "Price Alerts", description: "Set target prices and get notified when stocks cross your levels. Available on Student plan and above." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: add, className: "glass-card p-4 sm:p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: ticker, onChange: (e) => setTicker(e.target.value), className: "px-3 py-2 rounded-md bg-input border border-border md:col-span-2", children: ALL_TICKERS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: t, children: [
        t,
        " — ",
        TICKER_CONFIG[t].name
      ] }, t)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: condition, onChange: (e) => setCondition(e.target.value), className: "px-3 py-2 rounded-md bg-input border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "above", children: "Crosses above" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "below", children: "Falls below" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "any", value: target, onChange: (e) => setTarget(e.target.value), placeholder: "Target price", className: "px-3 py-2 rounded-md bg-input border border-border" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", className: "px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
        " Add"
      ] })
    ] }),
    limits.alertsMax > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-3", children: limits.alertsMax === Infinity ? "Unlimited alerts" : `${alerts.length}/${limits.alertsMax} alerts used` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-card page-table-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[640px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-secondary/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-xs uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Ticker" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Condition" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Target" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Current" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Gap" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-center", children: "Active" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Action" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-4 py-8 text-center text-muted-foreground", children: "Loading…" }) }) : alerts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-4 py-8 text-center text-muted-foreground", children: "No alerts yet." }) }) : alerts.map((a) => {
        const cfg = getTickerConfig(a.ticker);
        const current = priceMap.get(a.ticker);
        const gap = current ? (current - Number(a.target_price)) / Number(a.target_price) * 100 : null;
        const triggered = current != null && (a.condition === "above" ? current >= Number(a.target_price) : current <= Number(a.target_price));
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-t border-border hover:bg-secondary/30 ${triggered && a.is_active ? "bg-primary/10" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-semibold font-mono-nums", children: a.ticker }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 capitalize", children: a.condition }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono-nums", children: formatPrice(Number(a.target_price), cfg?.currency) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono-nums", children: current != null ? formatPrice(current, cfg?.currency) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-3 text-right font-mono-nums font-semibold ${gap == null ? "" : gap >= 0 ? "text-primary" : "text-destructive"}`, children: gap == null ? "—" : formatChangePct(gap) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggle(a), className: `px-2 py-1 rounded text-xs font-semibold ${a.is_active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`, children: a.is_active ? "ON" : "OFF" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => remove(a.id), className: "text-destructive hover:text-destructive/80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) }) })
        ] }, a.id);
      }) })
    ] }) })
  ] });
}
export {
  AlertsPage as component
};
