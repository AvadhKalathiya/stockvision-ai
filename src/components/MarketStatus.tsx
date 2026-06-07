import { Radio } from "lucide-react";

/**
 * NSE: Mon–Fri 09:15–15:30 IST (UTC+5:30)
 * US: Mon–Fri 09:30–16:00 ET (we approximate via UTC 14:30–21:00)
 * Crypto: 24/7
 */
function nseOpen(now = new Date()): boolean {
  const ist = new Date(now.getTime() + (5.5 * 60 - now.getTimezoneOffset()) * 60_000);
  const day = ist.getUTCDay(); // 0=Sun..6=Sat (UTC after offset)
  if (day === 0 || day === 6) return false;
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return mins >= 9 * 60 + 15 && mins <= 15 * 60 + 30;
}

function usOpen(now = new Date()): boolean {
  const day = now.getUTCDay();
  if (day === 0 || day === 6) return false;
  const mins = now.getUTCHours() * 60 + now.getUTCMinutes();
  // Approximate (ignores DST): 14:30–21:00 UTC ~ 9:30–16:00 ET
  return mins >= 14 * 60 + 30 && mins <= 21 * 60;
}

export function MarketStatus() {
  const nse = nseOpen();
  const us = usOpen();
  return (
    <div className="flex flex-wrap gap-2">
      <Pill label="NSE" open={nse} />
      <Pill label="US" open={us} />
      <Pill label="CRYPTO" open={true} />
    </div>
  );
}

function Pill({ label, open }: { label: string; open: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border ${
        open
          ? "bg-primary/10 text-primary border-primary/30"
          : "bg-secondary text-muted-foreground border-border"
      }`}
    >
      <Radio className={`size-3 ${open ? "animate-pulse" : ""}`} />
      {label} {open ? "OPEN" : "CLOSED"}
    </span>
  );
}
