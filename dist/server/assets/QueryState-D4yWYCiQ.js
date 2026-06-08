import { N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
import { c as createLucideIcon } from "./createLucideIcon-DvD_YuaJ.js";
import { R as RefreshCw } from "./refresh-cw-BUr9OHaX.js";
import { L as LoaderCircle } from "./loader-circle-Byol8VGZ.js";
import { T as TriangleAlert } from "./triangle-alert-Vsq-qEcN.js";
const __iconNode = [
  ["path", { d: "M12 20h.01", key: "zekei9" }],
  ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0", key: "1bycff" }],
  ["path", { d: "M5 12.859a10 10 0 0 1 5.17-2.69", key: "1dl1wf" }],
  ["path", { d: "M19 12.859a10 10 0 0 0-2.007-1.523", key: "4k23kn" }],
  ["path", { d: "M2 8.82a15 15 0 0 1 4.177-2.643", key: "1grhjp" }],
  ["path", { d: "M22 8.82a15 15 0 0 0-11.288-3.764", key: "z3jwby" }],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
];
const WifiOff = createLucideIcon("wifi-off", __iconNode);
function QueryLoading({ label = "Loading market data…" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-8 flex flex-col items-center justify-center gap-3 text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-8 animate-spin text-primary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: label })
  ] });
}
function QueryError({
  message,
  onRetry,
  label = "Failed to load data"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-card p-6 border border-destructive/30 bg-destructive/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { className: "size-5 text-destructive shrink-0 mt-0.5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-destructive", children: label }),
      message ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 break-words", children: message }) : null,
      onRetry ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onRetry,
          className: "mt-3 px-3 py-1.5 rounded-md bg-secondary text-xs font-semibold hover:bg-secondary/70 transition flex items-center gap-1.5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "size-3.5" }),
            " Retry"
          ]
        }
      ) : null
    ] })
  ] }) });
}
function EmptyState({
  title,
  description,
  action
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-8 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-8 mx-auto text-muted-foreground mb-3 opacity-60" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: title }),
    description ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: description }) : null,
    action ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: action }) : null
  ] });
}
export {
  EmptyState as E,
  QueryError as Q,
  QueryLoading as a
};
