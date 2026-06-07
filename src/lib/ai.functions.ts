import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export const aiChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { messages: ChatMessage[]; ticker?: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Lovable AI key not configured");

    const system: ChatMessage = {
      role: "system",
      content: `You are StockVision AI, an expert assistant for Indian and global equity & crypto markets.
Give concise, structured answers. Always include a SEBI disclaimer in 1 short line at the end.
Currently selected ticker: ${data.ticker ?? "none"}.`,
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [system, ...data.messages],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 200)}`);
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { reply: json.choices?.[0]?.message?.content ?? "(no response)" };
  });

export const aiMarketNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { topic?: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Lovable AI key not configured");

    const prompt = `Generate 6 short, realistic-sounding market news headlines for ${data.topic ?? "Indian equity, US tech and crypto markets"}.
Return ONLY valid JSON of shape: {"items":[{"headline":"...","summary":"...","sentiment":"bullish|bearish|neutral","ticker":"TICKER"}]}.
Do not include any prose outside JSON.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`AI gateway error ${res.status}`);
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content ?? '{"items":[]}';
    const cleaned = raw.replace(/```json|```/g, "").trim();
    try {
      return JSON.parse(cleaned) as {
        items: { headline: string; summary: string; sentiment: string; ticker: string }[];
      };
    } catch {
      return { items: [] };
    }
  });
