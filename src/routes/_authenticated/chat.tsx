import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { formatChangePct, formatPrice } from "@/lib/tickerConfig";
import { aiNotConfiguredMessage } from "@/lib/aiProvider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { getLimits } from "@/lib/planLimits";
import { bumpDailyUsage, getDailyUsage, CHAT_USAGE_KEY } from "@/lib/planUsage";

export const Route = createFileRoute("/_authenticated/chat")({ component: ChatPage });

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What is NIFTY 50 outlook today?",
  "Analyze Banking sector performance",
  "Should I buy RELIANCE for long-term?",
  "Explain my portfolio diversification",
  "Upcoming IPO opportunities in India",
];

const STORAGE_KEY = "sv:chat:history";
function loadHistory(): Msg[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
function ChatPage() {
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const limits = getLimits(profile?.plan ?? "free");
  const { quotes } = useLiveQuotes();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [holdings, setHoldings] = useState<{ ticker: string; qty: number }[]>([]);
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadHistory());
    setUsage(getDailyUsage(CHAT_USAGE_KEY));
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("watchlist").select("ticker").eq("user_id", user.id).then(({ data }) =>
      setWatchlist((data ?? []).map((r) => r.ticker)),
    );
    supabase.from("portfolio").select("ticker,qty").eq("user_id", user.id).then(({ data }) =>
      setHoldings((data ?? []) as { ticker: string; qty: number }[]),
    );
  }, [user]);

  const marketContext = useMemo(() => {
    const nifty = quotes.find((q) => q.ticker === "NIFTY50");
    const sensex = quotes.find((q) => q.ticker === "SENSEX");
    const lines = [
      nifty ? `NIFTY 50: ${formatPrice(nifty.last)} (${formatChangePct(nifty.changePct)})` : "",
      sensex ? `SENSEX: ${formatPrice(sensex.last)} (${formatChangePct(sensex.changePct)})` : "",
      watchlist.length ? `Watchlist: ${watchlist.join(", ")}` : "",
      holdings.length ? `Portfolio: ${holdings.map((h) => `${h.ticker} x${h.qty}`).join(", ")}` : "",
    ].filter(Boolean);
    return lines.join("\n");
  }, [quotes, watchlist, holdings]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
  }, [messages]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const remaining =
    limits.chatMessagesPerDay === Infinity ? Infinity : Math.max(0, limits.chatMessagesPerDay - usage);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    if (remaining !== Infinity && remaining <= 0) {
      toast.error(`Daily limit (${limits.chatMessagesPerDay}) reached. Upgrade to Pro for unlimited AI Chat.`);
      return;
    }
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setUsage(bumpDailyUsage(CHAT_USAGE_KEY));
    let assistant = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Session expired. Please sign in again.");

      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: next, context: marketContext }),
      });
      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Stream failed" }));
        const msg = err.error || `HTTP ${resp.status}`;
        if (msg.includes("not configured")) setAiUnavailable(true);
        throw new Error(msg.includes("not configured") ? aiNotConfiguredMessage() : msg);
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const r = await reader.read();
        if (r.done) break;
        buf += decoder.decode(r.value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistant += delta;
              setMessages((prev) => {
                const copy = prev.slice();
                copy[copy.length - 1] = { role: "assistant", content: assistant };
                return copy;
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
      if (!assistant) {
        setMessages((prev) => prev.slice(0, -1));
        toast.error("Empty response from AI");
      }
    } catch (e) {
      setMessages((prev) => prev.slice(0, -1));
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Chat cleared");
  };

  return (
    <PageShell
      title="AI Market Assistant"
      subtitle={`Streaming · ${remaining === Infinity ? "Unlimited" : `${remaining} left today`} · ${profile?.plan ?? "free"} plan`}
      className="max-w-4xl flex flex-col min-h-[calc(100dvh-8rem)] md:min-h-[calc(100dvh-4rem)]"
      actions={
        messages.length > 0 ? (
          <button
            onClick={clearChat}
            className="px-3 py-1.5 rounded-md bg-secondary text-xs font-semibold hover:bg-secondary/70 transition flex items-center gap-1.5"
          >
            <Trash2 className="size-3.5" /> Clear
          </button>
        ) : null
      }
    >
      {aiUnavailable && (
        <div className="glass-card p-3 mb-3 text-sm text-muted-foreground border border-warning/30">
          {aiNotConfiguredMessage()} Add GEMINI_API_KEY or OPENAI_API_KEY to your .env file.
        </div>
      )}
      <div className="glass-card flex-1 min-h-[280px] p-4 overflow-y-auto mb-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="size-10 text-primary mx-auto mb-3 opacity-60" />
            <p className="text-muted-foreground mb-4">Try one of these:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="px-3 py-1.5 rounded-md bg-secondary text-sm text-foreground hover:bg-primary/15 hover:text-primary transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-4 py-2 rounded-lg text-sm ${m.role === "user"
                  ? "bg-primary/15 text-foreground border border-primary/30"
                  : "bg-secondary text-foreground"
                }`}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_code]:bg-background/40 [&_code]:px-1 [&_code]:rounded">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content || "…"}</ReactMarkdown>
                </div>
              ) : (
                <span className="whitespace-pre-wrap">{m.content}</span>
              )}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-secondary px-4 py-2 rounded-lg text-sm text-muted-foreground animate-pulse">
              Thinking…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a stock, strategy, or indicator…"
          className="flex-1 px-4 py-2 rounded-md bg-input border border-border focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          <Send className="size-4" />
        </button>
      </form>
      <p className="text-xs text-muted-foreground text-center mt-3">
        SEBI Disclaimer: Educational only. Not investment advice.
      </p>
    </PageShell>
  );
}
