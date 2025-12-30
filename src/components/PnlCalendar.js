"use client";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function PnlCalendar({ month, days, onSelectDay }) {
  const [yStr, mStr] = (month || "").split("-");
  const y = Number(yStr);
  const m = Number(mStr) - 1; // 0-based month

  const byDate = new Map(days.map((d) => [d.date, d]));

  const first = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  // Monday-first offset (0..6)
  const jsDay = first.getDay(); // 0 Sun..6 Sat
  const offset = (jsDay + 6) % 7;

  // ✅ dynamic weeks (no excess rows)
  const totalCells = offset + daysInMonth;
  const weeks = Math.ceil(totalCells / 7);
  const cellCount = weeks * 7;

  const cells = Array.from({ length: cellCount }, (_, i) => {
    const dayNum = i - offset + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;

    const date = `${yStr}-${mStr}-${String(dayNum).padStart(2, "0")}`;
    return { dayNum, date, data: byDate.get(date) || { pnl: 0, trades: 0 } };
  });

  const maxAbs = Math.max(...days.map((d) => Math.abs(d.pnl)), 1);

  function cellBg(pnl) {
    if (!pnl) return "rgba(15,23,42,0.35)";
    const a = Math.min(Math.abs(pnl) / maxAbs, 1);
    return pnl >= 0
      ? `rgba(16,185,129,${0.10 + a * 0.40})`
      : `rgba(244,63,94,${0.10 + a * 0.40})`;
  }

  function cellBorder(pnl) {
    if (!pnl) return "rgba(148,163,184,0.18)";
    return pnl >= 0 ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.25)";
  }

  return (
    <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="text-sm text-slate-200 font-semibold">PnL Calendar</div>
        <div className="text-xs text-slate-400">{month}</div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-3 py-2 text-xs text-slate-400">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-800">
        {cells.map((c, idx) => {
          if (!c) {
            return (
              <div
                key={idx}
                className="h-[92px] bg-slate-950/80"
                style={{ border: "1px solid rgba(148,163,184,0.08)" }}
              />
            );
          }

          const pnl = Number(c.data.pnl || 0);
          const trades = Number(c.data.trades || 0);

          return (
            <button
              key={c.date}
              onClick={() => onSelectDay(c.date)}
              className="h-[92px] p-3 text-left bg-slate-950 hover:brightness-110 transition"
              style={{
                background: cellBg(pnl),
                border: `1px solid ${cellBorder(pnl)}`,
              }}
            >
              <div className="flex items-start justify-between">
                <div className="text-xs text-slate-200 font-semibold">
                  {c.dayNum}
                </div>
                <div className="text-[11px] text-slate-200/70">
                  {trades ? `${trades}t` : ""}
                </div>
              </div>

              <div className="mt-3">
                <div
                  className={[
                    "text-sm font-semibold",
                    pnl >= 0 ? "text-emerald-200" : "text-rose-200",
                  ].join(" ")}
                >
                  {pnl === 0 ? "0" : `${pnl >= 0 ? "+" : ""}${pnl.toFixed(0)}`}
                </div>
                <div className="text-[11px] text-slate-200/70 mt-1">
                  {pnl === 0 ? "No PnL" : "Net PnL"}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
