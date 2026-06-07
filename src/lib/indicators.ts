/** Lightweight technical indicators (RSI, MACD) computed from close-only series */

export function computeRSI(closes: number[], period = 14): number[] {
  const out: number[] = new Array(closes.length).fill(NaN);
  if (closes.length < period + 1) return out;
  let gains = 0,
    losses = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) gains += d;
    else losses -= d;
  }
  let avgG = gains / period,
    avgL = losses / period;
  out[period] = avgL === 0 ? 100 : 100 - 100 / (1 + avgG / avgL);
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    const g = d > 0 ? d : 0;
    const l = d < 0 ? -d : 0;
    avgG = (avgG * (period - 1) + g) / period;
    avgL = (avgL * (period - 1) + l) / period;
    out[i] = avgL === 0 ? 100 : 100 - 100 / (1 + avgG / avgL);
  }
  return out;
}

function ema(values: number[], period: number): number[] {
  const out: number[] = new Array(values.length).fill(NaN);
  if (values.length < period) return out;
  const k = 2 / (period + 1);
  let prev = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  out[period - 1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

export function computeMACD(closes: number[], fast = 12, slow = 26, signal = 9) {
  const emaFast = ema(closes, fast);
  const emaSlow = ema(closes, slow);
  const macd = closes.map((_, i) =>
    Number.isFinite(emaFast[i]) && Number.isFinite(emaSlow[i]) ? emaFast[i] - emaSlow[i] : NaN,
  );
  const macdClean = macd.filter((x) => Number.isFinite(x));
  const sig = ema(macdClean, signal);
  // align signal back to original length
  const signalLine: number[] = new Array(closes.length).fill(NaN);
  let j = 0;
  for (let i = 0; i < closes.length; i++) {
    if (Number.isFinite(macd[i])) {
      signalLine[i] = sig[j++] ?? NaN;
    }
  }
  const hist = macd.map((m, i) =>
    Number.isFinite(m) && Number.isFinite(signalLine[i]) ? m - signalLine[i] : NaN,
  );
  return { macd, signal: signalLine, histogram: hist };
}

export function lastFinite(arr: number[]): number {
  for (let i = arr.length - 1; i >= 0; i--) if (Number.isFinite(arr[i])) return arr[i];
  return NaN;
}

export function rsiVerdict(rsi: number): {
  label: string;
  color: "primary" | "destructive" | "muted-foreground";
} {
  if (!Number.isFinite(rsi)) return { label: "N/A", color: "muted-foreground" };
  if (rsi >= 70) return { label: "Overbought", color: "destructive" };
  if (rsi <= 30) return { label: "Oversold", color: "primary" };
  return { label: "Neutral", color: "muted-foreground" };
}

export function macdVerdict(hist: number): {
  label: string;
  color: "primary" | "destructive" | "muted-foreground";
} {
  if (!Number.isFinite(hist)) return { label: "N/A", color: "muted-foreground" };
  if (hist > 0) return { label: "Bullish", color: "primary" };
  if (hist < 0) return { label: "Bearish", color: "destructive" };
  return { label: "Neutral", color: "muted-foreground" };
}
