import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Briefcase, FileText, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/events")({
  component: EventsPage,
});

const ECONOMIC_EVENTS = [
  {
    id: 1,
    date: "2026-06-10",
    time: "10:00 AM",
    event: "RBI Monetary Policy Committee (MPC) Decision",
    impact: "High",
    actual: "-",
    forecast: "6.50%",
    prev: "6.50%",
  },
  {
    id: 2,
    date: "2026-06-12",
    time: "05:30 PM",
    event: "India CPI Inflation (YoY)",
    impact: "High",
    actual: "-",
    forecast: "4.8%",
    prev: "4.83%",
  },
  {
    id: 3,
    date: "2026-06-12",
    time: "05:30 PM",
    event: "India Industrial Production (IIP)",
    impact: "Medium",
    actual: "-",
    forecast: "4.5%",
    prev: "4.9%",
  },
  {
    id: 4,
    date: "2026-06-30",
    time: "05:30 PM",
    event: "India GDP Growth Rate (QoQ)",
    impact: "High",
    actual: "-",
    forecast: "6.1%",
    prev: "8.4%",
  },
];

const CORP_ACTIONS = [
  {
    id: 1,
    ticker: "TCS.NS",
    type: "Dividend",
    detail: "₹28.00 per share",
    exDate: "2026-06-15",
    recordDate: "2026-06-16",
  },
  {
    id: 2,
    ticker: "RELIANCE.NS",
    type: "Bonus",
    detail: "1:1 Ratio",
    exDate: "2026-06-22",
    recordDate: "2026-06-23",
  },
  {
    id: 3,
    ticker: "HDFCBANK.NS",
    type: "Dividend",
    detail: "₹19.50 per share",
    exDate: "2026-06-28",
    recordDate: "2026-06-29",
  },
  {
    id: 4,
    ticker: "ITC.NS",
    type: "Stock Split",
    detail: "Old FV: ₹10, New FV: ₹1",
    exDate: "2026-07-05",
    recordDate: "2026-07-06",
  },
];

function EventsPage() {
  const [tab, setTab] = useState<"Economy" | "Corporate">("Economy");

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-glow-green">Events &amp; Actions</h1>
        <p className="text-muted-foreground mt-1">
          Indian Economic Calendar &amp; Corporate Actions Center.
        </p>
      </header>

      <div className="flex gap-4 border-b border-border mb-6">
        <button
          onClick={() => setTab("Economy")}
          className={`pb-3 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 ${tab === "Economy" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Economic Calendar
        </button>
        <button
          onClick={() => setTab("Corporate")}
          className={`pb-3 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 ${tab === "Corporate" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Corporate Actions
        </button>
      </div>

      {tab === "Economy" ? (
        <div className="glass-card page-table-wrap overflow-hidden animate-in fade-in">
          <div className="p-4 border-b border-border bg-secondary/30 flex justify-between items-center">
            <h2 className="font-heading font-bold flex items-center gap-2">
              <Calendar className="size-5 text-primary" /> Key Macro Events
            </h2>
            <div className="text-xs text-muted-foreground">Times in IST</div>
          </div>
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-secondary/20 text-muted-foreground text-left uppercase text-xs">
              <tr>
                <th className="p-4">Date/Time</th>
                <th className="p-4">Event</th>
                <th className="p-4">Impact</th>
                <th className="p-4 text-right">Forecast</th>
                <th className="p-4 text-right">Previous</th>
              </tr>
            </thead>
            <tbody>
              {ECONOMIC_EVENTS.map((ev) => (
                <tr key={ev.id} className="border-t border-border hover:bg-secondary/30 transition">
                  <td className="p-4">
                    <div className="font-bold">
                      {new Date(ev.date).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">{ev.time}</div>
                  </td>
                  <td className="p-4 font-semibold">{ev.event}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${ev.impact === "High" ? "bg-destructive/20 text-destructive" : "bg-yellow-500/20 text-yellow-500"}`}
                    >
                      {ev.impact}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono-nums font-bold">{ev.forecast}</td>
                  <td className="p-4 text-right font-mono-nums text-muted-foreground">{ev.prev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card page-table-wrap overflow-hidden animate-in fade-in">
          <div className="p-4 border-b border-border bg-secondary/30">
            <h2 className="font-heading font-bold flex items-center gap-2">
              <Briefcase className="size-5 text-accent" /> Upcoming Corporate Actions
            </h2>
          </div>
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-secondary/20 text-muted-foreground text-left uppercase text-xs">
              <tr>
                <th className="p-4">Ticker</th>
                <th className="p-4">Type</th>
                <th className="p-4">Details</th>
                <th className="p-4 text-right">Ex-Date</th>
                <th className="p-4 text-right">Record Date</th>
              </tr>
            </thead>
            <tbody>
              {CORP_ACTIONS.map((ca) => (
                <tr key={ca.id} className="border-t border-border hover:bg-secondary/30 transition">
                  <td className="p-4 font-bold">{ca.ticker}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${ca.type === "Dividend" ? "bg-green-500/20 text-green-500" : ca.type === "Bonus" ? "bg-purple-500/20 text-purple-500" : "bg-blue-500/20 text-blue-500"}`}
                    >
                      {ca.type}
                    </span>
                  </td>
                  <td className="p-4 font-semibold">{ca.detail}</td>
                  <td className="p-4 text-right font-mono-nums">
                    {new Date(ca.exDate).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="p-4 text-right font-mono-nums">
                    {new Date(ca.recordDate).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
