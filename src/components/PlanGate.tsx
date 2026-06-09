import { Link } from "@tanstack/react-router";
import { Lock, Sparkles } from "lucide-react";
import { upgradeLabel, type Plan } from "@/lib/planLimits";

export function PlanGate({
  children,
}: {
  requiredPlan?: Plan;
  title?: string;
  description?: string;
  compact?: boolean;
  children?: React.ReactNode;
}) {
  return <>{children}</>;
}
