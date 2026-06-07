import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Trade {
  id: string;
  date: string;
  ticker: string;
  type: "BUY" | "SELL";
  qty: number;
  price: number;
}

export interface SimulatorState {
  balance: number;
  trades: Trade[];
  holdings: Record<string, { qty: number; avgPrice: number }>;
  buy: (ticker: string, qty: number, price: number) => boolean;
  sell: (ticker: string, qty: number, price: number) => boolean;
  reset: () => void;
}

export const useSimulatorStore = create<SimulatorState>()(
  persist(
    (set, get) => ({
      balance: 1000000, // ₹10,00,000 starting capital
      trades: [],
      holdings: {},
      buy: (ticker, qty, price) => {
        const cost = qty * price;
        const { balance, trades, holdings } = get();
        if (balance < cost) return false;

        const currentHolding = holdings[ticker] || { qty: 0, avgPrice: 0 };
        const newQty = currentHolding.qty + qty;
        const newAvg = (currentHolding.qty * currentHolding.avgPrice + cost) / newQty;

        set({
          balance: balance - cost,
          trades: [
            {
              id: Math.random().toString(36).substring(7),
              date: new Date().toISOString(),
              ticker,
              type: "BUY",
              qty,
              price,
            },
            ...trades,
          ],
          holdings: { ...holdings, [ticker]: { qty: newQty, avgPrice: newAvg } },
        });
        return true;
      },
      sell: (ticker, qty, price) => {
        const { balance, trades, holdings } = get();
        const currentHolding = holdings[ticker];
        if (!currentHolding || currentHolding.qty < qty) return false;

        const revenue = qty * price;
        const newQty = currentHolding.qty - qty;

        const newHoldings = { ...holdings };
        if (newQty === 0) delete newHoldings[ticker];
        else newHoldings[ticker] = { ...currentHolding, qty: newQty };

        set({
          balance: balance + revenue,
          trades: [
            {
              id: Math.random().toString(36).substring(7),
              date: new Date().toISOString(),
              ticker,
              type: "SELL",
              qty,
              price,
            },
            ...trades,
          ],
          holdings: newHoldings,
        });
        return true;
      },
      reset: () => set({ balance: 1000000, trades: [], holdings: {} }),
    }),
    {
      name: "paper-trading-storage",
    },
  ),
);
