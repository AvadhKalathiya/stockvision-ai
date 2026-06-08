import { c as createSsrRpc } from "./createSsrRpc-CXvRzAXX.js";
import { k as createServerFn } from "./server-Cgfy5VtR.js";
import { o as objectType, e as enumType } from "./types-BfPr8xct.js";
const getFutures = createServerFn({
  method: "GET"
}).handler(createSsrRpc("057c9573c99fde8fb33a73a1d091ca0ac409d98441795bd82a2999bed9df8880"));
const getIpoCalendar = createServerFn({
  method: "POST"
}).inputValidator(objectType({
  market: enumType(["INDIA", "GLOBAL", "ALL"]).default("INDIA")
}).parse).handler(createSsrRpc("bd2d647d4c7f0af003a117ce3170f4f4dc3fdfb26bfb796aaf827280c7bddc5b"));
export {
  getIpoCalendar as a,
  getFutures as g
};
