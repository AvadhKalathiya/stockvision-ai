import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Activity,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/insights")({
  component: InsightsPage,
});

const INSIGHTS = [
  {
    id: 1,
    type: "Bullish",
    title: "IT Sector Breakout",
    confidence: 92,
    data: "TCS and INFY breaking 52-week highs on volume expansion.",
    action: "Accumulate IT large caps.",
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary/20",
  },
  {
    id: 2,
    type: "Bearish",
    title: "Auto Sector Weakness",
    confidence: 85,
    data: "TATAMOTORS showing divergence with RSI. Volume dropping on rallies.",
    action: "Reduce exposure to Auto.",
    icon: TrendingDown,
    color: "text-destructive",
    bg: "bg-destructive/20",
  },
  {
    id: 3,
    type: "Warning",
    title: "High NIFTY Valuation",
    confidence: 78,
    data: "NIFTY 50 P/E ratio is at 24.5, historically signaling a consolidation phase.",
    action: "Hedge portfolio with Index Puts.",
    icon: ShieldAlert,
    color: "text-yellow-500",
    bg: "bg-yellow-500/20",
  },
  {
    id: 4,
    type: "Opportunity",
    title: "Dividend Yield Play",
    confidence: 88,
    data: "ITC and ONGC offering >4% yield with stable cash flows.",
    action: "Add for defensive yield.",
    icon: Activity,
    color: "text-accent",
    bg: "bg-accent/20",
  },
];

function InsightsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="font-heading text-3xl font-bold text-glow-green">AI Insights Engine</h1>
          <p className="text-muted-foreground mt-1">
            Algorithmic market intelligence and actionable trading signals.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm border border-primary/20">
          <Sparkles className="size-4" /> Live Market Processing
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {INSIGHTS.map((insight) => (
          <div key={insight.id} className="glass-card p-6 relative overflow-hidden group">
            <div
              className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 rounded-full transition-transform group-hover:scale-150 ${insight.bg}`}
            ></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${insight.bg} ${insight.color}`}>
                    <insight.icon className="size-6" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-0.5">
                      {insight.type} Signal
                    </div>
                    <div className="font-heading text-lg font-bold">{insight.title}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono-nums font-bold text-xl">{insight.confidence}%</div>
                  <div className="text-[10px] uppercase text-muted-foreground">Confidence</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase mb-1">
                    Supporting Data
                  </div>
                  <p className="text-sm font-medium">{insight.data}</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground font-semibold uppercase mb-1 flex items-center gap-1">
                    Suggested Action <ArrowRight className="size-3" />
                  </div>
                  <div className="font-bold text-sm">{insight.action}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-8 text-center bg-gradient-to-br from-secondary/50 to-background">
        <Sparkles className="size-12 mx-auto text-accent mb-4 opacity-80" />
        <h2 className="font-heading text-2xl font-bold mb-2">
          Want personalized portfolio insights?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Connect your holdings and let our AI engine scan for concentration risks and rebalancing
          opportunities.
        </p>
        <Link
          to="/portfolio"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition shadow-[0_0_20px_rgba(16,185,129,0.3)] inline-flex"
        >
          Analyze My Portfolio Now
        </Link>
      </div>
    </div>
  );
}
