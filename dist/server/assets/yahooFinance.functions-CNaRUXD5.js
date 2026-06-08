import { c as createSsrRpc } from "./createSsrRpc-CXvRzAXX.js";
import { k as createServerFn } from "./server-Cgfy5VtR.js";
import { o as objectType, a as arrayType, s as stringType, e as enumType } from "./types-BfPr8xct.js";
createServerFn({
  method: "POST"
}).inputValidator(objectType({
  ticker: stringType().min(1).max(32)
}).parse).handler(createSsrRpc("35048b632e1d03853cfb6722dc1128d7eea7901e38cc6338bb4c5d22b041493e"));
const getLiveQuotes = createServerFn({
  method: "POST"
}).inputValidator(objectType({
  tickers: arrayType(stringType().min(1).max(32)).min(1).max(120)
}).parse).handler(createSsrRpc("b98a26ca9209f796b22a2bb05e606ffeede39b81236ec24ad960240a08091196"));
const getLiveHistory = createServerFn({
  method: "POST"
}).inputValidator(objectType({
  ticker: stringType().min(1).max(32),
  range: enumType(["1mo", "3mo", "6mo", "1y", "2y", "3y", "5y", "10y", "max"]).default("1y")
}).parse).handler(createSsrRpc("9c0f0fa9c259ac7ec8b8ce29284e5fe197297dde0fcf7d92ff2ad41efefbec66"));
const getHistoryByDateRange = createServerFn({
  method: "POST"
}).inputValidator(objectType({
  ticker: stringType().min(1).max(32),
  startDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  interval: enumType(["1d", "1wk", "1mo"]).default("1d")
}).parse).handler(createSsrRpc("4f1b40526a9bb18beecec6d1117f3546cb5ae2bc039791007ab46908ec4abb35"));
const validateTicker = createServerFn({
  method: "POST"
}).inputValidator(objectType({
  ticker: stringType().min(1).max(32)
}).parse).handler(createSsrRpc("12e7f71e3765402fa1a9173344b948f6b3654892ac293e5593954ef534a8017c"));
export {
  getLiveHistory as a,
  getLiveQuotes as b,
  getHistoryByDateRange as g,
  validateTicker as v
};
