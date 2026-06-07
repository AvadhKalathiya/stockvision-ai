const todayKey = () => new Date().toISOString().split("T")[0];

export function getDailyUsage(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "{}");
    return raw.date === todayKey() ? Number(raw.count) || 0 : 0;
  } catch {
    return 0;
  }
}

export function bumpDailyUsage(key: string): number {
  const n = getDailyUsage(key) + 1;
  localStorage.setItem(key, JSON.stringify({ date: todayKey(), count: n }));
  return n;
}

export const CHAT_USAGE_KEY = "sv:chat:usage";
export const FORECAST_USAGE_KEY = "sv:forecast:usage";
