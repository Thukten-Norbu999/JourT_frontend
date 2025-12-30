"use client";

import Link from "next/link";

export default function RecentTrades({ trades }) {
  if (!trades || trades.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
        <div className="text-sm text-slate-300">Recent Trades</div>
        <div className="text-sm text-slate-500 mt-2">
          No trades yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 flex justify-between">
        <div className="text-sm text-slate-300">Recent Trades</div>
        <Link
          href="/trades"
          className="text-xs text-emerald-300 hover:underline"
        >
          View all
        </Link>
      </div>

      <table className="w-full text-sm">
        <tbody>
          {trades.slice(0, 5).map((t) => {
            const reviewed = t.journal && Object.keys(t.journal).length > 0;
            return (
              <tr
                key={t.id}
                className="border-t border-slate-800 hover:bg-slate-900/40"
              >
                <td className="px-4 py-3 font-medium">
                  {t.symbol}
                </td>
                <td className="px-4 py-3">
                  {t.side}
                </td>
                <td
                  className={`px-4 py-3 text-right ${
                    t.pnl >= 0 ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {t.pnl >= 0 ? "+" : ""}
                  {t.pnl.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  {reviewed ? (
                    <span className="text-xs text-slate-500">Reviewed</span>
                  ) : (
                    <Link
                      href={`/trades?focus=${t.id}`}
                      className="text-xs text-amber-300 hover:underline"
                    >
                      Needs review
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
