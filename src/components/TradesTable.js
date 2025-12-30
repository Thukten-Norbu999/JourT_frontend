"use client";

import { useMemo } from "react";

export default function TradesTable({ trades = [], onSelect }) {
  const rows = useMemo(() => (Array.isArray(trades) ? trades : []), [trades]);

  return (
    <div className="space-y-3">
      {/* Mobile cards */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {rows.map((t) => (
          <button
            key={String(t.id)}
            onClick={() => onSelect?.(t)}
            className="text-left rounded-2xl border border-slate-800 bg-slate-950 p-4 hover:bg-slate-900/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-slate-200 font-semibold">{t.symbol || "—"}</div>
                <div className="text-xs text-slate-500 mt-0.5">{fmtDate(t.date)}</div>
              </div>

              <span className={badgeSide(t.side)}>{String(t.side || "—")}</span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <Info label="Qty" value={fmtNum(t.qty)} />
              <Info label="Entry" value={fmtNum(t.entry)} />
              <Info label="Exit" value={fmtNum(t.exit)} />
              <Info label="PnL" value={fmtPnl(t.pnl)} pnl />
            </div>

            <div className="mt-3 text-xs text-slate-500">
              Journal:{" "}
              <span className="text-slate-300">
                {hasJournal(t) ? "Yes" : "No"}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-slate-900/30 border-b border-slate-800">
              <tr className="text-slate-400">
                <Th>Date</Th>
                <Th>Symbol</Th>
                <Th>Side</Th>
                <Th className="text-right">Qty</Th>
                <Th className="text-right">Entry</Th>
                <Th className="text-right">Exit</Th>
                <Th className="text-right">Fees</Th>
                <Th className="text-right">PnL</Th>
                <Th>Journal</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr
                  key={String(t.id)}
                  className="border-t border-slate-800 hover:bg-slate-900/30 cursor-pointer"
                  onClick={() => onSelect?.(t)}
                >
                  <Td>{fmtDate(t.date)}</Td>
                  <Td className="text-slate-200 font-semibold">{t.symbol || "—"}</Td>
                  <Td>
                    <span className={badgeSide(t.side)}>{String(t.side || "—")}</span>
                  </Td>
                  <Td className="text-right">{fmtNum(t.qty)}</Td>
                  <Td className="text-right">{fmtNum(t.entry)}</Td>
                  <Td className="text-right">{fmtNum(t.exit)}</Td>
                  <Td className="text-right">{fmtNum(t.fees)}</Td>
                  <Td className={["text-right font-semibold", pnlClass(t.pnl)].join(" ")}>
                    {fmtPnl(t.pnl)}
                  </Td>
                  <Td className="text-slate-300">{hasJournal(t) ? "Yes" : "No"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ children, className = "" }) {
  return <th className={["px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide", className].join(" ")}>{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={["px-4 py-3 whitespace-nowrap text-slate-300", className].join(" ")}>{children}</td>;
}

function Info({ label, value, pnl }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/20 px-3 py-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className={["text-xs font-semibold", pnl ? pnlClass(value) : "text-slate-200"].join(" ")}>
        {String(value)}
      </div>
    </div>
  );
}

function hasJournal(t) {
  return !!(t?.Journal || t?.journal);
}

function badgeSide(side) {
  const s = String(side || "").toUpperCase();
  if (s === "BUY") return "text-xs px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  if (s === "SELL") return "text-xs px-2 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200";
  return "text-xs px-2 py-1 rounded-lg border border-slate-700 bg-slate-900/30 text-slate-300";
}

function pnlClass(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "text-slate-200";
  return n >= 0 ? "text-emerald-300" : "text-rose-300";
}

function fmtNum(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}

function fmtPnl(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  const x = Math.round(n * 100) / 100;
  return x >= 0 ? `+${x.toFixed(2)}` : x.toFixed(2);
}

function fmtDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString();
}
