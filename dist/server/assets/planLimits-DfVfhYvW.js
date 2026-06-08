const PLAN_LIMITS = {
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
      "Sector Dashboard"
    ]
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
      "PDF Export"
    ]
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
      "Priority Data Refresh"
    ]
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
      "Early Access Features"
    ]
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
      "White-label Options"
    ]
  }
};
const PLAN_ORDER = ["free", "student", "pro", "pro_plus", "enterprise"];
function normalizePlan(plan) {
  const p = (plan ?? "free").toLowerCase().replace(/-/g, "_");
  if (p === "proplus") return "pro_plus";
  if (p in PLAN_LIMITS) return p;
  return "free";
}
function getLimits(plan) {
  return PLAN_LIMITS[normalizePlan(plan)];
}
function canUseModel(plan, model) {
  return getLimits(plan).models.includes(model);
}
function upgradeLabel(plan) {
  return PLAN_LIMITS[plan].name;
}
export {
  PLAN_LIMITS as P,
  PLAN_ORDER as a,
  canUseModel as c,
  getLimits as g,
  normalizePlan as n,
  upgradeLabel as u
};
