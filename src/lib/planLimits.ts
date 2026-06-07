export type Plan = "free" | "pro" | "student";

export const PLAN_LIMITS = {
  free: {
    forecastsPerDay: 5,
    watchlistItems: 5,
    chatMessages: 3,
    models: ["SARIMA"] as string[],
    canExportPDF: false,
    canUseScreener: false,
    canSetAlerts: false,
  },
  pro: {
    forecastsPerDay: Infinity,
    watchlistItems: Infinity,
    chatMessages: Infinity,
    models: ["SARIMA", "Prophet", "LSTM", "Ensemble"] as string[],
    canExportPDF: true,
    canUseScreener: true,
    canSetAlerts: true,
  },
  student: {
    forecastsPerDay: Infinity,
    watchlistItems: Infinity,
    chatMessages: Infinity,
    models: ["SARIMA", "Prophet", "LSTM", "Ensemble"] as string[],
    canExportPDF: true,
    canUseScreener: true,
    canSetAlerts: true,
  },
} as const;

export function getLimits(plan: string) {
  return PLAN_LIMITS[(plan as Plan) ?? "free"] ?? PLAN_LIMITS.free;
}
