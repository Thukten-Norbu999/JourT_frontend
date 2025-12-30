import KpiCard from "./KpiCard";

export default function PnlSummary({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KpiCard label="Total PnL" value={stats.total.toFixed(0)} />
      <KpiCard label="Win Days" value={stats.winDays} />
      <KpiCard label="Loss Days" value={stats.lossDays} />
      <KpiCard label="Best Day" value={stats.bestDay?.pnl.toFixed(0) || "—"} />
    </div>
  );
}
