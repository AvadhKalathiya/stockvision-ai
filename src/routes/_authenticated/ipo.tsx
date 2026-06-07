import { createFileRoute } from "@tanstack/react-router";
import { Rocket, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/tickerConfig";

export const Route = createFileRoute("/_authenticated/ipo")({
  component: IPOPage,
});

const IPO_DATA = [
  {
    id: 1,
    name: "Ola Electric Mobility",
    status: "Upcoming",
    issuePrice: 76,
    gmp: 12,
    gmpPct: 15.7,
    openDate: "2026-08-02",
    closeDate: "2026-08-06",
    subStatus: "0.00x",
  },
  {
    id: 2,
    name: "FirstCry (Brainbees)",
    status: "Open",
    issuePrice: 465,
    gmp: 40,
    gmpPct: 8.6,
    openDate: "2026-08-05",
    closeDate: "2026-08-07",
    subStatus: "2.34x",
  },
  {
    id: 3,
    name: "Unicommerce eSolutions",
    status: "Closed",
    issuePrice: 108,
    gmp: 45,
    gmpPct: 41.6,
    openDate: "2026-08-06",
    closeDate: "2026-08-08",
    subStatus: "168.3x",
  },
  {
    id: 4,
    name: "Ather Energy",
    status: "Upcoming",
    issuePrice: 220,
    gmp: 65,
    gmpPct: 29.5,
    openDate: "2026-09-12",
    closeDate: "2026-09-15",
    subStatus: "0.00x",
  },
];

function IPOPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="font-heading text-3xl font-bold text-glow-green">IPO Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            Track upcoming Indian IPOs, Grey Market Premium (GMP), and subscription status.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full font-bold text-sm">
          <Rocket className="size-4" /> NSE/BSE Mainboard
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 border-l-4 border-l-blue-500">
          <div className="text-xs uppercase text-muted-foreground font-bold mb-1">Upcoming</div>
          <div className="text-3xl font-bold font-mono-nums">2</div>
        </div>
        <div className="glass-card p-5 border-l-4 border-l-yellow-500">
          <div className="text-xs uppercase text-muted-foreground font-bold mb-1">Open</div>
          <div className="text-3xl font-bold font-mono-nums">1</div>
        </div>
        <div className="glass-card p-5 border-l-4 border-l-green-500">
          <div className="text-xs uppercase text-muted-foreground font-bold mb-1">
            High GMP (&gt;20%)
          </div>
          <div className="text-3xl font-bold font-mono-nums">2</div>
        </div>
        <div className="glass-card p-5 border-l-4 border-l-purple-500">
          <div className="text-xs uppercase text-muted-foreground font-bold mb-1">
            Avg Listing Gain
          </div>
          <div className="text-3xl font-bold font-mono-nums">+18.4%</div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-muted-foreground text-left text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4">Company Name</th>
              <th className="p-4">Status</th>
              <th className="p-4">Dates</th>
              <th className="p-4 text-right">Issue Price</th>
              <th className="p-4 text-right">GMP (Expected)</th>
              <th className="p-4 text-right">Subscription</th>
            </tr>
          </thead>
          <tbody>
            {IPO_DATA.map((ipo) => (
              <tr key={ipo.id} className="border-t border-border hover:bg-secondary/30 transition">
                <td className="p-4 font-bold">{ipo.name}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      ipo.status === "Open"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : ipo.status === "Closed"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-blue-500/20 text-blue-500"
                    }`}
                  >
                    {ipo.status}
                  </span>
                </td>
                <td className="p-4 text-xs text-muted-foreground">
                  {ipo.openDate} to {ipo.closeDate}
                </td>
                <td className="p-4 text-right font-mono-nums font-semibold">
                  {formatPrice(ipo.issuePrice)}
                </td>
                <td className="p-4 text-right">
                  <div className="font-mono-nums font-bold text-primary">
                    +{formatPrice(ipo.gmp)}
                  </div>
                  <div className="text-xs text-primary/80">+{ipo.gmpPct}% Est. Gain</div>
                </td>
                <td className="p-4 text-right font-mono-nums font-bold">{ipo.subStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
