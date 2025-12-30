"use client";

import { useState } from "react";
import BacktestParams from "@/components/BacktestParams";
import KpiCard from "@/components/KpiCard";
import EquityCurve from "@/components/EquityCurve";
import BacktestTrades from "@/components/BacktestTrades";
import { mockBacktest } from "@/lib/backtest/backtestMock";

export default function BacktestPage() {
  const [config, setConfig] = useState({
    strategy: "ema-crossover",
    symbol: "EURUSD",
    timeframe: "M15",
    from: "2024-01-01",
    to: "2024-12-31",
  });

  const [params, setParams] = useState({
    fast: 20,
    slow: 50,
    risk: 1,
  });

  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);

    setTimeout(() => {
      setResult(mockBacktest());
      setRunning(false);
    }, 700);

    // BACKEND (LOCKED):
    // POST /backtest/run
    // body: { ...config, params }
  }

  return (
    <div className="space-y-6">
      {/* Header row (TradeZella style) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Backtest</h1>
          <p className="text-sm text-slate-400 mt-1">
            Run historical simulations and analyze performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            Endpoint (later): <span className="text-slate-300">POST /backtest/run</span>
          </span>
        </div>
      </div>

      {/* Proper responsive grid: 1 col (mobile) -> 3 cols (lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Configuration */}
        <Card className="lg:col-span-4">
          <CardHeader title="Configuration" subtitle="Choose strategy, symbol & date range." />

          <div className="grid grid-cols-1 gap-3">
            <Field label="Strategy">
              <select
                value={config.strategy}
                onChange={(e) => setConfig((c) => ({ ...c, strategy: e.target.value }))}
                className="input"
              >
                <option value="ema-crossover">EMA Crossover</option>
                <option value="breakout">Breakout</option>
                <option value="mean-reversion">Mean Reversion</option>
              </select>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Symbol">
                <input
                  value={config.symbol}
                  onChange={(e) => setConfig((c) => ({ ...c, symbol: e.target.value }))}
                  className="input"
                  placeholder="EURUSD"
                />
              </Field>

              <Field label="Timeframe">
                <select
                  value={config.timeframe}
                  onChange={(e) => setConfig((c) => ({ ...c, timeframe: e.target.value }))}
                  className="input"
                >
                  <option>M5</option>
                  <option>M15</option>
                  <option>H1</option>
                  <option>D1</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="From">
                <input
                  type="date"
                  value={config.from}
                  onChange={(e) => setConfig((c) => ({ ...c, from: e.target.value }))}
                  className="input"
                />
              </Field>

              <Field label="To">
                <input
                  type="date"
                  value={config.to}
                  onChange={(e) => setConfig((c) => ({ ...c, to: e.target.value }))}
                  className="input"
                />
              </Field>
            </div>

            <button
              onClick={run}
              disabled={running}
              className={[
                "mt-1 w-full rounded-2xl border px-4 py-3 font-medium",
                running
                  ? "border-slate-800 bg-slate-900/40 text-slate-400 cursor-not-allowed"
                  : "border-emerald-500/30 bg-emerald-500/20 hover:bg-emerald-500/25",
              ].join(" ")}
            >
              {running ? "Running…" : "Run Backtest"}
            </button>

            <div className="text-[11px] text-slate-500">
              Tip: Start with 1–2 years on M15 to keep runs fast.
            </div>
          </div>
        </Card>

        {/* Parameters */}
        <div className="lg:col-span-4">
          {/* Your existing component; should already be a card. If not, it will still fit fine. */}
          <BacktestParams params={params} setParams={setParams} />
        </div>

        {/* Results */}
        <Card className="lg:col-span-4">
          <CardHeader title="Results" subtitle="Summary KPIs appear after a run." />

          {!result ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
              <div className="text-sm text-slate-300">No results yet</div>
              <div className="text-xs text-slate-500 mt-1">
                Run a backtest to populate KPIs, equity curve and trade list.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <KpiCard label="Trades" value={result.summary.trades} />
              <KpiCard label="Win Rate" value={`${Math.round(result.summary.winRate * 100)}%`} />
              <KpiCard label="Total PnL" value={result.summary.totalPnl} />
              <KpiCard label="Profit Factor" value={result.summary.profitFactor} />
              <KpiCard label="Max Drawdown" value={result.summary.maxDrawdown} />
            </div>
          )}

          {result ? (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
              <div className="text-xs text-slate-500">Strategy</div>
              <div className="text-sm text-slate-200 mt-1">
                {prettyStrategy(config.strategy)} · {config.symbol} · {config.timeframe}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {config.from} → {config.to}
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      {/* Analysis blocks */}
      {result ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Card className="lg:col-span-7">
            <CardHeader title="Equity Curve" subtitle="Performance over time." />
            <EquityCurve
              data={result.equity.map((e, i) => ({
                date: String(i),
                equity: e.equity,
              }))}
            />
          </Card>

          <Card className="lg:col-span-5">
            <CardHeader title="Trades" subtitle="All simulated trades." />
            <BacktestTrades trades={result.trades} />
          </Card>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- UI helpers (kept local, no new files) ---------- */

function Card({ children, className = "" }) {
  return (
    <section className={["rounded-3xl border border-slate-800 bg-slate-950/60 p-5", className].join(" ")}>
      {children}
    </section>
  );
}

function CardHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <div className="text-base font-semibold text-slate-100">{title}</div>
      {subtitle ? <div className="text-xs text-slate-500 mt-1">{subtitle}</div> : null}
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

function prettyStrategy(s) {
  if (s === "ema-crossover") return "EMA Crossover";
  if (s === "mean-reversion") return "Mean Reversion";
  if (s === "breakout") return "Breakout";
  return s;
}
