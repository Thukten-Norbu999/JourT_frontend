// src/lib/pnl/pnlApi.js
import { api } from "@/lib/apiClient";

/**
 * Backend routes:
 *  - GET /api/pnl/calendar?month=YYYY-MM -> { days: [{ date, pnl, count }] }
 *  - GET /api/pnl/summary?from=YYYY-MM-DD&to=YYYY-MM-DD -> { trades, totalPnl, winRate }
 */

export function fetchPnlCalendar(month) {
  const m = String(month || "").trim() || new Date().toISOString().slice(0, 7); // YYYY-MM
  return api(`/api/pnl/calendar?month=${encodeURIComponent(m)}`, { method: "GET" });
}

export function fetchPnlSummary({ from, to } = {}) {
  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return api(`/api/pnl/summary${suffix}`, { method: "GET" });
}
