export default function PnlWeekdays({ data }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
      <div className="text-sm text-slate-300 mb-3">Day of Week</div>

      {Object.entries(data).map(([day, pnl]) => (
        <div key={day} className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">{day}</span>
          <span className={pnl >= 0 ? "text-emerald-300" : "text-rose-300"}>
            {pnl >= 0 ? "+" : ""}{pnl.toFixed(0)}
          </span>
        </div>
      ))}
    </div>
  );
}
