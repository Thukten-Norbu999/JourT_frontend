"use client";

import { useEffect, useState } from "react";
import RecentTrades from "@/components/RecentTrades";
import TodayPsychology from "@/components/TodayPsychology";
import KpiCard from "@/components/KpiCard";
import EquityCurve from "@/components/EquityCurve";
import { fetchDashboard } from "@/lib/dashboard/dashboardApi";

const RANGE_OPTIONS = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "365d", label: "1 Year" },
  { value: "all", label: "All Time" },
];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchDashboard(range);
        setData(result);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [range]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-800 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm text-slate-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 max-w-md text-center">
          <div className="text-rose-200 font-semibold mb-2">Error Loading Dashboard</div>
          <div className="text-sm text-slate-400 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, equityCurve, recentTrades } = data;

  // Safe access with defaults
  const safeStats = {
    totalPnl: stats?.totalPnl ?? 0,
    winRate: stats?.winRate ?? 0,
    avgWin: stats?.avgWin ?? 0,
    avgLoss: stats?.avgLoss ?? 0,
    profitFactor: stats?.profitFactor ?? 0,
    maxDrawdown: stats?.maxDrawdown ?? 0,
    totalTrades: stats?.totalTrades ?? 0,
    wins: stats?.wins ?? 0,
    losses: stats?.losses ?? 0,
    grossProfit: stats?.grossProfit ?? 0,
    grossLoss: stats?.grossLoss ?? 0,
    streak: {
      current: stats?.streak?.current ?? 0,
      best: stats?.streak?.best ?? 0,
    },
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Overview of your trading performance
          </p>
        </div>

        {/* Range selector */}
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400">Time Range:</div>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200"
          >
            {RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty state */}
      {safeStats.totalTrades === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-12 text-center">
          <div className="text-slate-400 mb-4">No trades found for this period</div>
          <div className="flex gap-3 justify-center">
            <a
              href="/import"
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-200 hover:bg-emerald-500/15"
            >
              Import Trades
            </a>
            <button
              onClick={() => setRange("all")}
              className="rounded-xl border border-slate-800 px-4 py-2 hover:bg-slate-900"
            >
              View All Time
            </button>
          </div>
        </div>
      )}

      {safeStats.totalTrades > 0 && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard
              label="Total PnL"
              value={`${safeStats.totalPnl >= 0 ? "+" : ""}${safeStats.totalPnl.toFixed(0)}`}
              highlight={safeStats.totalPnl >= 0 ? "green" : "red"}
            />
            <KpiCard
              label="Win Rate"
              value={`${Math.round(safeStats.winRate * 100)}%`}
            />
            <KpiCard 
              label="Avg Win" 
              value={safeStats.avgWin > 0 ? `+${safeStats.avgWin.toFixed(0)}` : "—"}
              highlight="green"
            />
            <KpiCard 
              label="Avg Loss" 
              value={safeStats.avgLoss < 0 ? safeStats.avgLoss.toFixed(0) : "—"}
              highlight="red"
            />
            <KpiCard
              label="Profit Factor"
              value={safeStats.profitFactor > 0 ? safeStats.profitFactor.toFixed(2) : "—"}
            />
            <KpiCard
              label="Max Drawdown"
              value={safeStats.maxDrawdown < 0 ? safeStats.maxDrawdown.toFixed(0) : "—"}
              highlight="red"
            />
          </div>

          {/* Additional stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Total Trades"
              value={safeStats.totalTrades}
            />
            <StatCard
              label="Winning Trades"
              value={safeStats.wins}
              color="emerald"
            />
            <StatCard
              label="Losing Trades"
              value={safeStats.losses}
              color="rose"
            />
            <StatCard
              label="Gross Profit"
              value={`+${safeStats.grossProfit.toFixed(0)}`}
              color="emerald"
            />
          </div>

          {/* Equity Curve */}
          <EquityCurve data={equityCurve || []} />

          {/* Bottom widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <RecentTrades trades={recentTrades || []} />
            </div>
            <TodayPsychology />
          </div>

          {/* Streaks & Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
              <div className="text-sm text-slate-300 font-semibold mb-4">Win Streaks</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-sm text-slate-400">Current Streak</span>
                  <span className="text-lg font-semibold text-slate-200">
                    {safeStats.streak.current}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-sm text-slate-400">Best Streak</span>
                  <span className="text-lg font-semibold text-emerald-300">
                    {safeStats.streak.best}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
              <div className="text-sm text-slate-300 font-semibold mb-4">Quick Actions</div>
              <div className="space-y-3">
                <a
                  href="/trades"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 transition group"
                >
                  <span className="text-sm text-slate-200">View All Trades</span>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="/import"
                  className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 transition group"
                >
                  <span className="text-sm text-emerald-200">Import CSV</span>
                  <svg className="w-4 h-4 text-emerald-400 group-hover:text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </a>
                <a
                  href="/analytics"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 transition group"
                >
                  <span className="text-sm text-slate-200">View Analytics</span>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper component for stat cards
function StatCard({ label, value, color }) {
  const colorClasses = {
    emerald: "text-emerald-300",
    rose: "text-rose-300",
    blue: "text-blue-300",
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-lg font-semibold ${color ? colorClasses[color] : "text-slate-200"}`}>
        {value}
      </div>
    </div>
  );
}