# StockVision AI

StockVision AI is a comprehensive, modern web application designed for stock market analysis, portfolio management, forecasting, and real-time alerts. Built with a robust cutting-edge tech stack, the platform empowers users with actionable financial insights and an intuitive, dynamic user interface.

## 🚀 Features

The application is structured into several powerful modules under an authenticated experience:

- **Dashboard**: A centralized hub providing an overview of market trends, portfolio performance, and quick metrics.
- **Portfolio Management**: Track your investments, analyze allocations, and measure historical performance.
- **Watchlist**: Keep an eye on your favorite stocks with real-time updates and sparkline visualizations.
- **Market Forecasts**: Advanced forecasting tools to predict potential market movements using data-driven insights.
- **IPO & Futures**: Stay ahead of the market with dedicated tracking for upcoming Initial Public Offerings and futures contracts.
- **News Feed**: Integrated news module fetching real-time financial news and market updates.
- **Real-time Alerts**: Custom alert configurations to notify you when stocks hit specific price points or meet certain criteria.
- **AI Chat Assistant**: Built-in intelligent chat interface for quick financial queries, stock analysis, and platform guidance.
- **History & Settings**: Detailed transaction history and comprehensive user preferences management.

## 💻 Tech Stack

### Frontend Core

- **React 19**: Leveraging the latest features of React for optimal rendering and component architecture.
- **TypeScript**: Strict type-checking for robust and maintainable code.
- **TanStack Router & Start**: File-based routing and SSR capabilities for seamless navigation and performance.
- **Vite**: Ultra-fast build tool and development server.

### Styling & UI Components

- **Tailwind CSS v4**: Utility-first CSS framework for rapid, responsive UI development.
- **Radix UI**: Unstyled, accessible component primitives.
- **Framer Motion**: Fluid, declarative animations and gesture controls for a premium feel.
- **Lucide React**: Beautiful, consistent icon set.
- **Recharts**: Composable charting library for rendering interactive stock graphs and portfolio metrics.

### State Management & Data Fetching

- **Zustand**: Lightweight, fast, and scalable state management.
- **TanStack Query (React Query)**: Powerful asynchronous state management for server data fetching, caching, and synchronization.

### Backend & Authentication

- **Supabase**: Open-source Firebase alternative powering the database and backend services.
- **Lovable Cloud Auth**: Seamless and secure user authentication flows.

### Utilities

- **React Hook Form & Zod**: Performant, flexible, and extensible forms with strict schema validation.
- **Date-fns**: Modern JavaScript date utility library.

## 📁 Project Structure

```text
STOCKVISION AI/
├── src/
│   ├── components/       # Reusable UI components (AppShell, GlobalSearch, Sparklines, etc.)
│   │   └── ui/           # Primitive UI components (buttons, dialogs, inputs)
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Third-party service setups (Supabase, Auth)
│   ├── lib/              # Utility functions and shared helpers
│   ├── routes/           # TanStack file-based routing directory
│   │   ├── __root.tsx    # Root layout
│   │   ├── index.tsx     # Public landing page
│   │   ├── login.tsx     # Authentication page
│   │   └── _authenticated/ # Protected application routes
│   │       ├── dashboard.tsx
│   │       ├── portfolio.tsx
│   │       ├── watchlist.tsx
│   │       ├── forecast.tsx
│   │       ├── ipo-futures.tsx
│   │       ├── news.tsx
│   │       ├── alerts.tsx
│   │       ├── chat.tsx
│   │       ├── history.tsx
│   │       └── settings.tsx
│   ├── stores/           # Zustand state stores
│   ├── styles.css        # Global Tailwind and custom CSS styles
│   ├── server.ts         # Server entry point
│   └── start.ts          # Client entry point
├── public/               # Static assets
├── supabase/             # Supabase configuration and migrations
├── package.json          # Project dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── eslint.config.js      # ESLint rules
```

## 🛠️ Setup & Installation

Follow these steps to get the project running locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher) or [Bun](https://bun.sh/) installed.
- Git

### Installation

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone <repository-url>
   cd "STOCKVISION AI"
   ```

2. **Install Dependencies**:
   You can use npm, yarn, pnpm, or bun.

   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Variables**:
   Ensure you have a `.env` file in the root of your project containing the necessary keys for Supabase and Authentication.

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server**:

   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Access the App**:
   Open your browser and navigate to the URL provided in the terminal (usually `http://localhost:5173`).

## 🧹 Linting & Formatting

To ensure code quality and consistency:

- **Linting**: Run `npm run lint` to execute ESLint.
- **Formatting**: Run `npm run format` to automatically format files using Prettier.

## 🏗️ Building for Production

To create an optimized production build:

```bash
npm run build
```

This will generate the built assets ready for deployment. You can test the production build locally using:

```bash
npm run preview
```

---

_Built with ❤️ for sophisticated market analysis._
