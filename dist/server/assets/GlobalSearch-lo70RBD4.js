import { X as reactExports, N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
import { x as useNavigate } from "./router-C3k8-z80.js";
import { A as ALL_TICKERS, T as TICKER_CONFIG, G as GLOBAL_TICKERS, C as CRYPTO_TICKERS, I as INDIA_TICKERS } from "./tickerConfig-7S1tvlm8.js";
import { S as Search } from "./search-CogVE9sq.js";
import { X } from "./x-DJQb9mxA.js";
const MARKET_SET = {
  ALL: new Set(ALL_TICKERS),
  INDIA: new Set(INDIA_TICKERS),
  CRYPTO: CRYPTO_TICKERS.length > 0 ? new Set(CRYPTO_TICKERS) : /* @__PURE__ */ new Set(),
  GLOBAL: GLOBAL_TICKERS.length > 0 ? new Set(GLOBAL_TICKERS) : new Set(ALL_TICKERS)
};
function GlobalSearch() {
  const navigate = useNavigate();
  const [q, setQ] = reactExports.useState("");
  const [market, setMarket] = reactExports.useState("ALL");
  const [open, setOpen] = reactExports.useState(false);
  const ref = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);
  const results = reactExports.useMemo(() => {
    const set = MARKET_SET[market];
    const term = q.trim().toLowerCase();
    const list = ALL_TICKERS.filter((t) => set.has(t));
    if (!term) return list.slice(0, 8);
    return list.map((t) => {
      const cfg = TICKER_CONFIG[t];
      const score = (t.toLowerCase().startsWith(term) ? 100 : 0) + (t.toLowerCase().includes(term) ? 30 : 0) + (cfg.name.toLowerCase().includes(term) ? 20 : 0);
      return { t, score };
    }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 10).map((x) => x.t);
  }, [q, market]);
  const pick = (t) => {
    setOpen(false);
    setQ("");
    navigate({ to: "/forecast", search: { ticker: t, model: "Ensemble" } });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref, className: "relative w-full max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-md bg-input border border-border focus-within:border-primary transition flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-4 text-muted-foreground shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: q,
            onFocus: () => setOpen(true),
            onChange: (e) => {
              setQ(e.target.value);
              setOpen(true);
            },
            placeholder: "Search stocks & indices…",
            className: "flex-1 min-w-0 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
          }
        ),
        q && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setQ(""), className: "text-muted-foreground hover:text-foreground shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 flex-wrap sm:shrink-0", children: ["ALL", "INDIA", "CRYPTO", "GLOBAL"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setMarket(m),
          className: `px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition ${market === m ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`,
          children: m
        },
        m
      )) })
    ] }),
    open && results.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute z-30 mt-2 w-full glass-card max-h-96 overflow-y-auto p-1", children: results.map((t) => {
      const cfg = TICKER_CONFIG[t];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => pick(t),
          className: "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-left hover:bg-secondary transition",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-nums font-semibold text-sm", children: t }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: cfg.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: cfg.exchange })
          ]
        },
        t
      );
    }) })
  ] });
}
export {
  GlobalSearch as G
};
