"use client";

import { useState } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function PnlCalendar({ month, days, onSelectDay, onMonthChange }) {
  const [yStr, mStr] = (month || "").split("-");
  const y = Number(yStr);
  const m = Number(mStr) - 1; // 0-based month

  const byDate = new Map(days.map((d) => [d.date, d]));

  const first = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  // Monday-first offset (0..6)
  const jsDay = first.getDay(); // 0 Sun..6 Sat
  const offset = (jsDay + 6) % 7;

  // dynamic weeks (no excess rows)
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

  // Calculate monthly stats
  const monthlyPnl = days.reduce((sum, d) => sum + (d.pnl || 0), 0);
  const monthlyTrades = days.reduce((sum, d) => sum + (d.trades || 0), 0);
  const winningDays = days.filter((d) => d.pnl > 0).length;
  const losingDays = days.filter((d) => d.pnl < 0).length;
  const winRate = winningDays + losingDays > 0 
    ? ((winningDays / (winningDays + losingDays)) * 100).toFixed(1) 
    : 0;

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

  function prevMonth() {
    const newDate = new Date(y, m - 1, 1);
    const newMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}`;
    onMonthChange?.(newMonth);
  }

  function nextMonth() {
    const newDate = new Date(y, m + 1, 1);
    const newMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}`;
    onMonthChange?.(newMonth);
  }

  function goToToday() {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    onMonthChange?.(today);
  }

  const isCurrentMonth = () => {
    const now = new Date();
    return y === now.getFullYear() && m === now.getMonth();
  };

  return (
    <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
      {/* Header with navigation */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-lg text-slate-200 font-semibold">
              {MONTHS[m]} {y}
            </div>
            {!isCurrentMonth() && (
              <button
                onClick={goToToday}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
              >
                Today
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="rounded-lg border border-slate-800 px-2 py-1 hover:bg-slate-800 transition"
              aria-label="Previous month"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextMonth}
              className="rounded-lg border border-slate-800 px-2 py-1 hover:bg-slate-800 transition"
              aria-label="Next month"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Monthly summary stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2">
            <div className="text-[11px] text-slate-400">Net PnL</div>
            <div className={`text-sm font-semibold ${monthlyPnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {monthlyPnl >= 0 ? '+' : ''}{monthlyPnl.toFixed(0)}
            </div>
          </div>
          
          <div className="rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2">
            <div className="text-[11px] text-slate-400">Trades</div>
            <div className="text-sm font-semibold text-slate-200">{monthlyTrades}</div>
          </div>
          
          <div className="rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2">
            <div className="text-[11px] text-slate-400">Win Rate</div>
            <div className="text-sm font-semibold text-slate-200">{winRate}%</div>
          </div>
          
          <div className="rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2">
            <div className="text-[11px] text-slate-400">W/L Days</div>
            <div className="text-sm font-semibold text-slate-200">
              <span className="text-emerald-300">{winningDays}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span className="text-rose-300">{losingDays}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-3 py-2 text-xs text-slate-400 text-center font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
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
          
          // Check if this is today
          const today = new Date();
          const isToday = 
            y === today.getFullYear() && 
            m === today.getMonth() && 
            c.dayNum === today.getDate();

          return (
            <button
              key={c.date}
              onClick={() => onSelectDay(c.date)}
              className="h-[92px] p-3 text-left bg-slate-950 hover:brightness-110 transition relative group"
              style={{
                background: cellBg(pnl),
                border: `1px solid ${cellBorder(pnl)}`,
              }}
            >
              {isToday && (
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className={`text-xs font-semibold ${isToday ? 'text-blue-300' : 'text-slate-200'}`}>
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
                  {pnl === 0 ? "—" : `${pnl >= 0 ? "+" : ""}${pnl.toFixed(0)}`}
                </div>
                {pnl !== 0 && (
                  <div className="text-[11px] text-slate-200/70 mt-1">
                    {trades > 0 ? `${(pnl/trades).toFixed(0)}/trade` : "Net"}
                  </div>
                )}
              </div>

              {/* Hover tooltip */}
              {trades > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <div className="text-xs text-slate-200">
                    {trades} trade{trades !== 1 ? 's' : ''} · {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}