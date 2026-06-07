import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StockVision AI — India's AI Investing Platform" },
      {
        name: "description",
        content:
          "AI-powered SARIMA + Prophet + LSTM ensemble forecasting for Indian and global markets. Live Yahoo Finance data, portfolio tracking, smart price alerts.",
      },
      { property: "og:title", content: "StockVision AI — India's AI Investing Platform" },
      {
        property: "og:description",
        content: "AI-powered ensemble forecasting for NSE, US markets, and crypto.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="font-heading text-2xl font-bold tracking-wider text-glow-green">
          STOCKVISION<span className="text-accent"> AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-muted-foreground hover:text-foreground transition">
            Sign in
          </Link>
          <Link
            to="/login"
            search={{ redirect: "/dashboard" }}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition animate-cta-pulse"
          >
            Start Free
          </Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-8 py-24 text-center">
        <h1 className="font-heading text-6xl md:text-7xl font-black tracking-wider mb-6 text-gradient-hero">
          STOCKVISION AI
        </h1>
        <p className="font-heading text-2xl md:text-3xl text-accent mb-8 tracking-widest">
          India's AI Investing Platform
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            search={{ redirect: "/dashboard" }}
            className="px-8 py-4 rounded-md bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition animate-cta-pulse"
          >
            Start Free →
          </Link>
          <Link
            to="/dashboard"
            className="px-8 py-4 rounded-md border border-border text-foreground hover:bg-secondary transition"
          >
            Live Demo
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { v: "₹2.4Cr+", l: "Portfolio Tracked" },
          { v: "48,000+", l: "Forecasts Run" },
          { v: "97.4%", l: "Backtest Accuracy" },
          { v: "12+", l: "Global Markets" },
        ].map((s) => (
          <div key={s.l} className="glass-card p-6 text-center">
            <div className="font-heading text-3xl font-bold text-primary text-glow-green font-mono-nums">
              {s.v}
            </div>
            <div className="text-sm text-muted-foreground mt-2">{s.l}</div>
          </div>
        ))}
      </section>

      <footer className="max-w-7xl mx-auto px-8 py-12 text-center text-sm text-muted-foreground">
        <p>
          StockVision AI provides AI-generated analysis for educational purposes only. Not
          investment advice.
        </p>
        <p className="mt-2">© 2026 StockVision AI</p>
      </footer>
    </main>
  );
}
