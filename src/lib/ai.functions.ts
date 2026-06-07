import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { aiChatComplete, aiNotConfiguredMessage, type ChatMessage } from "./aiProvider";

export type { ChatMessage };

export const aiChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { messages: ChatMessage[]; ticker?: string }) => data)
  .handler(async ({ data }) => {
    const system: ChatMessage = {
      role: "system",
      content: `You are StockVision AI for Indian equity markets (NSE/BSE).
Give concise structured answers. End with a one-line SEBI disclaimer.
Ticker context: ${data.ticker ?? "none"}.`,
    };
    const reply = await aiChatComplete([system, ...(data.messages ?? []).slice(-20)]);
    return { reply };
  });

export const aiMarketNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { topic?: string; query?: string }) => data)
  .handler(async ({ data }) => {
    const focus = data.query?.trim() || data.topic?.trim() || "Indian equity markets NSE BSE NIFTY";
    const prompt = `Generate 8 realistic market news items about: ${focus}.
Return ONLY valid JSON: {"items":[{"headline":"...","summary":"...","sentiment":"bullish|bearish|neutral","ticker":"TICKER.NS"}]}`;

    try {
      const raw = await aiChatComplete([{ role: "user", content: prompt }]);
      const cleaned = raw.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned) as {
        items: { headline: string; summary: string; sentiment: string; ticker: string }[];
      };
    } catch (e) {
      if ((e as Error).message.includes("not configured")) {
        return { items: [], error: aiNotConfiguredMessage() };
      }
      return { items: [] };
    }
  });
