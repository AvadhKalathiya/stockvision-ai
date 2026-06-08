import { N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
import { L as Link } from "./router-C3k8-z80.js";
import { u as upgradeLabel } from "./planLimits-DfVfhYvW.js";
import { L as Lock } from "./lock-DqkAvhsx.js";
import { S as Sparkles } from "./sparkles-BzGaueQV.js";
function PlanGate({
  requiredPlan,
  title,
  description,
  compact
}) {
  if (compact) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-md px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-3.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        title,
        " — ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/settings", className: "text-primary hover:underline", children: [
          upgradeLabel(requiredPlan),
          "+"
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6 sm:p-8 text-center border border-primary/20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-10 mx-auto text-primary mb-4 opacity-70" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-heading text-xl font-bold mb-2", children: title }),
    description ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-5 max-w-md mx-auto", children: description }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/settings",
        className: "inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:opacity-90",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4" }),
          " Upgrade to ",
          upgradeLabel(requiredPlan)
        ]
      }
    )
  ] });
}
export {
  PlanGate as P
};
