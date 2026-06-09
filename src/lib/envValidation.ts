export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const ENV_CONFIG = {
  required: [
    { key: "VITE_SUPABASE_URL", description: "Supabase project URL" },
    { key: "VITE_SUPABASE_PUBLISHABLE_KEY", description: "Supabase publishable key" },
  ],
  optional: [
    { key: "VITE_GEMINI_API_KEY", description: "Google Gemini API key for AI chat" },
    { key: "VITE_GEMINI_MODEL", description: "Gemini model name (default: gemini-2.5-flash)" },
    { key: "VITE_GROQ_API_KEY", description: "Groq API key for AI chat" },
    { key: "VITE_OPENROUTER_API_KEY", description: "OpenRouter API key for AI chat" },
    { key: "VITE_OPENAI_API_KEY", description: "OpenAI API key for AI chat" },
    { key: "VITE_NEWS_API_KEY", description: "NewsAPI key for market news" },
    { key: "VITE_GNEWS_API_KEY", description: "GNews API key for market news" },
    { key: "VITE_FINNHUB_API_KEY", description: "Finnhub API key for market news" },
    { key: "VITE_FIRECRAWL_API_KEY", description: "Firecrawl API key for web scraping" },
  ],
};

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get the environment variables from Vite's import.meta.env
  const getEnv = (key: string): string | undefined => {
    return (import.meta.env as Record<string, string | undefined>)[key];
  };

  for (const config of ENV_CONFIG.required) {
    if (!getEnv(config.key)) {
      errors.push(`Missing required environment variable: ${config.key} (${config.description})`);
    }
  }

  const aiProviders = [
    "VITE_GEMINI_API_KEY",
    "VITE_GROQ_API_KEY",
    "VITE_OPENROUTER_API_KEY",
    "VITE_OPENAI_API_KEY",
  ];
  const hasAIProvider = aiProviders.some((key) => !!getEnv(key));
  if (!hasAIProvider) {
    warnings.push(
      "No AI provider API key found. Set at least one of: VITE_GEMINI_API_KEY, VITE_GROQ_API_KEY, VITE_OPENROUTER_API_KEY, or VITE_OPENAI_API_KEY. AI Chat will not work.",
    );
  }

  const newsProviders = ["VITE_NEWS_API_KEY", "VITE_GNEWS_API_KEY", "VITE_FINNHUB_API_KEY"];
  const hasNewsProvider = newsProviders.some((key) => !!getEnv(key));
  if (!hasNewsProvider) {
    warnings.push(
      "No news provider API key found. Set at least one of: VITE_NEWS_API_KEY, VITE_GNEWS_API_KEY, or VITE_FINNHUB_API_KEY. Market News will not work.",
    );
  }

  if (!getEnv("VITE_FIRECRAWL_API_KEY")) {
    warnings.push(
      "VITE_FIRECRAWL_API_KEY not set. Web scraping features may be limited.",
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function printEnvValidation(): void {
  const result = validateEnvironment();

  if (result.errors.length > 0) {
    console.error("\n=== ENVIRONMENT VALIDATION FAILED ===");
    console.error("Required environment variables are missing:");
    for (const error of result.errors) {
      console.error(`  ❌ ${error}`);
    }
    console.error("=====================================\n");
  }

  if (result.warnings.length > 0) {
    console.warn("\n=== ENVIRONMENT WARNINGS ===");
    console.warn("Optional environment variables are missing:");
    for (const warning of result.warnings) {
      console.warn(`  ⚠️  ${warning}`);
    }
    console.warn("==============================\n");
  }

  if (result.valid && result.warnings.length === 0) {
    console.log("\n✅ Environment validation passed. All required variables are set.\n");
  }
}

export function getEnvValidationSummary(): string {
  const result = validateEnvironment();
  
  if (!result.valid) {
    return `Configuration Error: ${result.errors.join("; ")}`;
  }
  
  if (result.warnings.length > 0) {
    return `Configuration Warning: ${result.warnings.join("; ")}`;
  }
  
  return "Configuration OK";
}
