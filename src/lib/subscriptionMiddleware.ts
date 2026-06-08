import { getLimits, normalizePlan, type Plan } from "./planLimits";
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionCheck {
  allowed: boolean;
  reason?: string;
  currentPlan: Plan;
  requiredPlan?: Plan;
}

export async function checkSubscription(
  userId: string,
  feature: keyof ReturnType<typeof getLimits>,
): Promise<SubscriptionCheck> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return { allowed: false, reason: "Profile not found", currentPlan: "free" };
  }

  const plan = normalizePlan(profile.plan);
  const limits = getLimits(plan);
  const featureValue = limits[feature];

  if (typeof featureValue === "boolean") {
    if (!featureValue) {
      const requiredPlan = findRequiredPlan(feature);
      return {
        allowed: false,
        reason: `This feature requires ${requiredPlan} plan or higher`,
        currentPlan: plan,
        requiredPlan,
      };
    }
    return { allowed: true, currentPlan: plan };
  }

  if (typeof featureValue === "number") {
    if (featureValue === 0) {
      const requiredPlan = findRequiredPlan(feature);
      return {
        allowed: false,
        reason: `This feature requires ${requiredPlan} plan or higher`,
        currentPlan: plan,
        requiredPlan,
      };
    }
    return { allowed: true, currentPlan: plan };
  }

  return { allowed: true, currentPlan: plan };
}

export async function checkDailyLimit(
  userId: string,
  feature: "forecastsPerDay" | "chatMessagesPerDay",
): Promise<SubscriptionCheck> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("plan, forecasts_today, chat_messages_today")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return { allowed: false, reason: "Profile not found", currentPlan: "free" };
  }

  const plan = normalizePlan(profile.plan);
  const limits = getLimits(plan);
  const limit = limits[feature];
  const currentUsage = feature === "forecastsPerDay" ? profile.forecasts_today : profile.chat_messages_today;

  if (limit === Infinity) {
    return { allowed: true, currentPlan: plan };
  }

  if (currentUsage >= limit) {
    return {
      allowed: false,
      reason: `Daily limit (${limit}) reached. Upgrade to Pro for unlimited access.`,
      currentPlan: plan,
      requiredPlan: "pro",
    };
  }

  return { allowed: true, currentPlan: plan };
}

export async function incrementUsage(
  userId: string,
  feature: "forecasts_today" | "chat_messages_today",
): Promise<void> {
  const { data: current } = await supabase
    .from("profiles")
    .select(feature)
    .eq("id", userId)
    .single();

  const currentValue = (current as Record<string, unknown>)?.[feature] as number || 0;
  
  const updateData: Record<string, number> = {};
  updateData[feature] = currentValue + 1;
  
  await supabase
    .from("profiles")
    .update(updateData as any)
    .eq("id", userId);
}

function findRequiredPlan(feature: keyof ReturnType<typeof getLimits>): Plan {
  const planOrder: Plan[] = ["free", "student", "pro", "pro_plus", "enterprise"];
  for (const plan of planOrder) {
    const limits = getLimits(plan);
    const value = limits[feature];
    if (value === true || (typeof value === "number" && value > 0)) {
      return plan;
    }
  }
  return "pro";
}

export async function enforceSubscription(
  userId: string,
  feature: keyof ReturnType<typeof getLimits>,
): Promise<void> {
  const check = await checkSubscription(userId, feature);
  if (!check.allowed) {
    throw new Error(check.reason || "Upgrade required");
  }
}

export async function enforceDailyLimit(
  userId: string,
  feature: "forecastsPerDay" | "chatMessagesPerDay",
): Promise<void> {
  const check = await checkDailyLimit(userId, feature);
  if (!check.allowed) {
    throw new Error(check.reason || "Daily limit reached");
  }
}
