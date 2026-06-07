import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Rocket, TrendingUp, CheckCircle2, RefreshCw, Calendar } from "lucide-react";
import { getIpoCalendar } from "@/lib/ipoFutures.functions";
import { PageShell } from "@/components/PageShell";
import { QueryError, QueryLoading, EmptyState } from "@/components/QueryState";
import { useAuthStore } from "@/stores/authStore";
import { getLimits } from "@/lib/planLimits";
import { PlanGate } from "@/components/PlanGate";

export const Route = createFileRoute("/_authenticated/ipo")({ component: IPOPage });

type Filter = "all" | "upcoming" | "open" | "closed" | "listed";

function IPOPage() {
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);
  const ipoFn = useServerFn(getIpoCalendar);
  const [filter, setFilter] = useState<Filter>("all");

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["ipo-calendar-live"],
    queryFn: () => ipoFn({ data: { market: "INDIA" } }),
    staleTime: 5 * 60_000,
    retry: 2,
  });

  const ipos = (data ?? []).filter((ipo) => filter === "all" || ipo.status === filter);
  const today = new Date().toISOString().split("T")[0];
  const listingToday = (data ?? []).filter((i) => i.listingDate?.startsWith(today));

  return (
    <PageShell
      title="IPO Intelligence"
      subtitle="Live NSE & BSE IPO calendar — upcoming, open, closed & listing analysis."
      actions={
        <button onClick={() => refetch()} disabled={isFetching} className="px-3 py-1.5 rounded-md bg-secondary text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      }
    >
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "upcoming", "open", "closed", "listed"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold capitalize transition ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {listingToday.length > 0 && (
        <div className="glass-card p-4 mb-4 border-l-4 border-l-primary flex items-center gap-3">
          <Calendar className="size-5 text-primary shrink-0" />
          <div>
            <div className="font-bold text-sm">Listing Today</div>
            <div className="text-sm text-muted-foreground">{listingToday.map((i) => i.name).join(", ")}</div>
          </div>
        </div>
      )}

      {isError ? (
        <QueryError message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <QueryLoading label="Fetching NSE/BSE IPO data…" />
      ) : ipos.length === 0 ? (
        <EmptyState title="No IPO data available" description="NSE/BSE feeds may be temporarily unavailable. Try refreshing." action={<button onClick={() => refetch()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold">Retry</button>} />
      ) : (
        <div className="glass-card page-table-wrap">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-secondary/50">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Exchange</th>
                <th className="px-4 py-3 text-right">Price Band</th>
                <th className="px-4 py-3 text-right">Issue Size</th>
                {limits.canPremiumIPO ? <th className="px-4 py-3 text-right">Subscription</th> : null}
                <th className="px-4 py-3">Dates</th>
              </tr>
            </thead>
            <tbody>
              {ipos.map((ipo, i) => (
                <tr key={`${ipo.name}-${i}`} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{ipo.name}</div>
                    {ipo.symbol ? <div className="text-xs text-muted-foreground font-mono-nums">{ipo.symbol}</div> : null}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={ipo.status} /></td>
                  <td className="px-4 py-3 text-xs">{ipo.exchange ?? "NSE/BSE"}</td>
                  <td className="px-4 py-3 text-right font-mono-nums">{ipo.priceBand ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-xs">{ipo.issueSize ?? "—"}</td>
                  {limits.canPremiumIPO ? (
                    <td className="px-4 py-3 text-right font-mono-nums">{ipo.subscription ?? "—"}</td>
                  ) : null}
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {ipo.openDate && ipo.closeDate ? `${ipo.openDate} → ${ipo.closeDate}` : ipo.listingDate ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <Stat icon={Rocket} label="Upcoming" value={(data ?? []).filter((i) => i.status === "upcoming").length} />
        <Stat icon={TrendingUp} label="Open" value={(data ?? []).filter((i) => i.status === "open").length} />
        <Stat icon={CheckCircle2} label="Listed" value={(data ?? []).filter((i) => i.status === "listed").length} />
        <Stat icon={Calendar} label="Today" value={listingToday.length} />
      </div>

      {limits.canPremiumIPO ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h3 className="font-heading font-bold mb-3">GMP Dashboard</h3>
            <div className="space-y-2 text-sm">
              {(data ?? [])
                .filter((i) => i.gmp != null)
                .slice(0, 5)
                .map((i) => (
                  <div key={i.name} className="flex justify-between border-b border-border/50 pb-2">
                    <span className="font-semibold truncate pr-2">{i.name}</span>
                    <span className="font-mono-nums text-primary shrink-0">₹{i.gmp}</span>
                  </div>
                ))}
              {(data ?? []).filter((i) => i.gmp != null).length === 0 && (
                <p className="text-muted-foreground text-xs">No GMP data available from exchanges.</p>
              )}
            </div>
          </div>
          <div className="glass-card p-5">
            <h3 className="font-heading font-bold mb-3">Listing Gain Analysis</h3>
            <p className="text-sm text-muted-foreground">
              {(data ?? []).filter((i) => i.status === "listed").length} recent listings tracked.
              Monitor subscription oversubscription for listing-day pop signals.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <PlanGate
            compact
            requiredPlan="pro_plus"
            title="Premium IPO Intelligence (GMP, Subscription & Listing Analysis)"
          />
        </div>
      )}
    </PageShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="metric-card p-4 text-center">
      <Icon className="size-5 mx-auto text-primary mb-2" />
      <div className="text-2xl font-bold font-mono-nums">{value}</div>
      <div className="text-xs text-muted-foreground uppercase">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "open" ? "bg-primary/20 text-primary"
    : status === "upcoming" ? "bg-accent/20 text-accent"
    : status === "listed" ? "bg-primary/10 text-primary"
    : "bg-muted text-muted-foreground";
  return <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${styles}`}>{status}</span>;
}
