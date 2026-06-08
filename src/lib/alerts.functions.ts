import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabase } from "@/integrations/supabase/client";

export interface PriceAlert {
  id: string;
  user_id: string;
  ticker: string;
  condition: "above" | "below" | "percentage";
  target_price: number;
  alert_via: "in-app" | "email";
  is_active: boolean;
  created_at: string;
}

const createAlertSchema = z.object({
  ticker: z.string(),
  condition: z.enum(["above", "below", "percentage"]),
  target_price: z.number(),
  alert_via: z.enum(["in-app", "email"]).default("in-app"),
});

const updateAlertSchema = z.object({
  id: z.string(),
  is_active: z.boolean().optional(),
  target_price: z.number().optional(),
});

export const createAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(createAlertSchema.parse)
  .handler(async ({ data, context }) => {
    const userId = context?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single();

    if (!profile) throw new Error("Profile not found");

    const { data: existingAlerts } = await supabase
      .from("price_alerts")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true);

    const alertLimit = getAlertLimit(profile.plan);
    if (existingAlerts && existingAlerts.length >= alertLimit) {
      throw new Error(`Alert limit (${alertLimit}) reached. Upgrade to Pro for unlimited alerts.`);
    }

    const { data: alert, error } = await supabase
      .from("price_alerts")
      .insert({
        user_id: userId,
        ticker: data.ticker.toUpperCase(),
        condition: data.condition,
        target_price: data.target_price,
        alert_via: data.alert_via,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return alert;
  });

export const getAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  });

export const updateAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(updateAlertSchema.parse)
  .handler(async ({ data, context }) => {
    const userId = context?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const { data: existing } = await supabase
      .from("price_alerts")
      .select("user_id")
      .eq("id", data.id)
      .single();

    if (!existing || existing.user_id !== userId) {
      throw new Error("Alert not found or unauthorized");
    }

    const { data: alert, error } = await supabase
      .from("price_alerts")
      .update({
        ...(data.is_active !== undefined && { is_active: data.is_active }),
        ...(data.target_price !== undefined && { target_price: data.target_price }),
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw error;
    return alert;
  });

export const deleteAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string() }).parse)
  .handler(async ({ data, context }) => {
    const userId = context?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const { data: existing } = await supabase
      .from("price_alerts")
      .select("user_id")
      .eq("id", data.id)
      .single();

    if (!existing || existing.user_id !== userId) {
      throw new Error("Alert not found or unauthorized");
    }

    const { error } = await supabase
      .from("price_alerts")
      .delete()
      .eq("id", data.id);

    if (error) throw error;
    return { success: true };
  });

function getAlertLimit(plan: string): number {
  const limits: Record<string, number> = {
    free: 3,
    student: 25,
    pro: Infinity,
    pro_plus: Infinity,
    enterprise: Infinity,
  };
  return limits[plan] || 3;
}
