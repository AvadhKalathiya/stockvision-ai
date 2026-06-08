import { N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
function Sparkline({
  values,
  width = 100,
  height = 28,
  positive,
  strokeWidth = 1.5
}) {
  if (!values || values.length < 2) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width, height }, className: "bg-secondary/30 rounded" });
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${height - (v - min) / range * height}`).join(" ");
  const up = positive ?? values[values.length - 1] >= values[0];
  const stroke = up ? "oklch(0.87 0.20 165)" : "oklch(0.65 0.22 25)";
  const fill = up ? "oklch(0.87 0.20 165 / 0.15)" : "oklch(0.65 0.22 25 / 0.15)";
  const area = `0,${height} ${points} ${width},${height}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      className: "overflow-visible",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points: area, fill }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "polyline",
          {
            points,
            fill: "none",
            stroke,
            strokeWidth,
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
export {
  Sparkline as S
};
