import { api } from "./apiClient";

// GET /psychology?date=YYYY-MM-DD
export function fetchPsychology(date) {
  return api(`/psychology?date=${date}`);
}

// POST /psychology
export function savePsychology(payload) {
  return api("/psychology", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
