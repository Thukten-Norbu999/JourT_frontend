import { api } from "../apiClient";

// GET /setups -> [{ id, name }]
export function fetchSetups() {
  return api("api/setups");
}

// POST /setups body: { name } -> { id, name }
export function createSetup(name) {
  return api("api/setups", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

// DELETE /setups/:id -> 204
export function deleteSetup(id) {
  return api(`api/setups/${id}`, { method: "DELETE" });
}
