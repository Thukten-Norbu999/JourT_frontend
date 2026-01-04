// src/lib/auth/manualAuth.js
import { api } from "../apiClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "https://jourt-api.onrender.com";

function isNetworkError(e) {
  const msg = String(e?.message || "");
  return (
    msg.includes("Failed to fetch") || // chrome
    msg.includes("NetworkError") || // firefox
    msg.includes("Load failed") ||
    msg.includes("ERR_CONNECTION_REFUSED")
  );
}

async function safeReadJsonOrText(res) {
  const text = await res.text(); // always succeeds
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

function saveUser(user) {
  try {
    if (user) localStorage.setItem("jourt_user", JSON.stringify(user));
  } catch {}
}

function clearUser() {
  try {
    localStorage.removeItem("jourt_user");
  } catch {}
}

// Normalize backend response to { user, token }
function extractUser(data) {
  // your backend returns: { user: {..}, token: "..." }
  if (data?.user) return data.user;
  // fallback if later you return user fields top-level
  if (data?.id && (data?.email || data?.username)) return data;
  return null;
}

export async function login(email, password) {
  const payload = {
    email: String(email || "").trim().toLowerCase(),
    password: String(password || ""),
  };

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const { json, text } = await safeReadJsonOrText(res);

    if (!res.ok) {
      const msg =
        json?.error ||
        json?.message ||
        text ||
        `Login failed (${res.status})`;
      throw new Error(msg);
    }

    if (!json) throw new Error("Login response was not JSON");

    // store user for UI
    const user = extractUser(json);
    if (user) saveUser(user);

    return json;
  } catch (e) {
    if (isNetworkError(e)) {
      throw new Error(
        "Server is down or unreachable (check backend is running on :8080)."
      );
    }
    throw e;
  }
}

export async function register(username, email, password) {
  const payload = {
    username: String(username || "").trim(),
    email: String(email || "").trim().toLowerCase(),
    password: String(password || ""),
  };

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const { json, text } = await safeReadJsonOrText(res);

    if (!res.ok) {
      const msg =
        json?.error ||
        json?.message ||
        text ||
        `Registration failed (${res.status})`;
      throw new Error(msg);
    }

    if (!json) throw new Error("Register response was not JSON");

    // store user for UI
    const user = extractUser(json);
    if (user) saveUser(user);

    return json;
  } catch (e) {
    if (isNetworkError(e)) {
      throw new Error(
        "Server is down or unreachable (check backend is running on :8080)."
      );
    }
    throw e;
  }
}

/**
 * Backend-ready:
 * When you implement GET /auth/me, this should return user from cookie token.
 * For now this calls your apiClient.
 */
export function me() {
  return api("/auth/me");
}

/**
 * Logout:
 * - Clears local UI user immediately (even if server down)
 * - Calls POST /auth/logout to clear cookie
 */
export async function logout() {
  clearUser();

  try {
    // use fetch directly so even if apiClient expects /api, we don't break auth route
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    // ignore body; logout should be best-effort
    if (!res.ok) {
      // still considered logged out client-side
      return { ok: false, status: res.status };
    }
    return { ok: true };
  } catch (e) {
    // backend down: still logged out client-side
    return { ok: false, error: "server_down" };
  }
}
