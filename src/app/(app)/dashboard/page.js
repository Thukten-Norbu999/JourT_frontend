"use client";

import { useEffect, useState } from "react";
import RecentTrades from "@/components/RecentTrades";
import TodayPsychology from "@/components/TodayPsychology";
import { mockRecentTrades } from "@/lib/dashboard/recentTradesMock";

import KpiCard from "@/components/KpiCard";
import EquityCurve from "@/components/EquityCurve";
import { mockDashboard } from "@/lib/dashboard/dashboardMock";
// later: import { fetchDashboard } from "@/lib/dashboardApi";

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // TEMP mock
    setData(mockDashboard());

    // BACKEND READY:
    // fetchDashboard("30d").then(setData);
  }, []);

  if (!data) return null;

  const { stats, equityCurve } = data;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          Overview of your trading performance.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          label="Total PnL"
          value={`${stats.totalPnl >= 0 ? "+" : ""}${stats.totalPnl.toFixed(0)}`}
        />
        <KpiCard
          label="Win Rate"
          value={`${Math.round(stats.winRate * 100)}%`}
        />
        <KpiCard label="Avg Win" value={stats.avgWin.toFixed(0)} />
        <KpiCard label="Avg Loss" value={stats.avgLoss.toFixed(0)} />
        <KpiCard label="Profit Factor" value={stats.profitFactor.toFixed(2)} />
        <KpiCard
          label="Max Drawdown"
          value={stats.maxDrawdown.toFixed(0)}
        />
      </div>

      {/* Equity */}
      <EquityCurve data={equityCurve} />

      {/* Bottom widgets */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div className="lg:col-span-2">
    <RecentTrades trades={mockRecentTrades()} />
  </div>
  <TodayPsychology />
</div>


      {/* Streaks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
          <div className="text-sm text-slate-300">Streaks</div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Current win streak</span>
              <span>{stats.streak.current}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Best win streak</span>
              <span>{stats.streak.best}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
          <div className="text-sm text-slate-300">Quick actions</div>
          <div className="mt-4 flex gap-3">
            <a
              href="/trades"
              className="rounded-xl border border-slate-800 px-4 py-2 hover:bg-slate-900"
            >
              View Trades
            </a>
            <a
              href="/import"
              className="rounded-xl border border-slate-800 px-4 py-2 hover:bg-slate-900"
            >
              Import CSV
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
