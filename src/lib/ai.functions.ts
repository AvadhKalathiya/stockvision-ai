import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { aiChatComplete, aiNotConfiguredMessage, type ChatMessage } from "./aiProvider";
import { fetchMarketNews } from "./newsService";

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
    const query = data.query?.trim() || data.topic?.trim() || "Indian equity markets";
    
    try {
      const items = await fetchMarketNews(query);
      return { items };
    } catch (e) {
      return { items: [], error: (e as Error).message };
    }
  });
