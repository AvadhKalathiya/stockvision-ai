function resolveAIConfig() {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    return {
      provider: "gemini",
      apiKey: geminiKey,
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash"
    };
  }
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return {
      provider: "openai",
      apiKey: openaiKey,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini"
    };
  }
  return null;
}
function aiNotConfiguredMessage() {
  return "AI is not configured. Set GEMINI_API_KEY or OPENAI_API_KEY in your environment.";
}
async function geminiComplete(config, messages) {
  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const contents = messages.filter((m) => m.role !== "system").map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : void 0,
      contents
    })
  });
  if (res.status === 429) throw new Error("Rate limit reached. Please wait and try again.");
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Gemini error ${res.status}: ${t.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "(no response)";
}
async function openaiComplete(config, messages) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({ model: config.model, messages })
  });
  if (res.status === 429) throw new Error("Rate limit reached. Please wait and try again.");
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`OpenAI error ${res.status}: ${t.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "(no response)";
}
async function aiChatComplete(messages) {
  const config = resolveAIConfig();
  if (!config) throw new Error(aiNotConfiguredMessage());
  if (config.provider === "gemini") return geminiComplete(config, messages);
  return openaiComplete(config, messages);
}
async function aiChatStream(messages) {
  const config = resolveAIConfig();
  if (!config) throw new Error(aiNotConfiguredMessage());
  if (config.provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({ model: config.model, messages, stream: true })
    });
    if (res.status === 429) throw new Error("Rate limit reached. Please wait and try again.");
    if (!res.ok || !res.body) {
      const t = await res.text().catch(() => "");
      throw new Error(`OpenAI error ${res.status}: ${t.slice(0, 200)}`);
    }
    return { body: res.body, contentType: "text/event-stream" };
  }
  const text = await geminiComplete(config, messages);
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      const chunk = {
        choices: [{ delta: { content: text } }]
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}

`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    }
  });
  return { body, contentType: "text/event-stream" };
}
export {
  aiChatComplete as a,
  aiChatStream as b,
  aiNotConfiguredMessage as c
};
