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
    <main className="min-h-screen overflow-x-hidden">
      <nav className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-6 max-w-7xl mx-auto">
        <div className="font-heading text-xl sm:text-2xl font-bold tracking-wider text-glow-green">
          STOCKVISION<span className="text-accent"> AI</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/login" search={{ redirect: "/dashboard" }} className="text-muted-foreground hover:text-foreground transition text-sm sm:text-base">
            Sign in
          </Link>
          <Link
            to="/login"
            search={{ redirect: "/dashboard" }}
            className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition animate-cta-pulse min-h-11"
          >
            Start Free
          </Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-24 text-center">
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-wider mb-4 sm:mb-6 text-gradient-hero break-normal">
          STOCKVISION AI
        </h1>
        <p className="font-heading text-lg sm:text-xl md:text-2xl lg:text-3xl text-accent mb-6 sm:mb-8 tracking-widest">
          India's AI Investing Platform
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            to="/login"
            search={{ redirect: "/dashboard" }}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-md bg-primary text-primary-foreground font-bold text-base sm:text-lg hover:opacity-90 transition animate-cta-pulse min-h-11"
          >
            Start Free →
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-md border border-border text-foreground hover:bg-secondary transition min-h-11"
          >
            Live Demo
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { v: "₹2.4Cr+", l: "Portfolio Tracked" },
          { v: "48,000+", l: "Forecasts Run" },
          { v: "97.4%", l: "Backtest Accuracy" },
          { v: "12+", l: "Global Markets" },
        ].map((s) => (
          <div key={s.l} className="glass-card p-5 sm:p-6 text-center">
            <div className="font-heading text-2xl sm:text-3xl font-bold text-primary text-glow-green font-mono-nums">
              {s.v}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">{s.l}</div>
          </div>
        ))}
      </section>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 text-center text-xs sm:text-sm text-muted-foreground">
        <p className="mb-2 sm:mb-3">
          StockVision AI provides AI-generated analysis for educational purposes only. Not
          investment advice.
        </p>
        <p>© 2026 StockVision AI</p>
      </footer>
    </main>
  );
}
