export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const ENV_CONFIG = {
  required: [
    { key: "SUPABASE_URL", description: "Supabase project URL" },
    { key: "SUPABASE_PUBLISHABLE_KEY", description: "Supabase publishable key" },
  ],
  optional: [
    { key: "GEMINI_API_KEY", description: "Google Gemini API key for AI chat" },
    { key: "GEMINI_MODEL", description: "Gemini model name (default: gemini-2.5-flash)" },
    { key: "GROQ_API_KEY", description: "Groq API key for AI chat" },
    { key: "OPENROUTER_API_KEY", description: "OpenRouter API key for AI chat" },
    { key: "OPENAI_API_KEY", description: "OpenAI API key for AI chat" },
    { key: "NEWS_API_KEY", description: "NewsAPI key for market news" },
    { key: "GNEWS_API_KEY", description: "GNews API key for market news" },
    { key: "FINNHUB_API_KEY", description: "Finnhub API key for market news" },
    { key: "FIRECRAWL_API_KEY", description: "Firecrawl API key for web scraping" },
  ],
};

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const config of ENV_CONFIG.required) {
    if (!process.env[config.key]) {
      errors.push(`Missing required environment variable: ${config.key} (${config.description})`);
    }
  }

  const aiProviders = [
    "GEMINI_API_KEY",
    "GROQ_API_KEY",
    "OPENROUTER_API_KEY",
    "OPENAI_API_KEY",
  ];
  const hasAIProvider = aiProviders.some((key) => !!process.env[key]);
  if (!hasAIProvider) {
    warnings.push(
      "No AI provider API key found. Set at least one of: GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, or OPENAI_API_KEY. AI Chat will not work.",
    );
  }

  const newsProviders = ["NEWS_API_KEY", "GNEWS_API_KEY", "FINNHUB_API_KEY"];
  const hasNewsProvider = newsProviders.some((key) => !!process.env[key]);
  if (!hasNewsProvider) {
    warnings.push(
      "No news provider API key found. Set at least one of: NEWS_API_KEY, GNEWS_API_KEY, or FINNHUB_API_KEY. Market News will not work.",
    );
  }

  if (!process.env.FIRECRAWL_API_KEY) {
    warnings.push(
      "FIRECRAWL_API_KEY not set. Web scraping features may be limited.",
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
