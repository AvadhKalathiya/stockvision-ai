import { N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
function PageShell({
  title,
  subtitle,
  actions,
  children,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `px-4 py-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto w-full min-w-0 ${className}`.trim(),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-heading text-2xl sm:text-3xl font-bold text-glow-green truncate", children: title }),
            subtitle ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1 text-sm sm:text-base", children: subtitle }) : null
          ] }),
          actions ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-2 shrink-0", children: actions }) : null
        ] }),
        children
      ]
    }
  );
}
export {
  PageShell as P
};
