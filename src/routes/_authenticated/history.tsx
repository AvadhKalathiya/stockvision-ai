import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { History, Trash2, Search, RotateCw, Download } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, formatChangePct, getTickerConfig } from "@/lib/tickerConfig";
import { getLiveQuotes } from "@/lib/yahooFinance.functions";
import { downloadCSV } from "@/lib/csv";
import { getLimits } from "@/lib/planLimits";
import { PlanGate } from "@/components/PlanGate";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/_authenticated/history")({ component: HistoryPage });

interface Item {
  id: string;
  ticker: string;
  model: string;
  predicted_price: number | null;
  predicted_change_pct: number | null;
  recommendation: string;
  created_at: string;
}

function HistoryPage() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);

  if (!limits.canForecastHistory) {
    return (
      <PageShell title="Forecast History" subtitle="Track past predictions and model accuracy over time.">
        <PlanGate
          requiredPlan="pro"
          title="Historical Forecast Tracking"
          description="Review past forecasts, accuracy metrics, and export history. Available on Pro plan and above."
        />
      </PageShell>
    );
  }
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tickerFilter, setTickerFilter] = useState<string>("ALL");
  const [modelFilter, setModelFilter] = useState<string>("ALL");
  const [recFilter, setRecFilter] = useState<string>("ALL");
  const [page, setPage] = useState(0);
  const PAGE = 20;

  const fetchQuotes = useServerFn(getLiveQuotes);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("forecast_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    else setItems((data ?? []) as Item[]);
    setLoading(false);
  };
  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [user]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("forecast_history").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  };

  const uniqueTickers = useMemo(
    () => Array.from(new Set(items.map((i) => i.ticker))).sort(),
    [items],
  );
  const uniqueModels = useMemo(
    () => Array.from(new Set(items.map((i) => i.model))).sort(),
    [items],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((it) => {
      if (tickerFilter !== "ALL" && it.ticker !== tickerFilter) return false;
      if (modelFilter !== "ALL" && it.model !== modelFilter) return false;
      if (recFilter !== "ALL" && it.recommendation !== recFilter) return false;
      if (term && !`${it.ticker} ${it.model}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [items, tickerFilter, modelFilter, recFilter, q]);

  const paged = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));

  // accuracy: fetch live prices for forecast tickers, compare prediction direction vs current move
  const quotesQuery = useQuery({
    queryKey: ["hist-acc", uniqueTickers],
    queryFn: () => fetchQuotes({ data: { tickers: uniqueTickers.slice(0, 30) } }),
    enabled: uniqueTickers.length > 0,
    staleTime: 5 * 60_000,
  });

  const accuracy = useMemo(() => {
    const priceMap = new Map(quotesQuery.data?.map((qu) => [qu.ticker, qu.last]) ?? []);
    const by: Record<string, { hit: number; total: number }> = {
      BUY: { hit: 0, total: 0 },
      SELL: { hit: 0, total: 0 },
      HOLD: { hit: 0, total: 0 },
    };
    items.forEach((it) => {
      const live = priceMap.get(it.ticker);
      if (!live || it.predicted_price == null) return;
      const bucket = by[it.recommendation];
      if (!bucket) return;
      bucket.total++;
      const targetUp = Number(it.predicted_price) >= Number(it.predicted_price);
      // Heuristic: BUY correct if live >= predicted floor, SELL correct if live <= predicted, HOLD always partial
      const correct =
        it.recommendation === "BUY"
          ? live >= Number(it.predicted_price) * 0.97
          : it.recommendation === "SELL"
            ? live <= Number(it.predicted_price) * 1.03
            : Math.abs((live - Number(it.predicted_price)) / live) < 0.05;
      void targetUp;
      if (correct) bucket.hit++;
    });
    return by;
  }, [items, quotesQuery.data]);

  const exportCsv = () => {
    downloadCSV(
      `forecast-history-${Date.now()}.csv`,
      filtered.map((it) => ({
        date: it.created_at,
        ticker: it.ticker,
        model: it.model,
        predicted_price: it.predicted_price,
        change_pct: it.predicted_change_pct,
        recommendation: it.recommendation,
      })),
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-6 flex items-center gap-3 flex-wrap">
        <History className="size-6 text-primary" />
        <div className="flex-1">
          <h1 className="font-heading text-3xl font-bold text-glow-green">Forecast History</h1>
          <p className="text-muted-foreground text-sm">
            Your saved AI predictions with live accuracy tracking.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="px-3 py-1.5 rounded-md bg-secondary text-foreground text-xs font-semibold flex items-center gap-1.5"
        >
          <Download className="size-4" /> Export CSV
        </button>
      </header>

      {/* Accuracy cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {(["BUY", "SELL", "HOLD"] as const).map((rec) => {
          const a = accuracy[rec];
          const pct = a.total ? Math.round((a.hit / a.total) * 100) : null;
          const color =
            rec === "BUY"
              ? "text-primary"
              : rec === "SELL"
                ? "text-destructive"
                : "text-muted-foreground";
          return (
            <div key={rec} className="glass-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {rec} accuracy
              </div>
              <div className={`font-heading text-2xl font-bold mt-1 ${color}`}>
                {pct == null ? "—" : `${pct}%`}
              </div>
              <div className="text-xs text-muted-foreground">
                {a.hit} / {a.total} predictions tracked
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Search ticker or model…"
            className="w-full pl-9 pr-3 py-2 rounded-md bg-input border border-border text-sm"
          />
        </div>
        <select
          value={tickerFilter}
          onChange={(e) => {
            setTickerFilter(e.target.value);
            setPage(0);
          }}
          className="px-3 py-2 rounded-md bg-input border border-border text-sm"
        >
          <option value="ALL">All tickers</option>
          {uniqueTickers.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={modelFilter}
          onChange={(e) => {
            setModelFilter(e.target.value);
            setPage(0);
          }}
          className="px-3 py-2 rounded-md bg-input border border-border text-sm"
        >
          <option value="ALL">All models</option>
          {uniqueModels.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={recFilter}
          onChange={(e) => {
            setRecFilter(e.target.value);
            setPage(0);
          }}
          className="px-3 py-2 rounded-md bg-input border border-border text-sm"
        >
          <option value="ALL">All recommendations</option>
          <option value="BUY">BUY only</option>
          <option value="SELL">SELL only</option>
          <option value="HOLD">HOLD only</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Ticker</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3 text-right">Predicted</th>
              <th className="px-4 py-3 text-right">Change</th>
              <th className="px-4 py-3 text-center">Rec.</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No forecasts match these filters.{" "}
                  <Link
                    to="/forecast"
                    search={{ ticker: "RELIANCE.NS", model: "Ensemble" }}
                    className="text-primary underline"
                  >
                    Run one →
                  </Link>
                </td>
              </tr>
            ) : (
              paged.map((it) => {
                const cfg = getTickerConfig(it.ticker);
                const pct = Number(it.predicted_change_pct ?? 0);
                const recColor =
                  it.recommendation === "BUY"
                    ? "text-primary"
                    : it.recommendation === "SELL"
                      ? "text-destructive"
                      : "text-muted-foreground";
                return (
                  <tr key={it.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(it.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold font-mono-nums">{it.ticker}</td>
                    <td className="px-4 py-3">{it.model}</td>
                    <td className="px-4 py-3 text-right font-mono-nums">
                      {it.predicted_price != null
                        ? formatPrice(Number(it.predicted_price), cfg?.currency)
                        : "—"}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono-nums font-semibold ${pct >= 0 ? "text-primary" : "text-destructive"}`}
                    >
                      {formatChangePct(pct)}
                    </td>
                    <td className={`px-4 py-3 text-center font-bold ${recColor}`}>
                      {it.recommendation}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to="/forecast"
                          search={{ ticker: it.ticker, model: it.model as any }}
                          className="text-accent hover:text-accent/80"
                          title="Re-run forecast"
                        >
                          <RotateCw className="size-4" />
                        </Link>
                        <button
                          onClick={() => remove(it.id)}
                          className="text-destructive hover:text-destructive/80"
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > PAGE && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <div className="text-muted-foreground">
            Page {page + 1} of {totalPages} · {filtered.length} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-md bg-secondary text-foreground disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-md bg-secondary text-foreground disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
