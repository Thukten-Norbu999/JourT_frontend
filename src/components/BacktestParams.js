"use client";

export default function BacktestParams({ params, setParams }) {
  function set(k, v) {
    setParams((p) => ({ ...p, [k]: v }));
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4 space-y-3">
      <div className="text-sm text-slate-300">Parameters</div>

      <Field label="Fast EMA">
        <input
          type="number"
          value={params.fast}
          onChange={(e) => set("fast", Number(e.target.value))}
          className="input"
        />
      </Field>

      <Field label="Slow EMA">
        <input
          type="number"
          value={params.slow}
          onChange={(e) => set("slow", Number(e.target.value))}
          className="input"
        />
      </Field>

      <Field label="Risk per trade (%)">
        <input
          type="number"
          step="0.1"
          value={params.risk}
          onChange={(e) => set("risk", Number(e.target.value))}
          className="input"
        />
      </Field>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      {children}
    </div>
  );
}
