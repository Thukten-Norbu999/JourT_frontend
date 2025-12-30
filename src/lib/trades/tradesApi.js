// import { cookies } from "next/headers";
import { api } from "../apiClient";

// Your Go backend routes are under /api, not root.
// ✅ GET /api/trades?date=YYYY-MM-DD
export function filterFetchTrades({}){}
export function fetchAllTrades(){
  return api(`/api/trades`,{
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json"},
  });
}
export function fetchTodayTrades(date) {
  const qs = date ? `?date=${encodeURIComponent(date)}` : "";
  return api(`/api/trades${qs}`,{
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json"}
  });
}

// Your backend route is:
// ✅ PUT /api/trades/:id/journal   (NOT PATCH)
// Body: { setup, thesis, mistakes, lessons, rating, tags } etc.
export function updateTradeJournal(id, journal) {
  return api(`/api/trades/${encodeURIComponent(id)}/journal`, {
    method: "PUT",
    body: JSON.stringify(journal),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
}

// ✅ POST /api/trades  (create trade - for your modal)
export function createTrade(payload) {
  return api(`/api/trade`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${document.cookie}` },
  

  });
}

// ✅ DELETE /api/trades/:id
export function deleteTrade(id) {
  return api(`/api/trades/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function upsertTradeJournal(id, journal) {
  return api(`/api/trades/${encodeURIComponent(id)}/journal`, {
    method: "PUT",
    body: JSON.stringify(journal),
  });
}