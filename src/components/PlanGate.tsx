import { Link } from "@tanstack/react-router";
import { Lock, Sparkles } from "lucide-react";
import { upgradeLabel, type Plan } from "@/lib/planLimits";

export function PlanGate({
  requiredPlan,
  title,
  description,
  compact,
}: {
  requiredPlan: Plan;
  title: string;
  description?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-md px-3 py-2">
        <Lock className="size-3.5 shrink-0" />
        <span>
          {title} — <Link to="/settings" className="text-primary hover:underline">{upgradeLabel(requiredPlan)}+</Link>
        </span>
      </div>
    );
  }
  return (
    <div className="glass-card p-6 sm:p-8 text-center border border-primary/20">
      <Lock className="size-10 mx-auto text-primary mb-4 opacity-70" />
      <h2 className="font-heading text-xl font-bold mb-2">{title}</h2>
      {description ? <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">{description}</p> : null}
      <Link
        to="/settings"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:opacity-90"
      >
        <Sparkles className="size-4" /> Upgrade to {upgradeLabel(requiredPlan)}
      </Link>
    </div>
  );
}
