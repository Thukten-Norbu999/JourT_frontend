"use client";

export default function EquityCurve({ data }) {
  if (!data || data.length === 0) return null;

  const values = data.map((d) => d.equity);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 100 - ((v - min) / (max - min || 1)) * 100;
    return `${x},${y}`;
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
      <div className="text-sm text-slate-300 mb-3">Equity Curve</div>

      <svg viewBox="0 0 100 100" className="w-full h-48">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-emerald-400"
          points={points.join(" ")}
        />
      </svg>

      <div className="flex justify-between text-xs text-slate-500 mt-2">
        <span>{data[0].date}</span>
        <span>{data[data.length - 1].date}</span>
      </div>
    </div>
  );
}
