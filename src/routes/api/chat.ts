import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        let body: { messages?: { role: string; content: string }[]; ticker?: string } = {};
        try {
          body = await request.json();
        } catch {
          /* ignore */
        }
        const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];

        const system = {
          role: "system",
          content:
            `You are StockVision AI, an expert assistant for Indian and global equity & crypto markets. ` +
            `Use markdown. Be concise, structured, and end every answer with a one-line SEBI disclaimer. ` +
            `Currently selected ticker: ${body.ticker ?? "none"}.`,
        };

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [system, ...messages],
            stream: true,
          }),
        });

        if (upstream.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit reached. Please wait and try again." }),
            {
              status: 429,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
        if (upstream.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI credits exhausted. Add funds in Workspace settings." }),
            {
              status: 402,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
        if (!upstream.ok || !upstream.body) {
          const t = await upstream.text().catch(() => "");
          return new Response(
            JSON.stringify({ error: `AI gateway error ${upstream.status}: ${t.slice(0, 200)}` }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        return new Response(upstream.body, {
          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
        });
      },
    },
  },
});
