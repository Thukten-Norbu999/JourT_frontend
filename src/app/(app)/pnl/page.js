"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import PnlCalendar from "@/components/PnlCalendar";
import PnlSummary from "@/components/PnlSummary";
import PnlWeekdays from "@/components/PnlWeekdays";

import { pnlStats, streaks, byWeekday } from "@/lib/pnl/pnlUtils";
import { fetchPnlCalendar, fetchPnlSummary } from "@/lib/pnl/pnlApi";
import { uiError } from "@/lib/apiClient";

function monthRange(month) {
  // month: "YYYY-MM"
  const [y, m] = String(month).split("-").map((x) => Number(x));
  if (!y || !m) return { from: "", to: "" };

  const from = `${String(y)}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0).getDate(); // day 0 of next month = last day of this month
  const to = `${String(y)}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return { from, to };
}

export default function PnlPage() {
  const router = useRouter();

  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [days, setDays] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setErr("");
      setLoading(true);

      try {
        // 1) calendar payload: ?month=YYYY-MM
        const cal = await fetchPnlCalendar(month);
        if (!alive) return;
        setDays(Array.isArray(cal?.days) ? cal.days : []);

        // 2) summary payload: ?from=YYYY-MM-DD&to=YYYY-MM-DD
        const { from, to } = monthRange(month);
        const sum = await fetchPnlSummary({ from, to });
        if (!alive) return;
        setSummary(sum || null);
      } catch (e) {
        if (!alive) return;
        const u = uiError(e);
        setErr(u.message || "Failed to load PnL.");
        setDays([]);
        setSummary(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [month]);

  // your existing derived UI stats (works with backend days array)
  const stats = useMemo(() => pnlStats(days), [days]);
  const streak = useMemo(() => streaks(days), [days]);
  const weekdays = useMemo(() => byWeekday(days), [days]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-xl font-semibold">PnL</h1>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input w-full sm:w-auto"
          />

          {loading ? (
            <span className="text-xs text-slate-400">Loading…</span>
          ) : null}
        </div>
      </div>

      {err ? (
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-sm text-rose-200">
          {err}
        </div>
      ) : null}

      {/* Prefer backend summary if you want, but keep your existing component contract */}
      <PnlSummary stats={stats} serverSummary={summary} />

      <div className="text-sm text-slate-400">
        Current win streak: <span className="text-slate-200">{streak.current}</span> · Best streak:{" "}
        <span className="text-slate-200">{streak.best}</span>
      </div>

      <PnlCalendar month={month} days={days} onSelectDay={(d) => router.push(`/trades?date=${d}`)} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PnlWeekdays data={weekdays} />
      </div>

      {/* keep your input class styling consistent */}
      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          background: rgb(2 6 23 / 1);
          border: 1px solid rgb(30 41 59 / 1);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          outline: none;
          color: rgb(226 232 240 / 1);
        }
        .input:focus {
          border-color: rgb(71 85 105 / 1);
        }
      `}</style>
    </div>
  );
}