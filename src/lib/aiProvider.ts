import { geminiComplete, geminiStream, convertGeminiStreamToOpenAI, type ChatMessage as GeminiMessage } from "./ai/gemini";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export interface AIConfig {
  provider: "gemini" | "openai" | "openrouter" | "groq";
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export function resolveAIConfig(): AIConfig | null {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    return {
      provider: "gemini",
      apiKey: geminiKey,
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    };
  }
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return {
      provider: "groq",
      apiKey: groqKey,
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      baseUrl: "https://api.groq.com/openai/v1",
    };
  }
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    return {
      provider: "openrouter",
      apiKey: openrouterKey,
      model: process.env.OPENROUTER_MODEL || "google/gemma-3-27b-it:free",
      baseUrl: "https://openrouter.ai/api/v1",
    };
  }
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return {
      provider: "openai",
      apiKey: openaiKey,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    };
  }
  return null;
}

export function aiNotConfiguredMessage(): string {
  return "AI is not configured. Set GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, or OPENAI_API_KEY in your environment.";
}

async function openaiComplete(config: AIConfig, messages: ChatMessage[]): Promise<string> {
  const baseUrl = config.baseUrl || "https://api.openai.com/v1";
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({ model: config.model, messages }),
  });
  if (res.status === 429) throw new Error("Rate limit reached. Please wait and try again.");
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error(`${config.provider} API Error:`, { status: res.status, error: t.slice(0, 200) });
    throw new Error(`${config.provider} error ${res.status}: ${t.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "(no response)";
}

export async function aiChatComplete(messages: ChatMessage[]): Promise<string> {
  const config = resolveAIConfig();
  if (!config) throw new Error(aiNotConfiguredMessage());
  
  if (config.provider === "gemini") {
    try {
      return await geminiComplete(
        { apiKey: config.apiKey, model: config.model },
        messages as GeminiMessage[],
      );
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("AI service temporarily unavailable. Please try again.");
    }
  }
  
  return openaiComplete(config, messages);
}

/** Returns OpenAI-compatible SSE stream, or Gemini converted to OpenAI SSE chunks. */
export async function aiChatStream(
  messages: ChatMessage[],
): Promise<{ body: ReadableStream<Uint8Array>; contentType: string }> {
  const config = resolveAIConfig();
  if (!config) throw new Error(aiNotConfiguredMessage());

  if (config.provider === "openai" || config.provider === "openrouter" || config.provider === "groq") {
    const baseUrl = config.baseUrl || "https://api.openai.com/v1";
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({ model: config.model, messages, stream: true }),
    });
    if (res.status === 429) throw new Error("Rate limit reached. Please wait and try again.");
    if (!res.ok || !res.body) {
      const t = await res.text().catch(() => "");
      console.error(`${config.provider} API Error:`, { status: res.status, error: t.slice(0, 200) });
      throw new Error(`${config.provider} error ${res.status}: ${t.slice(0, 200)}`);
    }
    return { body: res.body, contentType: "text/event-stream" };
  }

  if (config.provider === "gemini") {
    try {
      const geminiStreamBody = await geminiStream(
        { apiKey: config.apiKey, model: config.model },
        messages as GeminiMessage[],
      );
      const openaiStream = convertGeminiStreamToOpenAI(geminiStreamBody);
      return { body: openaiStream, contentType: "text/event-stream" };
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("AI service temporarily unavailable. Please try again.");
    }
  }

  throw new Error("AI service temporarily unavailable. Please try again.");
}
