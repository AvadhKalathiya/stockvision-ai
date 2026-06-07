import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";

export interface PortfolioHolding {
  id: string;
  ticker: string;
  qty: number;
  buy_price: number;
  buy_date: string;
  company_name: string | null;
}

export function usePortfolioData() {
  const user = useAuthStore((s) => s.user);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setHoldings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("portfolio")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (err) {
      setError(err.message);
      setHoldings([]);
    } else {
      setHoldings((data ?? []) as unknown as PortfolioHolding[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return { holdings, loading, error, reload: load };
}
