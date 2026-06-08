import { c as createServerRpc } from "./createServerRpc-Cl0K4URf.js";
import { k as createServerFn } from "./server-Cgfy5VtR.js";
import { r as requireSupabaseAuth } from "./auth-middleware-BerO8flI.js";
import { a as aiChatComplete, c as aiNotConfiguredMessage } from "./aiProvider-Cvi-Tcv4.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
const aiChat_createServerFn_handler = createServerRpc({
  id: "52c6530446fcacbae40b7cd8c260a8d9841cd92a76c694b3e29238c1b3a56552",
  name: "aiChat",
  filename: "src/lib/ai.functions.ts"
}, (opts) => aiChat.__executeServer(opts));
const aiChat = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(aiChat_createServerFn_handler, async ({
  data
}) => {
  const system = {
    role: "system",
    content: `You are StockVision AI for Indian equity markets (NSE/BSE).
Give concise structured answers. End with a one-line SEBI disclaimer.
Ticker context: ${data.ticker ?? "none"}.`
  };
  const reply = await aiChatComplete([system, ...(data.messages ?? []).slice(-20)]);
  return {
    reply
  };
});
const aiMarketNews_createServerFn_handler = createServerRpc({
  id: "848fff2f03dcc14a4bc91973ff2de552afd0bce241221ad2a2769017aa444d5b",
  name: "aiMarketNews",
  filename: "src/lib/ai.functions.ts"
}, (opts) => aiMarketNews.__executeServer(opts));
const aiMarketNews = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(aiMarketNews_createServerFn_handler, async ({
  data
}) => {
  const focus = data.query?.trim() || data.topic?.trim() || "Indian equity markets NSE BSE NIFTY";
  const prompt = `Generate 8 realistic market news items about: ${focus}.
Return ONLY valid JSON: {"items":[{"headline":"...","summary":"...","sentiment":"bullish|bearish|neutral","ticker":"TICKER.NS"}]}`;
  try {
    const raw = await aiChatComplete([{
      role: "user",
      content: prompt
    }]);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    if (e.message.includes("not configured")) {
      return {
        items: [],
        error: aiNotConfiguredMessage()
      };
    }
    return {
      items: []
    };
  }
});
export {
  aiChat_createServerFn_handler,
  aiMarketNews_createServerFn_handler
};
