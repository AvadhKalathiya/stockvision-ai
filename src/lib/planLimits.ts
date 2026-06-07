export type Plan = "free" | "student" | "pro" | "pro_plus" | "enterprise";

export interface PlanLimits {
  name: string;
  price: string;
  priceSub: string;
  tagline: string;
  forecastsPerDay: number;
  chatMessagesPerDay: number;
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
  priorityRefresh: boolean;
  features: readonly string[];
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    name: "Free",
    price: "₹0",
    priceSub: "/month",
    tagline: "Beginners & Students",
    forecastsPerDay: 5,
    chatMessagesPerDay: 10,
    watchlistMax: 25,
    alertsMax: 0,
    models: ["SARIMA"],
    canExportPDF: false,
    canUseBasicScreener: true,
    canUseAdvancedScreener: false,
    canCompare: false,
    canInsights: false,
    canAIMarketSummary: false,
    canPortfolioAdvisor: false,
    canPremiumHeatmap: false,
    canPremiumInsights: false,
    canPremiumIPO: false,
    canAdvancedSector: false,
    canForecastHistory: false,
    canPremiumExport: false,
    priorityRefresh: false,
    features: [
      "Portfolio Tracking",
      "Watchlist (25 stocks)",
      "NIFTY Market Dashboard",
      "Market Heatmap",
      "Top Gainers / Losers",
      "Basic Screener",
      "IPO Calendar",
      "AI Chat (10/day)",
      "5 Forecasts/day · SARIMA",
      "Paper Trading Simulator",
      "Sector Dashboard",
    ],
  },
  student: {
    name: "Student",
    price: "₹199",
    priceSub: "/month",
    tagline: "Students & Learning Investors",
    forecastsPerDay: Infinity,
    chatMessagesPerDay: 10,
    watchlistMax: 100,
    alertsMax: 25,
    models: ["SARIMA", "Prophet", "LSTM", "Ensemble"],
    canExportPDF: true,
    canUseBasicScreener: true,
    canUseAdvancedScreener: true,
    canCompare: true,
    canInsights: true,
    canAIMarketSummary: true,
    canPortfolioAdvisor: true,
    canPremiumHeatmap: false,
    canPremiumInsights: false,
    canPremiumIPO: false,
    canAdvancedSector: false,
    canForecastHistory: false,
    canPremiumExport: false,
    priorityRefresh: false,
    features: [
      "Everything in Free",
      "Unlimited Forecasts · All 4 Models",
      "AI Portfolio Advisor",
      "Diversification · Risk · Health Scores",
      "Price Alerts (25)",
      "Advanced Screener",
      "Compare Stocks",
      "AI Insights",
      "AI Market Summary",
      "Watchlist (100 stocks)",
      "PDF Export",
    ],
  },
  pro: {
    name: "Pro",
    price: "₹499",
    priceSub: "/month",
    tagline: "Serious Retail Investors",
    forecastsPerDay: Infinity,
    chatMessagesPerDay: Infinity,
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
    canPremiumIPO: false,
    canAdvancedSector: false,
    canForecastHistory: true,
    canPremiumExport: false,
    priorityRefresh: true,
    features: [
      "Everything in Student",
      "Unlimited AI Chat & Alerts",
      "Unlimited Watchlist",
      "Advanced Portfolio Analytics",
      "AI Rebalancing Suggestions",
      "Premium Heatmaps & AI Insights",
      "Hidden Gem & High Conviction Picks",
      "Advanced Compare Center",
      "Premium Forecast Dashboard",
      "Historical Forecast Tracking",
      "Priority Data Refresh",
    ],
  },
  pro_plus: {
    name: "Pro Plus",
    price: "₹999",
    priceSub: "/month",
    tagline: "Power Users & Traders",
    forecastsPerDay: Infinity,
    chatMessagesPerDay: Infinity,
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
    priorityRefresh: true,
    features: [
      "Everything in Pro",
      "Full AI Research Assistant",
      "Daily AI Market Reports",
      "Premium IPO · GMP · Listing Analysis",
      "Advanced Sector & Market Breadth",
      "Institutional Activity Dashboard",
      "Premium Export & Portfolio Reports",
      "Early Access Features",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: "Custom",
    priceSub: " pricing",
    tagline: "Financial Advisors & Institutions",
    forecastsPerDay: Infinity,
    chatMessagesPerDay: Infinity,
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
    priorityRefresh: true,
    features: [
      "Everything in Pro Plus",
      "Multi-user Access",
      "Team Portfolios",
      "Advisor Dashboard",
      "Custom Reports",
      "Dedicated Support",
      "API Access",
      "White-label Options",
    ],
  },
};

export const PLAN_ORDER: Plan[] = ["free", "student", "pro", "pro_plus", "enterprise"];

export function normalizePlan(plan: string | null | undefined): Plan {
  const p = (plan ?? "free").toLowerCase().replace(/-/g, "_");
  if (p === "proplus") return "pro_plus";
  if (p in PLAN_LIMITS) return p as Plan;
  return "free";
}

export function getLimits(plan: string | null | undefined): PlanLimits {
  return PLAN_LIMITS[normalizePlan(plan)];
}

export function canUseModel(plan: string, model: string): boolean {
  return getLimits(plan).models.includes(model);
}

export function minPlanFor(feature: keyof PlanLimits): Plan | null {
  for (const p of PLAN_ORDER) {
    if (PLAN_LIMITS[p][feature] === true || (typeof PLAN_LIMITS[p][feature] === "number" && PLAN_LIMITS[p][feature] as number) > 0) {
      if (feature === "alertsMax" && PLAN_LIMITS[p].alertsMax === 0) continue;
      return p;
    }
  }
  return null;
}

export function upgradeLabel(plan: Plan): string {
  return PLAN_LIMITS[plan].name;
}
