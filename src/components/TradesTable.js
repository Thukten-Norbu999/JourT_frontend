// FILE: /components/TradesTable.jsx
"use client";

import { useMemo, useState } from "react";
import { Trash2, Filter, X } from "lucide-react";

export default function TradesTable({ trades = [], onSelect, onDelete }) {
  const [deletingId, setDeletingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filterSymbol, setFilterSymbol] = useState("");
  const [filterSide, setFilterSide] = useState("all");
  const [filterPnl, setFilterPnl] = useState("all");
  const [filterJournal, setFilterJournal] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Get unique symbols for dropdown
  const uniqueSymbols = useMemo(() => {
    const symbols = new Set();
    (Array.isArray(trades) ? trades : []).forEach(t => {
      const sym = String(t?.symbol || "").trim().toUpperCase();
      if (sym) symbols.add(sym);
    });
    return Array.from(symbols).sort();
  }, [trades]);

  // Calculate PnL if missing and ensure proper field access
  const rowsWithPnL = useMemo(() => {
    const rows = Array.isArray(trades) ? trades : [];
    return rows.map(t => {
      // Try different case variations for PnL
      let pnl = t?.pnl ?? t?.PnL ?? t?.Pnl ?? null;
      
      // If PnL is missing or zero, try to calculate it
      if ((pnl === null || pnl === undefined || pnl === 0) && t?.entry && t?.exit && t?.qty) {
        const entry = Number(t.entry);
        const exit = Number(t.exit);
        const qty = Number(t.qty);
        const side = String(t?.side || "").toUpperCase();
        
        if (Number.isFinite(entry) && Number.isFinite(exit) && Number.isFinite(qty)) {
          if (side === "BUY" || side === "LONG") {
            pnl = (exit - entry) * qty;
          } else if (side === "SELL" || side === "SHORT") {
            pnl = (entry - exit) * qty;
          }
          
          // Subtract fees if present
          const fees = Number(t?.fees ?? t?.Fees ?? 0);
          if (Number.isFinite(fees)) {
            pnl -= fees;
          }
        }
      }
      
      return { ...t, pnl };
    });
  }, [trades]);

  // Apply filters
  const filteredRows = useMemo(() => {
    let rows = rowsWithPnL;

    // Symbol filter
    if (filterSymbol) {
      rows = rows.filter(t => {
        const sym = String(t?.symbol || "").trim().toUpperCase();
        return sym.includes(filterSymbol.toUpperCase());
      });
    }

    // Side filter
    if (filterSide !== "all") {
      rows = rows.filter(t => {
        const side = String(t?.side || "").toUpperCase();
        return side === filterSide.toUpperCase();
      });
    }

    // PnL filter
    if (filterPnl !== "all") {
      rows = rows.filter(t => {
        const pnl = Number(t?.pnl ?? 0);
        if (filterPnl === "profit") return pnl > 0;
        if (filterPnl === "loss") return pnl < 0;
        if (filterPnl === "breakeven") return pnl === 0;
        return true;
      });
    }

    // Journal filter
    if (filterJournal !== "all") {
      rows = rows.filter(t => {
        const hasJ = hasJournal(t);
        if (filterJournal === "yes") return hasJ;
        if (filterJournal === "no") return !hasJ;
        return true;
      });
    }

    // Date range filter
    if (filterDateFrom) {
      rows = rows.filter(t => {
        const dateStr = formatDateForComparison(t?.date);
        return dateStr >= filterDateFrom;
      });
    }
    if (filterDateTo) {
      rows = rows.filter(t => {
        const dateStr = formatDateForComparison(t?.date);
        return dateStr <= filterDateTo;
      });
    }

    return rows;
  }, [rowsWithPnL, filterSymbol, filterSide, filterPnl, filterJournal, filterDateFrom, filterDateTo]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterSymbol) count++;
    if (filterSide !== "all") count++;
    if (filterPnl !== "all") count++;
    if (filterJournal !== "all") count++;
    if (filterDateFrom) count++;
    if (filterDateTo) count++;
    return count;
  }, [filterSymbol, filterSide, filterPnl, filterJournal, filterDateFrom, filterDateTo]);

  function clearFilters() {
    setFilterSymbol("");
    setFilterSide("all");
    setFilterPnl("all");
    setFilterJournal("all");
    setFilterDateFrom("");
    setFilterDateTo("");
  }

  async function handleDelete(e, t) {
    e?.stopPropagation?.();
    e?.preventDefault?.();

    const id = String(t?.id ?? t?.ID ?? "");
    if (!id || !onDelete) return;

    const ok = window.confirm(`Delete trade ${String(t?.symbol || "").toUpperCase()} (${id})?`);
    if (!ok) return;

    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  function handleSelect(t) {
    onSelect?.(t);
  }

  function onCardKeyDown(e, t) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(t);
    }
  }

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={[
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
                showFilters
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  : "border-slate-800 bg-slate-900/30 text-slate-300 hover:bg-slate-900",
              ].join(" ")}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 text-xs font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/30 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 transition"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          <div className="text-sm text-slate-400">
            Showing <span className="text-slate-200 font-semibold">{filteredRows.length}</span> of{" "}
            <span className="text-slate-200 font-semibold">{rowsWithPnL.length}</span> trades
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t border-slate-800">
            <FilterField label="Symbol">
              <input
                type="text"
                value={filterSymbol}
                onChange={(e) => setFilterSymbol(e.target.value)}
                placeholder="Search symbol..."
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
              />
            </FilterField>

            <FilterField label="Side">
              <select
                value={filterSide}
                onChange={(e) => setFilterSide(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-slate-200"
              >
                <option value="all">All sides</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </FilterField>

            <FilterField label="PnL">
              <select
                value={filterPnl}
                onChange={(e) => setFilterPnl(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-slate-200"
              >
                <option value="all">All trades</option>
                <option value="profit">Profitable</option>
                <option value="loss">Loss</option>
                <option value="breakeven">Break-even</option>
              </select>
            </FilterField>

            <FilterField label="Journal">
              <select
                value={filterJournal}
                onChange={(e) => setFilterJournal(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-slate-200"
              >
                <option value="all">All</option>
                <option value="yes">With journal</option>
                <option value="no">Without journal</option>
              </select>
            </FilterField>

            <FilterField label="Date from">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-slate-200"
              />
            </FilterField>

            <FilterField label="Date to">
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-slate-200"
              />
            </FilterField>
          </div>
        )}
      </div>

      {/* Empty state */}
      {filteredRows.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center">
          <div className="text-slate-400 mb-2">No trades found</div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              Clear filters to see all trades
            </button>
          )}
        </div>
      )}

      {/* Mobile cards */}
      {filteredRows.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:hidden">
          {filteredRows.map((t, idx) => {
            const id = String(t?.id ?? t?.ID ?? "");
            const isDeleting = deletingId === id;

            return (
              <div
                key={id || `row-${idx}`}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(t)}
                onKeyDown={(e) => onCardKeyDown(e, t)}
                className="text-left rounded-2xl border border-slate-800 bg-slate-950 p-4 hover:bg-slate-900/30 cursor-pointer select-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-200 font-semibold">{t?.symbol || "—"}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{fmtDate(t?.date)}</div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className={badgeSide(t?.side)}>{String(t?.side || "—")}</span>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, t)}
                      disabled={isDeleting}
                      className={[
                        "rounded-xl border px-2.5 py-2 text-xs",
                        isDeleting
                          ? "border-slate-800 bg-slate-900/30 text-slate-500 cursor-not-allowed"
                          : "border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15",
                      ].join(" ")}
                      title="Delete trade"
                      aria-label="Delete trade"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Info label="Qty" value={fmtNum(t?.qty)} />
                  <Info label="Entry" value={fmtNum(t?.entry)} />
                  <Info label="Exit" value={fmtNum(t?.exit)} />
                  <Info label="PnL" value={fmtPnl(t?.pnl)} pnl />
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  Journal: <span className="text-slate-300">{hasJournal(t) ? "Yes" : "No"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Desktop table */}
      {filteredRows.length > 0 && (
        <div className="hidden sm:block rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
          <div className="overflow-auto">
            <table className="min-w-[1020px] w-full text-sm">
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
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((t, idx) => {
                  const id = String(t?.id ?? t?.ID ?? "");
                  const isDeleting = deletingId === id;

                  return (
                    <tr
                      key={id || `row-${idx}`}
                      className="border-t border-slate-800 hover:bg-slate-900/30 cursor-pointer"
                      onClick={() => handleSelect(t)}
                    >
                      <Td>{fmtDate(t?.date)}</Td>
                      <Td className="text-slate-200 font-semibold">{t?.symbol || "—"}</Td>
                      <Td>
                        <span className={badgeSide(t?.side)}>{String(t?.side || "—")}</span>
                      </Td>
                      <Td className="text-right">{fmtNum(t?.qty)}</Td>
                      <Td className="text-right">{fmtNum(t?.entry)}</Td>
                      <Td className="text-right">{fmtNum(t?.exit)}</Td>
                      <Td className="text-right">{fmtNum(t?.fees)}</Td>
                      <Td className={["text-right font-semibold", pnlClass(t?.pnl)].join(" ")}>
                        {fmtPnl(t?.pnl)}
                      </Td>
                      <Td className="text-slate-300">{hasJournal(t) ? "Yes" : "No"}</Td>

                      <Td className="text-right">
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, t)}
                          disabled={isDeleting}
                          className={[
                            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs",
                            isDeleting
                              ? "border-slate-800 bg-slate-900/30 text-slate-500 cursor-not-allowed"
                              : "border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15",
                          ].join(" ")}
                          title="Delete trade"
                        >
                          <Trash2 className="w-4 h-4" />
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Helper Components ---------- */

function FilterField({ label, children }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th className={["px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide", className].join(" ")}>
      {children}
    </th>
  );
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

/* ---------- Helper Functions ---------- */

function hasJournal(t) {
  return !!(t?.Journal || t?.journal);
}

function badgeSide(side) {
  const s = String(side || "").toUpperCase();
  if (s === "BUY")
    return "text-xs px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
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
  // Show 0.00 if exactly zero, don't hide it
  const x = Math.round(n * 100) / 100;
  return x >= 0 ? `+${x.toFixed(2)}` : x.toFixed(2);
}

function fmtDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  });
}

function formatDateForComparison(v) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}