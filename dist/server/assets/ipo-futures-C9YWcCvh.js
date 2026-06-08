import { X as reactExports, N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
import { u as useServerFn } from "./createSsrRpc-CXvRzAXX.js";
import { u as useQuery } from "./useQuery-DpcV55YJ.js";
import { S as Subscribable, s as shallowEqualObjects, h as hashKey, g as getDefaultState, j as notifyManager, y as useQueryClient, n as noop, q as shouldThrowError, w as useAuthStore, v as toast } from "./router-C3k8-z80.js";
import { a as getIpoCalendar, g as getFutures } from "./ipoFutures.functions-bX0OmTq4.js";
import { s as supabase } from "./client-T0sJvQy8.js";
import { R as Rocket } from "./rocket-CQuq0BNT.js";
import { T as TrendingUp } from "./trending-up-r08gGgu4.js";
import { R as RefreshCw } from "./refresh-cw-BUr9OHaX.js";
import { T as TriangleAlert } from "./triangle-alert-Vsq-qEcN.js";
import { P as Plus } from "./plus-CSvLupSh.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
import "./aiProvider-Cvi-Tcv4.js";
import "./types-BfPr8xct.js";
import "./createLucideIcon-DvD_YuaJ.js";
var MutationObserver = class extends Subscribable {
  #client;
  #currentResult = void 0;
  #currentMutation;
  #mutateOptions;
  constructor(client, options) {
    super();
    this.#client = client;
    this.setOptions(options);
    this.bindMethods();
    this.#updateResult();
  }
  bindMethods() {
    this.mutate = this.mutate.bind(this);
    this.reset = this.reset.bind(this);
  }
  setOptions(options) {
    const prevOptions = this.options;
    this.options = this.#client.defaultMutationOptions(options);
    if (!shallowEqualObjects(this.options, prevOptions)) {
      this.#client.getMutationCache().notify({
        type: "observerOptionsUpdated",
        mutation: this.#currentMutation,
        observer: this
      });
    }
    if (prevOptions?.mutationKey && this.options.mutationKey && hashKey(prevOptions.mutationKey) !== hashKey(this.options.mutationKey)) {
      this.reset();
    } else if (this.#currentMutation?.state.status === "pending") {
      this.#currentMutation.setOptions(this.options);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.#currentMutation?.removeObserver(this);
    }
  }
  onMutationUpdate(action) {
    this.#updateResult();
    this.#notify(action);
  }
  getCurrentResult() {
    return this.#currentResult;
  }
  reset() {
    this.#currentMutation?.removeObserver(this);
    this.#currentMutation = void 0;
    this.#updateResult();
    this.#notify();
  }
  mutate(variables, options) {
    this.#mutateOptions = options;
    this.#currentMutation?.removeObserver(this);
    this.#currentMutation = this.#client.getMutationCache().build(this.#client, this.options);
    this.#currentMutation.addObserver(this);
    return this.#currentMutation.execute(variables);
  }
  #updateResult() {
    const state = this.#currentMutation?.state ?? getDefaultState();
    this.#currentResult = {
      ...state,
      isPending: state.status === "pending",
      isSuccess: state.status === "success",
      isError: state.status === "error",
      isIdle: state.status === "idle",
      mutate: this.mutate,
      reset: this.reset
    };
  }
  #notify(action) {
    notifyManager.batch(() => {
      if (this.#mutateOptions && this.hasListeners()) {
        const variables = this.#currentResult.variables;
        const onMutateResult = this.#currentResult.context;
        const context = {
          client: this.#client,
          meta: this.options.meta,
          mutationKey: this.options.mutationKey
        };
        if (action?.type === "success") {
          try {
            this.#mutateOptions.onSuccess?.(
              action.data,
              variables,
              onMutateResult,
              context
            );
          } catch (e) {
            void Promise.reject(e);
          }
          try {
            this.#mutateOptions.onSettled?.(
              action.data,
              null,
              variables,
              onMutateResult,
              context
            );
          } catch (e) {
            void Promise.reject(e);
          }
        } else if (action?.type === "error") {
          try {
            this.#mutateOptions.onError?.(
              action.error,
              variables,
              onMutateResult,
              context
            );
          } catch (e) {
            void Promise.reject(e);
          }
          try {
            this.#mutateOptions.onSettled?.(
              void 0,
              action.error,
              variables,
              onMutateResult,
              context
            );
          } catch (e) {
            void Promise.reject(e);
          }
        }
      }
      this.listeners.forEach((listener) => {
        listener(this.#currentResult);
      });
    });
  }
};
function useMutation(options, queryClient) {
  const client = useQueryClient();
  const [observer] = reactExports.useState(
    () => new MutationObserver(
      client,
      options
    )
  );
  reactExports.useEffect(() => {
    observer.setOptions(options);
  }, [observer, options]);
  const result = reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => observer.subscribe(notifyManager.batchCalls(onStoreChange)),
      [observer]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  const mutate = reactExports.useCallback(
    (variables, mutateOptions) => {
      observer.mutate(variables, mutateOptions).catch(noop);
    },
    [observer]
  );
  if (result.error && shouldThrowError(observer.options.throwOnError, [result.error])) {
    throw result.error;
  }
  return { ...result, mutate, mutateAsync: result.mutate };
}
function IpoFuturesPage() {
  const [tab, setTab] = reactExports.useState("ipo");
  const [market, setMarket] = reactExports.useState("ALL");
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const ipoFn = useServerFn(getIpoCalendar);
  const futFn = useServerFn(getFutures);
  const ipoQuery = useQuery({
    queryKey: ["ipo-calendar", market],
    queryFn: () => ipoFn({
      data: {
        market
      }
    }),
    enabled: tab === "ipo",
    staleTime: 5 * 60 * 1e3
  });
  const futQuery = useQuery({
    queryKey: ["futures"],
    queryFn: () => futFn({}),
    enabled: tab === "futures",
    refetchInterval: 6e4
  });
  const addToWatchlist = useMutation({
    mutationFn: async (ticker) => {
      if (!user) throw new Error("Sign in required");
      const {
        error
      } = await supabase.from("watchlist").insert({
        user_id: user.id,
        ticker
      });
      if (error) throw error;
    },
    onSuccess: (_d, ticker) => {
      toast.success(`${ticker} added to watchlist`);
      qc.invalidateQueries({
        queryKey: ["watchlist"]
      });
    },
    onError: (e) => toast.error(e.message ?? "Failed")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 lg:p-8 space-y-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-start justify-between flex-wrap gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-heading text-3xl font-bold tracking-tight", children: "IPO & Futures" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Live IPO calendar and global futures market data." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 p-1 rounded-lg glass-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab("ipo"), className: `px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition ${tab === "ipo" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Rocket, { className: "size-4" }),
          " IPOs"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab("futures"), className: `px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition ${tab === "futures" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-4" }),
          " Futures"
        ] })
      ] })
    ] }),
    tab === "ipo" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 p-1 rounded-md glass-card", children: ["ALL", "INDIA", "GLOBAL"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMarket(m), className: `px-3 py-1.5 rounded text-xs font-semibold transition ${market === m ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`, children: m }, m)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => ipoQuery.refetch(), className: "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `size-3.5 ${ipoQuery.isFetching ? "animate-spin" : ""}` }),
          " ",
          "Refresh"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-card rounded-lg overflow-hidden", children: ipoQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-12 text-center text-muted-foreground text-sm", children: "Loading IPO calendar…" }) : ipoQuery.isError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-12 text-center text-destructive text-sm flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-4" }),
        " Failed to load IPOs."
      ] }) : !ipoQuery.data?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-12 text-center text-muted-foreground text-sm", children: "No IPOs found for this market." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3", children: "Company" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3", children: "Market" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3", children: "Open" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3", children: "Close" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3", children: "Listing" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3", children: "Price Band" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3", children: "Size" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3", children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: ipoQuery.data.map((ipo, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/50 hover:bg-muted/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: ipo.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded bg-secondary", children: ipo.market }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: ipo.openDate ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: ipo.closeDate ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: ipo.listingDate ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: ipo.priceBand ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: ipo.issueSize ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: ipo.symbol ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => addToWatchlist.mutate(ipo.symbol), className: "text-xs text-primary hover:underline inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3" }),
            " Watch"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "—" }) })
        ] }, i)) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Data scraped live from Chittorgarh (India) and Nasdaq (Global). Refreshed on demand." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Live futures across indices, commodities, currencies & crypto." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => futQuery.refetch(), className: "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `size-3.5 ${futQuery.isFetching ? "animate-spin" : ""}` }),
          " ",
          "Refresh"
        ] })
      ] }),
      ["INDEX", "COMMODITY", "CURRENCY", "CRYPTO"].map((cat) => {
        const rows = (futQuery.data ?? []).filter((f) => f.category === cat);
        if (!rows.length && !futQuery.isLoading) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs uppercase tracking-wider text-muted-foreground font-semibold", children: cat }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: rows.map((f) => {
            const up = f.changePct >= 0;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card rounded-lg p-4 flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: f.symbol }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => addToWatchlist.mutate(f.symbol), className: "text-xs text-muted-foreground hover:text-primary", title: "Add to watchlist", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3.5" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: f.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline justify-between mt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-heading text-xl tabular-nums", children: f.last ? f.last.toLocaleString(void 0, {
                  maximumFractionDigits: 2
                }) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-sm font-semibold ${up ? "text-primary" : "text-destructive"}`, children: [
                  up ? "▲" : "▼",
                  " ",
                  Math.abs(f.changePct).toFixed(2),
                  "%"
                ] })
              ] })
            ] }, f.symbol);
          }) })
        ] }, cat);
      }),
      futQuery.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-12 text-center text-muted-foreground text-sm", children: "Loading futures…" })
    ] })
  ] });
}
export {
  IpoFuturesPage as component
};
