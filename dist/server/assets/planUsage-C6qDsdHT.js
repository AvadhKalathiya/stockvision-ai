const todayKey = () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
function getDailyUsage(key) {
  if (typeof window === "undefined") return 0;
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "{}");
    return raw.date === todayKey() ? Number(raw.count) || 0 : 0;
  } catch {
    return 0;
  }
}
function bumpDailyUsage(key) {
  const n = getDailyUsage(key) + 1;
  localStorage.setItem(key, JSON.stringify({ date: todayKey(), count: n }));
  return n;
}
const CHAT_USAGE_KEY = "sv:chat:usage";
const FORECAST_USAGE_KEY = "sv:forecast:usage";
export {
  CHAT_USAGE_KEY as C,
  FORECAST_USAGE_KEY as F,
  bumpDailyUsage as b,
  getDailyUsage as g
};
