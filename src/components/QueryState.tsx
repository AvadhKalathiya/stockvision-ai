import { AlertTriangle, Loader2, RefreshCw, WifiOff } from "lucide-react";

export function QueryLoading({ label = "Loading market data…" }: { label?: string }) {
  return (
    <div className="glass-card p-8 flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function QueryError({
  message,
  onRetry,
  label = "Failed to load data",
}: {
  message?: string;
  onRetry?: () => void;
  label?: string;
}) {
  return (
    <div className="glass-card p-6 border border-destructive/30 bg-destructive/5">
      <div className="flex items-start gap-3">
        <WifiOff className="size-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-destructive">{label}</p>
          {message ? (
            <p className="text-xs text-muted-foreground mt-1 break-words">{message}</p>
          ) : null}
          {onRetry ? (
            <button
              onClick={onRetry}
              className="mt-3 px-3 py-1.5 rounded-md bg-secondary text-xs font-semibold hover:bg-secondary/70 transition flex items-center gap-1.5"
            >
              <RefreshCw className="size-3.5" /> Retry
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass-card p-8 text-center">
      <AlertTriangle className="size-8 mx-auto text-muted-foreground mb-3 opacity-60" />
      <p className="font-semibold">{title}</p>
      {description ? <p className="text-sm text-muted-foreground mt-1">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
