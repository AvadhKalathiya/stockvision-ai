/** Tiny inline SVG sparkline. No deps. */
export function Sparkline({
  values,
  width = 100,
  height = 28,
  positive,
  strokeWidth = 1.5,
}: {
  values: number[];
  width?: number;
  height?: number;
  positive?: boolean;
  strokeWidth?: number;
}) {
  if (!values || values.length < 2) {
    return <div style={{ width, height }} className="bg-secondary/30 rounded" />;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const points = values
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(" ");
  const up = positive ?? values[values.length - 1] >= values[0];
  const stroke = up ? "oklch(0.87 0.20 165)" : "oklch(0.65 0.22 25)";
  const fill = up ? "oklch(0.87 0.20 165 / 0.15)" : "oklch(0.65 0.22 25 / 0.15)";
  const area = `0,${height} ${points} ${width},${height}`;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <polygon points={area} fill={fill} />
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
