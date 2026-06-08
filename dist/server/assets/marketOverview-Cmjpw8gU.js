import { c as createLucideIcon } from "./createLucideIcon-DvD_YuaJ.js";
const __iconNode = [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
];
const ChartColumn = createLucideIcon("chart-column", __iconNode);
function computeMarketBreadth(stocks) {
  const live = stocks.filter((q) => q.source === "yahoo" && q.last > 0);
  const advances = live.filter((q) => q.changePct > 0).length;
  const declines = live.filter((q) => q.changePct < 0).length;
  const unchanged = live.length - advances - declines;
  const ratio = declines > 0 ? advances / declines : advances;
  return { advances, declines, unchanged, total: live.length, ratio };
}
function topMovers(stocks, n = 5) {
  const live = stocks.filter((q) => q.source === "yahoo");
  return {
    gainers: [...live].filter((q) => q.changePct > 0).sort((a, b) => b.changePct - a.changePct).slice(0, n),
    losers: [...live].filter((q) => q.changePct < 0).sort((a, b) => a.changePct - b.changePct).slice(0, n),
    volume: [...live].sort((a, b) => b.volume - a.volume).slice(0, n),
    trending: [...live].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, n)
  };
}
export {
  ChartColumn as C,
  computeMarketBreadth as c,
  topMovers as t
};
