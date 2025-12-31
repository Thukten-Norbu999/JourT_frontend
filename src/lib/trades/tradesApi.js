// FILE: /lib/trades/tradesApi.js
import { api } from "../apiClient";

// ✅ GET /api/trades?date=YYYY-MM-DD (optional)
export function fetchTrades({ date } = {}) {
  const qs = date ? `?date=${encodeURIComponent(date)}` : "";
  return api(`/api/trades${qs}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
}

// Back-compat alias
export function fetchAllTrades() {
  return fetchTrades();
}

// ✅ PUT /api/trades/:id/journal (UPSERT)
export function upsertTradeJournal(id, journal) {
  return api(`/api/trades/${encodeURIComponent(id)}/journal`, {
    method: "PUT",
    credentials: "include",
    body: JSON.stringify(journal),
    headers: { "Content-Type": "application/json" },
  });
}

// ✅ POST /api/trades  (your AddTradeModal payload)
export function createTrade(payload) {
  return api(`/api/trades`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
}

// ✅ DELETE /api/trades/:id
export function deleteTrade(id) {
  return api(`/api/trades/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
}
