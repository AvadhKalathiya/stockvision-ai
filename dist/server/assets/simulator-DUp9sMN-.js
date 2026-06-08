import { X as reactExports, N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
import { c as create } from "./router-C3k8-z80.js";
import { A as ALL_TICKERS, b as formatPrice, f as formatChangePct } from "./tickerConfig-7S1tvlm8.js";
import { u as useLiveQuotes } from "./useLiveQuotes-a6H7Jnr0.js";
import { c as createLucideIcon } from "./createLucideIcon-DvD_YuaJ.js";
import { T as TrendingUp } from "./trending-up-r08gGgu4.js";
import { H as History } from "./history-6GR7AgXc.js";
import { T as TriangleAlert } from "./triangle-alert-Vsq-qEcN.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-T0sJvQy8.js";
import "./index-ChW4vIqc.js";
import "./aiProvider-Cvi-Tcv4.js";
import "./useQuery-DpcV55YJ.js";
import "./createSsrRpc-CXvRzAXX.js";
import "./yahooFinance.functions-CNaRUXD5.js";
import "./types-BfPr8xct.js";
import "./planLimits-DfVfhYvW.js";
const __iconNode = [
  [
    "path",
    {
      d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",
      key: "18etb6"
    }
  ],
  ["path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4", key: "xoc0q4" }]
];
const Wallet = createLucideIcon("wallet", __iconNode);
function createJSONStorage(getStorage, options) {
  let storage;
  try {
    storage = getStorage();
  } catch (e) {
    return;
  }
  const persistStorage = {
    getItem: (name) => {
      var _a;
      const parse = (str2) => {
        if (str2 === null) {
          return null;
        }
        return JSON.parse(str2, void 0);
      };
      const str = (_a = storage.getItem(name)) != null ? _a : null;
      if (str instanceof Promise) {
        return str.then(parse);
      }
      return parse(str);
    },
    setItem: (name, newValue) => storage.setItem(name, JSON.stringify(newValue, void 0)),
    removeItem: (name) => storage.removeItem(name)
  };
  return persistStorage;
}
const toThenable = (fn) => (input) => {
  try {
    const result = fn(input);
    if (result instanceof Promise) {
      return result;
    }
    return {
      then(onFulfilled) {
        return toThenable(onFulfilled)(result);
      },
      catch(_onRejected) {
        return this;
      }
    };
  } catch (e) {
    return {
      then(_onFulfilled) {
        return this;
      },
      catch(onRejected) {
        return toThenable(onRejected)(e);
      }
    };
  }
};
const persistImpl = (config, baseOptions) => (set, get, api) => {
  let options = {
    storage: createJSONStorage(() => window.localStorage),
    partialize: (state) => state,
    version: 0,
    merge: (persistedState, currentState) => ({
      ...currentState,
      ...persistedState
    }),
    ...baseOptions
  };
  let hasHydrated = false;
  let hydrationVersion = 0;
  const hydrationListeners = /* @__PURE__ */ new Set();
  const finishHydrationListeners = /* @__PURE__ */ new Set();
  let storage = options.storage;
  if (!storage) {
    return config(
      (...args) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`
        );
        set(...args);
      },
      get,
      api
    );
  }
  const setItem = () => {
    const state = options.partialize({ ...get() });
    return storage.setItem(options.name, {
      state,
      version: options.version
    });
  };
  const savedSetState = api.setState;
  api.setState = (state, replace) => {
    savedSetState(state, replace);
    return setItem();
  };
  const configResult = config(
    (...args) => {
      set(...args);
      return setItem();
    },
    get,
    api
  );
  api.getInitialState = () => configResult;
  let stateFromStorage;
  const hydrate = () => {
    var _a, _b;
    if (!storage) return;
    const currentVersion = ++hydrationVersion;
    hasHydrated = false;
    hydrationListeners.forEach((cb) => {
      var _a2;
      return cb((_a2 = get()) != null ? _a2 : configResult);
    });
    const postRehydrationCallback = ((_b = options.onRehydrateStorage) == null ? void 0 : _b.call(options, (_a = get()) != null ? _a : configResult)) || void 0;
    return toThenable(storage.getItem.bind(storage))(options.name).then((deserializedStorageValue) => {
      if (deserializedStorageValue) {
        if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
          if (options.migrate) {
            const migration = options.migrate(
              deserializedStorageValue.state,
              deserializedStorageValue.version
            );
            if (migration instanceof Promise) {
              return migration.then((result) => [true, result]);
            }
            return [true, migration];
          }
          console.error(
            `State loaded from storage couldn't be migrated since no migrate function was provided`
          );
        } else {
          return [false, deserializedStorageValue.state];
        }
      }
      return [false, void 0];
    }).then((migrationResult) => {
      var _a2;
      if (currentVersion !== hydrationVersion) {
        return;
      }
      const [migrated, migratedState] = migrationResult;
      stateFromStorage = options.merge(
        migratedState,
        (_a2 = get()) != null ? _a2 : configResult
      );
      set(stateFromStorage, true);
      if (migrated) {
        return setItem();
      }
    }).then(() => {
      if (currentVersion !== hydrationVersion) {
        return;
      }
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(get(), void 0);
      stateFromStorage = get();
      hasHydrated = true;
      finishHydrationListeners.forEach((cb) => cb(stateFromStorage));
    }).catch((e) => {
      if (currentVersion !== hydrationVersion) {
        return;
      }
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e);
    });
  };
  api.persist = {
    setOptions: (newOptions) => {
      options = {
        ...options,
        ...newOptions
      };
      if (newOptions.storage) {
        storage = newOptions.storage;
      }
    },
    clearStorage: () => {
      storage == null ? void 0 : storage.removeItem(options.name);
    },
    getOptions: () => options,
    rehydrate: () => hydrate(),
    hasHydrated: () => hasHydrated,
    onHydrate: (cb) => {
      hydrationListeners.add(cb);
      return () => {
        hydrationListeners.delete(cb);
      };
    },
    onFinishHydration: (cb) => {
      finishHydrationListeners.add(cb);
      return () => {
        finishHydrationListeners.delete(cb);
      };
    }
  };
  if (!options.skipHydration) {
    hydrate();
  }
  return stateFromStorage || configResult;
};
const persist = persistImpl;
const useSimulatorStore = create()(
  persist(
    (set, get) => ({
      balance: 1e6,
      // ₹10,00,000 starting capital
      trades: [],
      holdings: {},
      buy: (ticker, qty, price) => {
        const cost = qty * price;
        const { balance, trades, holdings } = get();
        if (balance < cost) return false;
        const currentHolding = holdings[ticker] || { qty: 0, avgPrice: 0 };
        const newQty = currentHolding.qty + qty;
        const newAvg = (currentHolding.qty * currentHolding.avgPrice + cost) / newQty;
        set({
          balance: balance - cost,
          trades: [
            {
              id: Math.random().toString(36).substring(7),
              date: (/* @__PURE__ */ new Date()).toISOString(),
              ticker,
              type: "BUY",
              qty,
              price
            },
            ...trades
          ],
          holdings: { ...holdings, [ticker]: { qty: newQty, avgPrice: newAvg } }
        });
        return true;
      },
      sell: (ticker, qty, price) => {
        const { balance, trades, holdings } = get();
        const currentHolding = holdings[ticker];
        if (!currentHolding || currentHolding.qty < qty) return false;
        const revenue = qty * price;
        const newQty = currentHolding.qty - qty;
        const newHoldings = { ...holdings };
        if (newQty === 0) delete newHoldings[ticker];
        else newHoldings[ticker] = { ...currentHolding, qty: newQty };
        set({
          balance: balance + revenue,
          trades: [
            {
              id: Math.random().toString(36).substring(7),
              date: (/* @__PURE__ */ new Date()).toISOString(),
              ticker,
              type: "SELL",
              qty,
              price
            },
            ...trades
          ],
          holdings: newHoldings
        });
        return true;
      },
      reset: () => set({ balance: 1e6, trades: [], holdings: {} })
    }),
    {
      name: "paper-trading-storage"
    }
  )
);
function SimulatorPage() {
  const balance = useSimulatorStore((s) => s.balance);
  const trades = useSimulatorStore((s) => s.trades);
  const holdings = useSimulatorStore((s) => s.holdings);
  const buy = useSimulatorStore((s) => s.buy);
  const sell = useSimulatorStore((s) => s.sell);
  const reset = useSimulatorStore((s) => s.reset);
  const [tradeTicker, setTradeTicker] = reactExports.useState(ALL_TICKERS[0]);
  const [tradeQty, setTradeQty] = reactExports.useState(1);
  const [error, setError] = reactExports.useState("");
  const {
    quotes
  } = useLiveQuotes();
  const activeQuote = quotes.find((q) => q.ticker === tradeTicker);
  const activePrice = activeQuote?.last ?? 0;
  const holdingsValue = Object.entries(holdings).reduce((acc, [ticker, {
    qty
  }]) => {
    const p = quotes.find((q) => q.ticker === ticker)?.last ?? 0;
    return acc + qty * p;
  }, 0);
  const totalValue = balance + holdingsValue;
  const totalReturn = (totalValue - 1e6) / 1e6 * 100;
  const handleBuy = () => {
    setError("");
    if (activePrice === 0) {
      setError("Live price not available.");
      return;
    }
    if (!buy(tradeTicker, tradeQty, activePrice)) setError("Insufficient virtual funds.");
  };
  const handleSell = () => {
    setError("");
    if (activePrice === 0) {
      setError("Live price not available.");
      return;
    }
    if (!sell(tradeTicker, tradeQty, activePrice)) setError("Insufficient quantity in holdings.");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-6 flex justify-between items-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-heading text-3xl font-bold text-glow-green", children: "Paper Trading Simulator" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Practice Indian market strategies with ₹10,00,000 virtual capital." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        if (confirm("Reset all virtual data?")) reset();
      }, className: "text-xs px-3 py-1 bg-destructive/20 text-destructive rounded font-bold", children: "Reset Account" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6 border-t-4 border-t-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 items-center mb-2 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "size-5" }),
          " Virtual Balance"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-mono-nums font-bold", children: formatPrice(balance) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6 border-t-4 border-t-accent", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 items-center mb-2 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-5" }),
          " Total Equity"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-mono-nums font-bold", children: formatPrice(totalValue) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6 border-t-4 border-t-yellow-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 items-center mb-2 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "size-5" }),
          " All-Time P&L"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-3xl font-mono-nums font-bold ${totalReturn >= 0 ? "text-primary" : "text-destructive"}`, children: [
          totalReturn >= 0 ? "+" : "",
          formatPrice(totalValue - 1e6),
          " (",
          totalReturn.toFixed(2),
          "%)"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-1 space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-heading text-lg font-bold mb-4", children: "Execute Trade" }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-destructive/20 text-destructive text-sm p-3 rounded mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-4" }),
          error
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase text-muted-foreground font-bold mb-1 block", children: "Ticker" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: tradeTicker, onChange: (e) => setTradeTicker(e.target.value), className: "w-full bg-input border border-border p-2 rounded", children: ALL_TICKERS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-end mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase text-muted-foreground font-bold", children: "Quantity" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "Holding: ",
                holdings[tradeTicker]?.qty || 0
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: "1", value: tradeQty, onChange: (e) => setTradeQty(Number(e.target.value)), className: "w-full bg-input border border-border p-2 rounded font-mono-nums" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/50 p-3 rounded border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground uppercase", children: "Live Market Price" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold font-mono-nums", children: formatPrice(activePrice) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs font-semibold ${activeQuote && activeQuote.changePct >= 0 ? "text-primary" : "text-destructive"}`, children: [
              formatChangePct(activeQuote?.changePct ?? 0),
              " Today"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleBuy, className: "flex-1 bg-primary text-primary-foreground py-2 rounded font-bold hover:bg-primary/90 transition", children: "BUY" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSell, className: "flex-1 bg-destructive text-destructive-foreground py-2 rounded font-bold hover:bg-destructive/90 transition", children: "SELL" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-heading text-lg font-bold mb-4", children: "Virtual Holdings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-secondary/50 text-muted-foreground text-left text-xs uppercase", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Ticker" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-right", children: "Qty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-right", children: "Avg Price" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-right", children: "Live Price" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-right", children: "P&L" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
              Object.entries(holdings).map(([t, {
                qty,
                avgPrice
              }]) => {
                const live = quotesData?.find((q) => q.ticker === t)?.last ?? avgPrice;
                const pl = (live - avgPrice) * qty;
                const plPct = (live - avgPrice) / avgPrice * 100;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 font-bold", children: t }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-right font-mono-nums", children: qty }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-right font-mono-nums", children: formatPrice(avgPrice) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-right font-mono-nums", children: formatPrice(live) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: `p-3 text-right font-mono-nums font-semibold ${pl >= 0 ? "text-primary" : "text-destructive"}`, children: [
                    pl >= 0 ? "+" : "",
                    formatPrice(pl),
                    " (",
                    plPct.toFixed(2),
                    "%)"
                  ] })
                ] }, t);
              }),
              Object.keys(holdings).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "p-6 text-center text-muted-foreground", children: "No open positions." }) })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-heading text-lg font-bold mb-4", children: "Trade History" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: [
            trades.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center p-3 border border-border rounded bg-secondary/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-bold text-xs px-2 py-1 rounded ${t.type === "BUY" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`, children: t.type }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: t.ticker }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: new Date(t.date).toLocaleString() })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono-nums font-bold", children: [
                  t.qty,
                  " @ ",
                  formatPrice(t.price)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                  "Value: ",
                  formatPrice(t.qty * t.price)
                ] })
              ] })
            ] }, t.id)),
            trades.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-muted-foreground py-4", children: "No trades executed yet." })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  SimulatorPage as component
};
