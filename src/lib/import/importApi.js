import { api } from "@/lib/apiClient";

// Backend-ready:
// POST /import/csv with { mapping, rows } or file upload (later)
export function importTrades(payload) {
  return api("api/import/csv", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
