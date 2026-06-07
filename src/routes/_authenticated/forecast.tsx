import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { TICKER_CONFIG, formatPrice, formatChangePct, getTickerConfig } from "@/lib/tickerConfig";
import { runForecast, type ModelName } from "@/lib/forecastService";
import {
  getLiveHistory,
  getHistoryByDateRange,
  validateTicker,
} from "@/lib/yahooFinance.functions";
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  CartesianGrid,
  Bar,
  BarChart,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { Radio, Bell, Check, X, Loader2 } from "lucide-react";
import { computeRSI, computeMACD, lastFinite, rsiVerdict, macdVerdict } from "@/lib/indicators";
import { GlobalSearch } from "@/components/GlobalSearch";
import { getLimits, canUseModel } from "@/lib/planLimits";
import { bumpDailyUsage, getDailyUsage, FORECAST_USAGE_KEY } from "@/lib/planUsage";

export const Route = createFileRoute("/_authenticated/forecast")({
  validateSearch: (s: Record<string, unknown>) => ({
    ticker: typeof s.ticker === "string" ? s.ticker : "RELIANCE.NS",
    model: (["SARIMA", "Prophet", "LSTM", "Ensemble"] as const).includes(s.model as ModelName)
      ? (s.model as ModelName)
      : ("Ensemble" as ModelName),
  }),
  component: ForecastPage,
});

const MODELS: ModelName[] = ["SARIMA", "Prophet", "LSTM", "Ensemble"];
const RANGES = ["1y", "3y", "5y", "10y", "max"] as const;
type Range = (typeof RANGES)[number];
const TICKER_EXAMPLES = {
  "🇮🇳 NIFTY 50": ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS"],
  "🇮🇳 BANK NIFTY": ["SBIN.NS", "ICICIBANK.NS", "AXISBANK.NS", "KOTAKBANK.NS"],
  "🇮🇳 SECTOR": ["TATAMOTORS.NS", "ITC.NS", "SUNPHARMA.NS", "LT.NS"],
} as const;

const RECENTS_KEY = "forecast.recents";
const loadRecents = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]");
  } catch {
    return [];
  }
};
const saveRecent = (t: string) => {
  if (typeof window === "undefined") return;
  const cur = loadRecents().filter((x) => x !== t);
  localStorage.setItem(RECENTS_KEY, JSON.stringify([t, ...cur].slice(0, 8)));
};

const todayISO = () => new Date().toISOString().split("T")[0];
const isoAddYears = (years: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split("T")[0];
};

function ForecastPage() {
  const { ticker: initialT, model: initialM } = Route.useSearch();
  const [ticker, setTicker] = useState<string>(initialT);
  const [tickerInput, setTickerInput] = useState<string>(initialT);
  const [model, setModel] = useState<ModelName>(initialM);
  const [horizon, setHorizon] = useState(30);
  const [range, setRange] = useState<Range>("10y");
  const [useDateRange, setUseDateRange] = useState(false);
  const [startDate, setStartDate] = useState<string>(isoAddYears(-10));
  const [endDate, setEndDate] = useState<string>(todayISO());
  const [recents, setRecents] = useState<string[]>(() => loadRecents());
  const [saving, setSaving] = useState(false);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan ?? "free");
  const forecastUsage = getDailyUsage(FORECAST_USAGE_KEY);
  const forecastsLeft =
    limits.forecastsPerDay === Infinity
      ? Infinity
      : Math.max(0, limits.forecastsPerDay - forecastUsage);

  const cfg = getTickerConfig(ticker);

  useEffect(() => {
    if (!canUseModel(profile?.plan ?? "free", model)) setModel("SARIMA");
  }, [profile?.plan, model]);

  const fetchHistory = useServerFn(getLiveHistory);
  const fetchByDates = useServerFn(getHistoryByDateRange);
  const validate = useServerFn(validateTicker);

  const { data: live, isFetching } = useQuery({
    queryKey: ["live-history", ticker, range, useDateRange, startDate, endDate],
    queryFn: () =>
      useDateRange
        ? fetchByDates({ data: { ticker, startDate, endDate, interval: "1d" } })
        : fetchHistory({ data: { ticker, range } }),
    staleTime: 5 * 60_000,
  });

  // Validate ticker input on debounce
  const [validation, setValidation] = useState<{
    state: "idle" | "checking" | "ok" | "bad";
    name?: string;
    message?: string;
  }>({ state: "idle" });
  useEffect(() => {
    const sym = tickerInput.trim().toUpperCase();
    if (!sym) {
      setValidation({ state: "idle" });
      return;
    }
    setValidation({ state: "checking" });
    const id = setTimeout(async () => {
      try {
        const r = await validate({ data: { ticker: sym } });
        if (r.valid) setValidation({ state: "ok", name: r.name });
        else setValidation({ state: "bad", name: (r as { message?: string }).message });
      } catch {
        setValidation({ state: "bad" });
      }
    }, 400);
    return () => clearTimeout(id);
  }, [tickerInput, validate]);

  const applyTicker = async (t: string) => {
    const sym = t.trim().toUpperCase();
    if (!sym) {
      toast.error("Please enter a ticker symbol.");
      return;
    }
    try {
      const r = await validate({ data: { ticker: sym } });
      if (!r.valid) {
        toast.error((r as { message?: string }).message ?? `Symbol ${sym} not found`);
        setValidation({ state: "bad", message: (r as { message?: string }).message });
        return;
      }
      const resolved = r.symbol;
      setTicker(resolved);
      setTickerInput(resolved);
      setValidation({ state: "ok", name: r.name });
      saveRecent(resolved);
      setRecents(loadRecents());
    } catch {
      toast.error("Could not validate symbol. Try TCS or TCS.NS");
    }
  };

  const result = useMemo(() => {
    const hist = live && live.source === "yahoo" && live.history.length > 5 ? live.history : [];
    return runForecast(hist, ticker, model, horizon);
  }, [live, ticker, model, horizon, range]);

  const dataSource: "yahoo" | "fallback" =
    live && live.source === "yahoo" && live.history.length > 5 ? "yahoo" : "fallback";

  const chartData = useMemo(() => {
    const past = result.historical.slice(-90).map((h) => ({
      date: h.date,
      actual: h.close,
      predicted: null as number | null,
      lower: null as number | null,
      upper: null as number | null,
    }));
    const future = result.forecast.map((f) => ({
      date: f.date,
      actual: null as number | null,
      predicted: f.predicted,
      lower: f.lower,
      upper: f.upper,
    }));
    return [...past, ...future];
  }, [result]);

  const volumeData = useMemo(
    () =>
      result.historical
        .slice(-90)
        .map((h) => ({ date: h.date, volume: h.volume, up: h.close >= h.open })),
    [result],
  );

  const closes = useMemo(() => result.historical.map((h) => h.close), [result]);
  const rsi = useMemo(() => lastFinite(computeRSI(closes, 14)), [closes]);
  const macd = useMemo(() => {
    const { macd, signal, histogram } = computeMACD(closes);
    return { macd: lastFinite(macd), signal: lastFinite(signal), hist: lastFinite(histogram) };
  }, [closes]);

  const handleSave = async () => {
    if (!user) return;
    if (forecastsLeft !== Infinity && forecastsLeft <= 0) {
      toast.error(`Daily forecast limit (${limits.forecastsPerDay}) reached. Upgrade to Student for unlimited.`);
      return;
    }
    if (!canUseModel(profile?.plan ?? "free", model)) {
      toast.error(`${model} requires Student plan or higher.`);
      return;
    }
    bumpDailyUsage(FORECAST_USAGE_KEY);
    setSaving(true);
    const { error } = await supabase.from("forecast_history").insert({
      user_id: user.id,
      ticker,
      model,
      predicted_price: result.predictedPrice,
      predicted_change_pct: result.predictedChangePct,
      recommendation: result.recommendation,
    });
    setSaving(false);
    if (error) toast.error("Failed to save");
    else toast.success("Forecast saved to history");
  };

  const handleSetAlert = async () => {
    if (!user) return;
    const condition = result.predictedPrice >= result.lastPrice ? "above" : "below";
    const { error } = await supabase.from("price_alerts").insert({
      user_id: user.id,
      ticker,
      target_price: result.predictedPrice,
      condition,
      alert_via: "in-app",
      is_active: true,
    });
    if (error) toast.error(error.message);
    else
      toast.success(
        `Alert set: ${ticker} ${condition} ${formatPrice(result.predictedPrice, cfg?.currency)}`,
      );
  };

  const badgeClass =
    result.recommendation === "BUY"
      ? "badge-buy"
      : result.recommendation === "SELL"
        ? "badge-sell"
        : "badge-hold";

  const rv = rsiVerdict(rsi);
  const mv = macdVerdict(macd.hist);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-glow-green">AI Forecast Engine</h1>
        <p className="text-muted-foreground mt-1 flex items-center gap-2 flex-wrap text-sm">
          {forecastsLeft !== Infinity && (
            <span className="text-xs px-2 py-0.5 rounded bg-secondary">
              {forecastsLeft}/{limits.forecastsPerDay} forecasts left today
            </span>
          )}
          SARIMA · Prophet · LSTM · Ensemble — pick a model and horizon.
          <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md bg-secondary">
            <Radio
              className={`size-3 ${dataSource === "yahoo" ? "text-primary animate-pulse" : "text-muted-foreground"}`}
            />
            {isFetching
              ? "Loading live data…"
              : dataSource === "yahoo"
                ? "Live Yahoo Finance"
                : "Simulated (fallback)"}
          </span>
        </p>
      </header>

      <div className="mb-6">
        <GlobalSearch />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4 md:col-span-1">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Ticker</label>
          <div className="relative mt-2">
            <input
              type="text"
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyTicker(tickerInput);
              }}
              placeholder="e.g. TCS.NS / AAPL / BTC-USD"
              className="w-full px-3 py-2 pr-9 rounded-md bg-input border border-border text-foreground focus:outline-none focus:border-primary font-mono-nums"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {validation.state === "checking" && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              )}
              {validation.state === "ok" && <Check className="size-4 text-primary" />}
              {validation.state === "bad" && <X className="size-4 text-destructive" />}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 gap-2">
            <div className="text-xs text-muted-foreground truncate">
              {validation.state === "ok" && validation.name
                ? validation.name
                : validation.state === "bad"
                  ? validation.message ?? "Symbol not found — try TCS or TCS.NS"
                  : ((TICKER_CONFIG as Record<string, { name: string }>)[ticker]?.name ?? ticker)}
            </div>
            <button
              onClick={() => applyTicker(tickerInput)}
              disabled={validation.state === "bad" || !tickerInput.trim()}
              className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
            >
              Load
            </button>
          </div>
          {recents.length > 0 && (
            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Recent
              </div>
              <div className="flex gap-1 flex-wrap">
                {recents.map((r) => (
                  <button
                    key={r}
                    onClick={() => applyTicker(r)}
                    className="px-2 py-0.5 rounded bg-secondary text-xs text-foreground hover:bg-secondary/70 font-mono-nums"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="glass-card p-4">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Model</label>
          <div className="flex gap-2 mt-2 flex-wrap">
            {MODELS.map((m) => {
              const locked = !canUseModel(profile?.plan ?? "free", m);
              return (
                <button
                  key={m}
                  onClick={() => {
                    if (locked) toast.error(`${m} requires Student plan or higher`);
                    else setModel(m);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${model === m
                      ? "bg-primary text-primary-foreground"
                      : locked
                        ? "bg-secondary/50 text-muted-foreground/50 line-through"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {m}{locked ? " 🔒" : ""}
                </button>
              );
            })}
          </div>
        </div>
        <div className="glass-card p-4">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">
            Horizon: <span className="text-foreground font-semibold">{horizon} days</span>
          </label>
          <input
            type="range"
            min={7}
            max={90}
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value))}
            className="w-full mt-3 accent-primary"
          />
        </div>
      </div>

      <div className="glass-card p-4 mb-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">
              History
            </span>
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setUseDateRange(false);
                  setRange(r);
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${!useDateRange && range === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={useDateRange}
              onChange={(e) => setUseDateRange(e.target.checked)}
              className="accent-primary"
            />
            Custom date range
          </label>
        </div>
        {useDateRange && (
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "1Y", years: 1 },
                { label: "3Y", years: 3 },
                { label: "5Y", years: 5 },
                { label: "10Y", years: 10 },
              ].map(({ label, years }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setStartDate(isoAddYears(-years));
                    setEndDate(todayISO());
                  }}
                  className="px-3 py-1 rounded-md text-xs font-semibold bg-secondary text-muted-foreground hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Start date</label>
                <input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">End date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={todayISO()}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            {startDate >= endDate && (
              <p className="text-xs text-destructive">End date must be after start date (min 30 days).</p>
            )}
            {live?.error && <p className="text-xs text-destructive">{live.error}</p>}
          </div>
        )}
        <div className="pt-1 border-t border-border/50">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Ticker examples
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            {Object.entries(TICKER_EXAMPLES).map(([group, syms]) => (
              <div key={group} className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">{group}</span>
                {syms.map((s) => (
                  <button
                    key={s}
                    onClick={() => applyTicker(s)}
                    className="px-2 py-0.5 rounded bg-secondary text-xs font-mono-nums hover:bg-secondary/70"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Current Price" value={formatPrice(result.lastPrice, cfg?.currency)} />
        <Stat
          label={`Predicted (${horizon}d)`}
          value={formatPrice(result.predictedPrice, cfg?.currency)}
        />
        <Stat
          label="Expected Change"
          value={formatChangePct(result.predictedChangePct)}
          accent={result.predictedChangePct >= 0 ? "text-primary" : "text-destructive"}
        />
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Recommendation
            </div>
            <div className="font-heading text-xl font-bold mt-2">{result.recommendation}</div>
          </div>
          <span
            className={`px-3 py-1 rounded-md text-xs font-bold animate-badge-pulse ${badgeClass}`}
          >
            {result.confidence}%
          </span>
        </div>
      </div>

      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-heading text-lg">Price Forecast — {ticker}</h2>
          <div className="flex gap-2">
            <button
              onClick={handleSetAlert}
              className="px-3 py-1.5 rounded-md bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/70 transition flex items-center gap-1.5"
            >
              <Bell className="size-3.5" /> Set alert at target
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 rounded-md bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save to history"}
            </button>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="conf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.75 0.18 220)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.75 0.18 220)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(0.87 0.20 165 / 0.1)" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "oklch(0.70 0.05 235)" }}
                minTickGap={32}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "oklch(0.70 0.05 235)" }}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.18 0.04 250)",
                  border: "1px solid oklch(0.87 0.20 165 / 0.3)",
                  borderRadius: 8,
                }}
              />
              <Area type="monotone" dataKey="upper" stroke="none" fill="url(#conf)" />
              <Area type="monotone" dataKey="lower" stroke="none" fill="oklch(0.16 0.03 250)" />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="oklch(0.87 0.20 165)"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="oklch(0.75 0.18 220)"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="h-32 mt-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Volume</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "oklch(0.70 0.05 235)" }}
                minTickGap={32}
              />
              <YAxis tick={{ fontSize: 10, fill: "oklch(0.70 0.05 235)" }} width={50} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.18 0.04 250)",
                  border: "1px solid oklch(0.87 0.20 165 / 0.3)",
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="volume" fill="oklch(0.87 0.20 165 / 0.5)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <IndicatorCard
          title="RSI (14)"
          value={Number.isFinite(rsi) ? rsi.toFixed(1) : "—"}
          verdict={rv.label}
          accent={rv.color}
          hint="RSI > 70 = overbought · RSI < 30 = oversold"
        />
        <IndicatorCard
          title="MACD (12,26,9)"
          value={Number.isFinite(macd.hist) ? macd.hist.toFixed(2) : "—"}
          verdict={mv.label}
          accent={mv.color}
          hint={`MACD ${Number.isFinite(macd.macd) ? macd.macd.toFixed(2) : "—"} · Signal ${Number.isFinite(macd.signal) ? macd.signal.toFixed(2) : "—"}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="glass-card p-6">
          <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Backtest Metrics
          </h3>
          <dl className="space-y-2 text-sm">
            <Row label="MAE" value={result.backtest.MAE.toFixed(2)} />
            <Row label="RMSE" value={result.backtest.RMSE.toFixed(2)} />
            <Row label="MAPE" value={result.backtest.MAPE} />
            <Row label="Accuracy" value={result.backtest.accuracy} accent="text-primary" />
          </dl>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-3">
            AI Insights
          </h3>
          <ul className="space-y-2 text-sm">
            {result.insights.map((ins, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">▸</span>
                <span className="text-foreground">{ins}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass-card p-6 mb-6">
        <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-3">
          Prediction table
        </h3>
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-right">Predicted</th>
                <th className="px-3 py-2 text-right">Lower</th>
                <th className="px-3 py-2 text-right">Upper</th>
                <th className="px-3 py-2 text-right">Δ vs today</th>
              </tr>
            </thead>
            <tbody>
              {result.forecast.map((f) => {
                const delta = ((f.predicted - result.lastPrice) / result.lastPrice) * 100;
                return (
                  <tr key={f.date} className="border-t border-border">
                    <td className="px-3 py-1.5 text-muted-foreground">{f.date}</td>
                    <td className="px-3 py-1.5 text-right font-mono-nums">
                      {formatPrice(f.predicted, cfg?.currency)}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono-nums text-muted-foreground">
                      {formatPrice(f.lower, cfg?.currency)}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono-nums text-muted-foreground">
                      {formatPrice(f.upper, cfg?.currency)}
                    </td>
                    <td
                      className={`px-3 py-1.5 text-right font-mono-nums font-semibold ${delta >= 0 ? "text-primary" : "text-destructive"}`}
                    >
                      {formatChangePct(delta)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        SEBI Disclaimer: Forecasts are AI-generated for educational purposes. Past performance is
        not indicative of future results.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "text-foreground",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="glass-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-heading text-xl font-bold mt-2 font-mono-nums ${accent}`}>{value}</div>
    </div>
  );
}

function Row({
  label,
  value,
  accent = "text-foreground",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex justify-between border-b border-border pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`font-mono-nums font-semibold ${accent}`}>{value}</dd>
    </div>
  );
}

function IndicatorCard({
  title,
  value,
  verdict,
  accent,
  hint,
}: {
  title: string;
  value: string;
  verdict: string;
  accent: "primary" | "destructive" | "muted-foreground";
  hint: string;
}) {
  const cls =
    accent === "primary"
      ? "text-primary"
      : accent === "destructive"
        ? "text-destructive"
        : "text-muted-foreground";
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{title}</span>
        <span className={`text-xs font-bold uppercase tracking-wider ${cls}`}>{verdict}</span>
      </div>
      <div className="font-heading text-2xl font-bold font-mono-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-2">{hint}</div>
    </div>
  );
}
