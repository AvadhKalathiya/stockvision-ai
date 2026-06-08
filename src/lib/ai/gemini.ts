export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

export function validateGeminiConfig(config: GeminiConfig): boolean {
  return !!config?.apiKey && config.apiKey.length > 0;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geminiRequest<T>(
  url: string,
  body: unknown,
  apiKey: string,
  retries = MAX_RETRIES,
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.status === 429) {
        if (attempt < retries - 1) {
          await sleep(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
        throw new Error("Rate limit reached. Please wait and try again.");
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.error("Gemini API Error:", {
          status: response.status,
          error: errorText.slice(0, 500),
          url: url.replace(apiKey, "***"),
        });
        
        if (response.status === 404) {
          throw new Error("AI service temporarily unavailable. Please try again.");
        }
        
        throw new Error(`Gemini API error ${response.status}: ${errorText.slice(0, 200)}`);
      }

      return await response.json() as T;
    } catch (error) {
      if (attempt === retries - 1) {
        console.error("Gemini API Error after retries:", error);
        throw error;
      }
      
      if (error instanceof Error && error.message.includes("Rate limit")) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
      
      throw error;
    }
  }

  throw new Error("Gemini API request failed after retries");
}

export async function geminiComplete(
  config: GeminiConfig,
  messages: ChatMessage[],
): Promise<string> {
  if (!validateGeminiConfig(config)) {
    throw new Error("AI service temporarily unavailable. Please try again.");
  }

  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const model = config.model || GEMINI_MODEL;
  const url = `${GEMINI_API_URL}/${model}:generateContent?key=${config.apiKey}`;

  const response = await geminiRequest<{
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  }>(url, {
    systemInstruction: system ? { parts: [{ text: system }] } : undefined,
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  }, config.apiKey);

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error("Gemini API Error: No text in response");
    throw new Error("AI service temporarily unavailable. Please try again.");
  }

  return text;
}

export async function geminiStream(
  config: GeminiConfig,
  messages: ChatMessage[],
): Promise<ReadableStream<Uint8Array>> {
  if (!validateGeminiConfig(config)) {
    throw new Error("AI service temporarily unavailable. Please try again.");
  }

  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const model = config.model || GEMINI_MODEL;
  const url = `${GEMINI_API_URL}/${model}:streamGenerateContent?key=${config.apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => "");
    console.error("Gemini API Error:", {
      status: response.status,
      error: errorText.slice(0, 500),
      url: url.replace(config.apiKey, "***"),
    });
    
    if (response.status === 404) {
      throw new Error("AI service temporarily unavailable. Please try again.");
    }
    
    throw new Error(`Gemini API error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  return response.body;
}

export function convertGeminiStreamToOpenAI(
  geminiStream: ReadableStream<Uint8Array>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const reader = geminiStream.getReader();
        const buffer: string[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer.push(chunk);

          const lines = buffer.join("").split("\n");
          buffer.length = 0;
          buffer.push(lines.pop() || "");

          for (const line of lines) {
            if (!line.trim() || line.startsWith(":")) continue;

            try {
              const data = JSON.parse(line);
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                const openaiChunk = {
                  choices: [{ delta: { content: text } }],
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(openaiChunk)}\n\n`));
              }
            } catch (e) {
              console.error("Error parsing Gemini stream chunk:", e);
            }
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("Gemini stream conversion error:", error);
        controller.error(error);
      }
    },
  });
}
