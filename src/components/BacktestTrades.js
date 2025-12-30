export default function BacktestTrades({ trades }) {
  return (
    <div className="rounded-2xl border border-slate-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-900 text-slate-300">
          <tr>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Symbol</th>
            <th className="px-4 py-3 text-left">Side</th>
            <th className="px-4 py-3 text-right">PnL</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t.id} className="border-t border-slate-800">
              <td className="px-4 py-3">{t.date}</td>
              <td className="px-4 py-3">{t.symbol}</td>
              <td className="px-4 py-3">{t.side}</td>
              <td
                className={`px-4 py-3 text-right ${
                  t.pnl >= 0 ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {t.pnl}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
