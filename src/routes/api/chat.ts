import { createFileRoute } from "@tanstack/react-router";
import { verifyRequestAuth } from "@/integrations/supabase/verify-auth";
import { aiChatStream, aiNotConfiguredMessage } from "@/lib/aiProvider";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await verifyRequestAuth(request);
        if (!auth) {
          return new Response(JSON.stringify({ error: "Unauthorized. Please sign in." }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        let body: {
          messages?: { role: string; content: string }[];
          ticker?: string;
          context?: string;
        } = {};
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const messages = Array.isArray(body.messages)
          ? body.messages.filter((m) => m?.role && m?.content).slice(-20)
          : [];

        if (messages.length === 0) {
          return new Response(JSON.stringify({ error: "At least one message is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const system = {
          role: "system" as const,
          content:
            `You are StockVision AI — expert on Indian equity markets (NSE/BSE), NIFTY, sectors, IPOs, and portfolios.\n` +
            `Use markdown. Be concise and actionable. End with a one-line SEBI disclaimer.\n` +
            `${body.context ? `Live context:\n${body.context}\n` : ""}` +
            `Selected ticker: ${body.ticker ?? "none"}.`,
        };

        try {
          const { body: stream, contentType } = await aiChatStream([
            system,
            ...messages.map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          ]);
          return new Response(stream, {
            headers: { "Content-Type": contentType, "Cache-Control": "no-cache" },
          });
        } catch (err) {
          const msg = (err as Error).message;
          const status = msg.includes("not configured") ? 503 : msg.includes("Rate limit") ? 429 : 500;
          return new Response(JSON.stringify({ error: msg || aiNotConfiguredMessage() }), {
            status,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
