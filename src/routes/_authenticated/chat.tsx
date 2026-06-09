import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageSquare, Send, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { getLimits } from "@/lib/planLimits";

export const Route = createFileRoute("/_authenticated/chat")({ component: ChatPage });

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Explain the RSI indicator simply",
  "Should I buy RELIANCE.NS for long-term?",
  "What is the outlook for BTC-USD this quarter?",
  "How do SARIMA and LSTM forecasts differ?",
];

const STORAGE_KEY = "sv:chat:history";
const USAGE_KEY = "sv:chat:usage";

function loadHistory(): Msg[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
function todayKey() {
  return new Date().toISOString().split("T")[0];
}
function getUsage(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = JSON.parse(localStorage.getItem(USAGE_KEY) || "{}");
    return raw.date === todayKey() ? Number(raw.count) || 0 : 0;
  } catch {
    return 0;
  }
}
function bumpUsage() {
  const n = getUsage() + 1;
  localStorage.setItem(USAGE_KEY, JSON.stringify({ date: todayKey(), count: n }));
  return n;
}

function ChatPage() {
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan ?? "free");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadHistory());
    setUsage(getUsage());
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
  }, [messages]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const remaining =
    limits.chatMessages === Infinity ? Infinity : Math.max(0, limits.chatMessages - usage);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    if (remaining !== Infinity && remaining <= 0) {
      toast.error("Daily chat limit reached. Upgrade to Pro for unlimited messages.");
      return;
    }
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setUsage(bumpUsage());
    let assistant = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Stream failed" }));
        throw new Error(err.error || `HTTP ${resp.status}`);
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
    <div className="p-8 max-w-4xl mx-auto h-screen flex flex-col">
      <header className="mb-4 flex items-center gap-3 flex-wrap">
        <MessageSquare className="size-6 text-primary" />
        <div className="flex-1 min-w-0">
          <h1 className="font-heading text-3xl font-bold text-glow-green">AI Market Assistant</h1>
          <p className="text-muted-foreground text-sm">
            Streaming · {remaining === Infinity ? "Unlimited" : `${remaining} left today`} ·{" "}
            {profile?.plan ?? "free"} plan
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="px-3 py-1.5 rounded-md bg-secondary text-xs font-semibold hover:bg-secondary/70 transition flex items-center gap-1.5"
          >
            <Trash2 className="size-3.5" /> Clear
          </button>
        )}
      </header>

      <div className="glass-card flex-1 p-4 overflow-y-auto mb-3 space-y-3">
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
              className={`max-w-[85%] px-4 py-2 rounded-lg text-sm ${
                m.role === "user"
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
    </div>
  );
}
