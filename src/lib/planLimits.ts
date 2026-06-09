export type Plan = "free" | "student" | "pro" | "pro_plus" | "enterprise";

export interface PlanLimits {
  name: string;
  price: string;
  priceSub: string;
  tagline: string;
  forecastsPerDay: number;
  chatMessagesPerDay: number;
  chatMessages: number;
  watchlistMax: number;
  alertsMax: number;
  models: readonly string[];
  canExportPDF: boolean;
  canUseBasicScreener: boolean;
  canUseAdvancedScreener: boolean;
  canCompare: boolean;
  canInsights: boolean;
  canAIMarketSummary: boolean;
  canPortfolioAdvisor: boolean;
  canPremiumHeatmap: boolean;
  canPremiumInsights: boolean;
  canPremiumIPO: boolean;
  canAdvancedSector: boolean;
  canForecastHistory: boolean;
  canPremiumExport: boolean;
  canSetAlerts: boolean;
  priorityRefresh: boolean;
  features: readonly string[];
}

// All features unlocked — no paywalls
const FULL: PlanLimits = {
  name: "Pro",
  price: "₹0",
  priceSub: "/month",
  tagline: "Full Access",
  forecastsPerDay: Infinity,
  chatMessagesPerDay: Infinity,
  chatMessages: Infinity,
  watchlistMax: Infinity,
  alertsMax: Infinity,
  models: ["SARIMA", "Prophet", "LSTM", "Ensemble"],
  canExportPDF: true,
  canUseBasicScreener: true,
  canUseAdvancedScreener: true,
  canCompare: true,
  canInsights: true,
  canAIMarketSummary: true,
  canPortfolioAdvisor: true,
  canPremiumHeatmap: true,
  canPremiumInsights: true,
  canPremiumIPO: true,
  canAdvancedSector: true,
  canForecastHistory: true,
  canPremiumExport: true,
  canSetAlerts: true,
  priorityRefresh: true,
  features: ["All features unlocked"],
};

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: FULL,
  student: FULL,
  pro: FULL,
  pro_plus: FULL,
  enterprise: FULL,
};

export const PLAN_ORDER: Plan[] = ["free", "student", "pro", "pro_plus", "enterprise"];

export function normalizePlan(plan: string | null | undefined): Plan {
  const p = (plan ?? "free").toLowerCase().replace(/-/g, "_");
  if (p === "proplus") return "pro_plus";
  if (p in PLAN_LIMITS) return p as Plan;
  return "free";
}

export function getLimits(_plan?: string | null): PlanLimits {
  return FULL;
}

export function canUseModel(_plan: string, _model: string): boolean {
  return true;
}

export function minPlanFor(_feature: keyof PlanLimits): Plan | null {
  return "free";
}

export function upgradeLabel(plan: Plan): string {
  return PLAN_LIMITS[plan].name;
}
