// src/lib/apiClient.js

export class ApiError extends Error {
  constructor(message, { status = 0, code = "UNKNOWN", details = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;     // HTTP status (0 = network/timeout)
    this.code = code;         // SERVER_DOWN, TIMEOUT, BAD_JSON, HTTP_ERROR, etc.
    this.details = details;   // server payload, raw body, etc.
  }
}

const DEFAULT_TIMEOUT_MS = 12000;

function baseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "https://jourt-api.onrender.com"
  );
}

function isFormData(body) {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

// Read response body ONCE, then try parse JSON.
async function readBody(res) {
  const text = await res.text().catch(() => "");
  if (!text) return { json: null, text: "" };
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

export async function api(path, options = {}) {
  const url = `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");

  // Only set JSON content-type if body is not FormData and caller didn't set it
  if (!headers.has("Content-Type") && options.body && !isFormData(options.body)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Handle empty responses (204 etc.)
    if (res.status === 204) return null;

    const { json, text } = await readBody(res);

    // Handle non-2xx
    if (!res.ok) {
      const msg =
        json?.message ||
        json?.error ||
        json?.details ||
        text ||
        `Request failed (${res.status})`;

      // Helpful auth signal for UI guards
      const code =
        res.status === 401 ? "UNAUTHORIZED" :
        res.status === 403 ? "FORBIDDEN" :
        "HTTP_ERROR";

      throw new ApiError(msg, {
        status: res.status,
        code,
        details: { json, text },
      });
    }

    // Success: prefer JSON; otherwise return text
    return json !== null ? json : (text || null);
  } catch (err) {
    clearTimeout(timeout);

    // If we already created an ApiError (HTTP_ERROR etc), keep it.
    if (err instanceof ApiError) throw err;

    // Timeout / Abort
    if (err?.name === "AbortError") {
      throw new ApiError("Request timed out. Please try again.", {
        status: 0,
        code: "TIMEOUT",
      });
    }

    // Network failure (server down, CORS blocked, offline, DNS, etc.)
    throw new ApiError("Server is down or unreachable. Check backend and try again.", {
      status: 0,
      code: "SERVER_DOWN",
      details: { original: String(err?.message || err) },
    });
  }
}

/**
 * Convert thrown errors into something UI-friendly.
 * Use this in your pages/components.
 */
export function uiError(err) {
  if (!err) return { title: "Error", message: "Something went wrong.", code: "UNKNOWN" };

  if (err instanceof ApiError) {
    if (err.code === "SERVER_DOWN") {
      return {
        title: "Backend offline",
        message: "Cannot reach the server. Start your Go API on :8080 and refresh.",
        code: err.code,
      };
    }

    if (err.code === "TIMEOUT") {
      return { title: "Timed out", message: err.message, code: err.code };
    }

    if (err.code === "UNAUTHORIZED") {
      return { title: "Unauthorized", message: "Please login again.", code: "UNAUTHORIZED" };
    }

    if (err.status === 400) {
      return { title: "Bad request", message: err.message, code: "BAD_REQUEST" };
    }
    if (err.status === 409) {
      return { title: "Conflict", message: err.message, code: "CONFLICT" };
    }
    if (err.status >= 500) {
      return { title: "Server error", message: err.message, code: "SERVER_ERROR" };
    }

    return { title: "Error", message: err.message, code: err.code };
  }

  return { title: "Error", message: String(err?.message || err), code: "UNKNOWN" };
}
