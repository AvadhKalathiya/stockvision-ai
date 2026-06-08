import { X as reactExports, N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
import { x as useNavigate, w as useAuthStore, v as toast } from "./router-C3k8-z80.js";
import { s as supabase } from "./client-T0sJvQy8.js";
import { n as normalizePlan, P as PLAN_LIMITS, a as PLAN_ORDER } from "./planLimits-DfVfhYvW.js";
import { D as Download, d as downloadCSV } from "./csv-BJhimuzA.js";
import { P as PageShell } from "./PageShell-AvoXgHto.js";
import { c as createLucideIcon } from "./createLucideIcon-DvD_YuaJ.js";
import { L as Lock } from "./lock-DqkAvhsx.js";
import { C as Check } from "./check-D33LoE7I.js";
import { T as TriangleAlert } from "./triangle-alert-Vsq-qEcN.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
import "./aiProvider-Cvi-Tcv4.js";
const __iconNode$2 = [
  [
    "path",
    {
      d: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",
      key: "1vdc57"
    }
  ],
  ["path", { d: "M5 21h14", key: "11awu3" }]
];
const Crown = createLucideIcon("crown", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",
      key: "kfwtm"
    }
  ]
];
const Moon = createLucideIcon("moon", __iconNode$1);
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]
];
const Sun = createLucideIcon("sun", __iconNode);
function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const [name, setName] = reactExports.useState("");
  const [currency, setCurrency] = reactExports.useState("INR");
  const [style, setStyle] = reactExports.useState("moderate");
  const [saving, setSaving] = reactExports.useState(false);
  const [theme, setTheme] = reactExports.useState(() => typeof window !== "undefined" && localStorage.getItem("theme") || "dark");
  const [notifEmail, setNotifEmail] = reactExports.useState(() => typeof window !== "undefined" ? localStorage.getItem("notif:email") !== "0" : true);
  const [notifAlerts, setNotifAlerts] = reactExports.useState(() => typeof window !== "undefined" ? localStorage.getItem("notif:alerts") !== "0" : true);
  const [pw1, setPw1] = reactExports.useState("");
  const [pw2, setPw2] = reactExports.useState("");
  const [deleteConfirm, setDeleteConfirm] = reactExports.useState(false);
  const [deleting, setDeleting] = reactExports.useState(false);
  const currentPlan = normalizePlan(profile?.plan);
  reactExports.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  reactExports.useEffect(() => {
    localStorage.setItem("notif:email", notifEmail ? "1" : "0");
  }, [notifEmail]);
  reactExports.useEffect(() => {
    localStorage.setItem("notif:alerts", notifAlerts ? "1" : "0");
  }, [notifAlerts]);
  reactExports.useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("name,default_currency,trading_style").eq("id", user.id).maybeSingle().then(({
      data
    }) => {
      if (data) {
        setName(data.name ?? "");
        setCurrency(data.default_currency ?? "INR");
        setStyle(data.trading_style ?? "moderate");
      }
    });
  }, [user]);
  const save = async () => {
    if (!user) return;
    setSaving(true);
    const {
      error
    } = await supabase.from("profiles").update({
      name,
      default_currency: currency,
      trading_style: style
    }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated");
      refreshProfile();
    }
  };
  const switchPlan = async (planId) => {
    if (!user) return;
    if (planId === "enterprise") {
      toast.info("Contact sales@stockvision.ai for Enterprise pricing");
      return;
    }
    const {
      error
    } = await supabase.from("profiles").update({
      plan: planId
    }).eq("id", user.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Switched to ${PLAN_LIMITS[planId].name}`);
      refreshProfile();
    }
  };
  const changePassword = async () => {
    if (pw1.length < 6) return toast.error("Password must be 6+ characters");
    if (pw1 !== pw2) return toast.error("Passwords do not match");
    const {
      error
    } = await supabase.auth.updateUser({
      password: pw1
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated");
      setPw1("");
      setPw2("");
    }
  };
  const exportAllData = async () => {
    if (!user) return;
    const limits = PLAN_LIMITS[currentPlan];
    if (!limits.canExportPDF && !limits.canPremiumExport) {
      toast.error("PDF/CSV export requires Student plan or higher");
      return;
    }
    const [wl, pf, al, fh] = await Promise.all([supabase.from("watchlist").select("*").eq("user_id", user.id), supabase.from("portfolio").select("*").eq("user_id", user.id), supabase.from("price_alerts").select("*").eq("user_id", user.id), supabase.from("forecast_history").select("*").eq("user_id", user.id)]);
    const all = [...(wl.data ?? []).map((r) => ({
      table: "watchlist",
      ...r
    })), ...(pf.data ?? []).map((r) => ({
      table: "portfolio",
      ...r
    })), ...(al.data ?? []).map((r) => ({
      table: "price_alerts",
      ...r
    })), ...(fh.data ?? []).map((r) => ({
      table: "forecast_history",
      ...r
    }))];
    if (!all.length) return toast.info("No data to export");
    downloadCSV(`stockvision-export-${Date.now()}.csv`, all);
    toast.success(`Exported ${all.length} rows`);
  };
  const deleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    await Promise.all([supabase.from("watchlist").delete().eq("user_id", user.id), supabase.from("portfolio").delete().eq("user_id", user.id), supabase.from("price_alerts").delete().eq("user_id", user.id), supabase.from("forecast_history").delete().eq("user_id", user.id)]);
    await supabase.auth.signOut();
    setDeleting(false);
    toast.success("Account data deleted and signed out");
    navigate({
      to: "/login",
      search: {
        redirect: "/dashboard"
      }
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PageShell, { title: "Settings", subtitle: "Manage profile, appearance, and subscription.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-card p-4 sm:p-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-heading text-lg mb-4", children: "Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: user?.email ?? "", disabled: true, className: "w-full mt-2 px-3 py-2 rounded-md bg-secondary border border-border text-muted-foreground text-sm" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Display name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, onChange: (e) => setName(e.target.value), className: "w-full mt-2 px-3 py-2 rounded-md bg-input border border-border text-sm" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Default currency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: currency, onChange: (e) => setCurrency(e.target.value), className: "w-full mt-2 px-3 py-2 rounded-md bg-input border border-border text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "INR", children: "INR (₹)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "USD", children: "USD ($)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Trading style" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: style, onChange: (e) => setStyle(e.target.value), className: "w-full mt-2 px-3 py-2 rounded-md bg-input border border-border text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "conservative", children: "Conservative" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "moderate", children: "Moderate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "aggressive", children: "Aggressive" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: save, disabled: saving, className: "mt-5 px-5 py-2 rounded-md bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50", children: saving ? "Saving…" : "Save profile" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 sm:p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-heading text-lg mb-4", children: "Appearance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTheme("dark"), className: `flex-1 px-3 py-2 rounded-md font-semibold text-sm flex items-center justify-center gap-2 ${theme === "dark" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "size-4" }),
            " Dark"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTheme("light"), className: `flex-1 px-3 py-2 rounded-md font-semibold text-sm flex items-center justify-center gap-2 ${theme === "light" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "size-4" }),
            " Light"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-4 sm:p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-heading text-lg mb-4", children: "Notifications" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between py-2 cursor-pointer text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Email alerts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: notifEmail, onChange: (e) => setNotifEmail(e.target.checked), className: "accent-primary size-4" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between py-2 cursor-pointer text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "In-app price alert toasts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: notifAlerts, onChange: (e) => setNotifAlerts(e.target.checked), className: "accent-primary size-4" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-card p-4 sm:p-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-heading text-lg mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-4" }),
        " Security"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", placeholder: "New password", value: pw1, onChange: (e) => setPw1(e.target.value), className: "px-3 py-2 rounded-md bg-input border border-border text-sm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", placeholder: "Confirm new password", value: pw2, onChange: (e) => setPw2(e.target.value), className: "px-3 py-2 rounded-md bg-input border border-border text-sm" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: changePassword, className: "mt-4 px-5 py-2 rounded-md bg-primary text-primary-foreground font-semibold text-sm", children: "Change password" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-card p-4 sm:p-6 mb-8 flex items-center justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-heading text-lg", children: "Export your data" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Student+ plans · CSV export of all holdings." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: exportAllData, className: "px-4 py-2 rounded-md bg-secondary text-foreground font-semibold flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }),
        " Download CSV"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-heading text-lg", children: "Subscription Plans" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs px-2 py-1 rounded-full bg-primary/15 text-primary font-bold uppercase", children: [
          "Current: ",
          PLAN_LIMITS[currentPlan].name
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: PLAN_ORDER.map((planId) => {
        const p = PLAN_LIMITS[planId];
        const active = currentPlan === planId;
        const isEnterprise = planId === "enterprise";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `glass-card p-5 flex flex-col ${active ? "border-primary/60 ring-1 ring-primary/40" : ""} ${planId === "pro_plus" ? "border-accent/30" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-heading text-lg font-bold", children: p.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-bold text-primary", children: [
              p.price,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: p.priceSub })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-3", children: [
            "Best for: ",
            p.tagline
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1.5 text-xs mb-4 flex-1", children: [
            p.features.slice(0, 8).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5 text-primary shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: f })
            ] }, f)),
            p.features.length > 8 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-muted-foreground pl-5", children: [
              "+",
              p.features.length - 8,
              " more"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground mb-3 border-t border-border pt-2", children: [
            "Chat: ",
            p.chatMessagesPerDay === Infinity ? "∞" : p.chatMessagesPerDay,
            "/day · Forecasts: ",
            p.forecastsPerDay === Infinity ? "∞" : p.forecastsPerDay,
            "/day · Watchlist: ",
            p.watchlistMax === Infinity ? "∞" : p.watchlistMax,
            " · Alerts: ",
            p.alertsMax === Infinity ? "∞" : p.alertsMax
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => switchPlan(planId), disabled: active, className: `w-full px-4 py-2 rounded-md font-semibold text-sm transition ${active ? "bg-secondary text-muted-foreground cursor-default" : isEnterprise ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground hover:opacity-90"}`, children: active ? "Current plan" : isEnterprise ? "Contact Sales" : `Switch to ${p.name}` })
        ] }, planId);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-4 text-center", children: "Demo billing — plans switch instantly without payment in this build." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-card p-4 sm:p-6 mt-8 border-destructive/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-heading text-lg mb-2 text-destructive flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-4" }),
        " Danger zone"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Permanently removes all watchlist, portfolio, alerts and forecast history." }),
      !deleteConfirm ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteConfirm(true), className: "px-4 py-2 rounded-md bg-destructive/15 text-destructive font-semibold text-sm", children: "Delete account…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-destructive font-semibold", children: "Are you sure?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: deleteAccount, disabled: deleting, className: "px-4 py-2 rounded-md bg-destructive text-destructive-foreground font-semibold text-sm disabled:opacity-50", children: deleting ? "Deleting…" : "Yes, delete everything" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteConfirm(false), className: "px-4 py-2 rounded-md bg-secondary text-sm", children: "Cancel" })
      ] })
    ] })
  ] });
}
export {
  SettingsPage as component
};
