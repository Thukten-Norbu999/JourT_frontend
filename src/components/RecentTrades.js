"use client";

import Link from "next/link";

export default function RecentTrades({ trades }) {
  if (!trades || trades.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
        <div className="text-sm text-slate-300 font-semibold">Recent Trades</div>
        <div className="text-sm text-slate-500 mt-4 text-center py-6">
          No trades yet. Import your first trades to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden">
      {/* Card Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="text-sm text-slate-300 font-semibold">Recent Trades</div>
        <Link
          href="/trades"
          className="text-xs text-emerald-300 hover:text-emerald-200 transition"
        >
          View all →
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-950/50 border-b border-slate-800">
            <tr className="text-slate-400">
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">
                Symbol
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">
                Side
              </th>
              <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide">
                PnL
              </th>
              <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {trades.slice(0, 5).map((t) => {
              // Handle different field name variations
              const id = t?.id ?? t?.ID;
              const symbol = t?.symbol ?? t?.Symbol ?? "—";
              const side = t?.side ?? t?.Side ?? "—";
              const pnl = Number(t?.pnl ?? t?.PnL ?? 0);
              const journal = t?.journal ?? t?.Journal;
              
              const reviewed = journal && Object.keys(journal).length > 0;
              const sideUpper = String(side).toUpperCase();

              return (
                <tr
                  key={id}
                  className="border-t border-slate-800 hover:bg-slate-900/40 transition"
                >
                  <td className="px-4 py-3 font-semibold text-slate-200">
                    {symbol}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex px-2 py-0.5 rounded-lg text-xs",
                        sideUpper === "BUY" || sideUpper === "LONG"
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                          : sideUpper === "SELL" || sideUpper === "SHORT"
                          ? "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700",
                      ].join(" ")}
                    >
                      {side}
                    </span>
                  </td>
                  <td
                    className={[
                      "px-4 py-3 text-right font-semibold",
                      pnl >= 0 ? "text-emerald-300" : "text-rose-300",
                    ].join(" ")}
                  >
                    {pnl >= 0 ? "+" : ""}
                    {Number.isFinite(pnl) ? pnl.toFixed(2) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {reviewed ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Reviewed
                      </span>
                    ) : (
                      <Link
                        href={`/trades?focus=${id}`}
                        className="inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 transition"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Review
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer hint */}
      {trades.length > 5 && (
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/30 text-center">
          <Link
            href="/trades"
            className="text-xs text-slate-400 hover:text-slate-200 transition"
          >
            +{trades.length - 5} more trades
          </Link>
        </div>
      )}
    </div>
  );
}