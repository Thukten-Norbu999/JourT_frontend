// src/lib/pnl/pnlApi.js
import { api } from "@/lib/apiClient";
import { useState, useEffect } from "react";

/**
 * Backend routes:
 *  - GET /api/pnl/calendar?month=YYYY-MM -> { month, days: [{ date, pnl, trades, fees, wins, losses }], summary }
 *  - GET /api/pnl/summary?from=YYYY-MM-DD&to=YYYY-MM-DD -> { from, to, trades, wins, losses, winRate, totalPnl, ... }
 *  - GET /api/pnl/daily?date=YYYY-MM-DD -> { date, trades: [...], summary }
 *  - GET /api/pnl/stats -> { totalTrades, wins, losses, winRate, totalPnl, ... }
 */

/**
 * Fetch PnL calendar for a specific month
 * @param {string} month - Format: YYYY-MM
 * @returns {Promise<CalendarResponse>}
 */
export async function fetchPnlCalendar(month) {
  try {
    const m = String(month || "").trim() || new Date().toISOString().slice(0, 7);
    const data = await api(`/api/pnl/calendar?month=${encodeURIComponent(m)}`, {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch PnL calendar:", error);
    throw error;
  }
}

/**
 * Fetch PnL summary for a date range
 * @param {Object} options - Date range options
 * @param {string} options.from - Format: YYYY-MM-DD
 * @param {string} options.to - Format: YYYY-MM-DD
 * @returns {Promise<SummaryResponse>}
 */
export async function fetchPnlSummary({ from, to } = {}) {
  try {
    const qs = new URLSearchParams();
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);

    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    const data = await api(`/api/pnl/summary${suffix}`, { method: "GET" });
    return data;
  } catch (error) {
    console.error("Failed to fetch PnL summary:", error);
    throw error;
  }
}

/**
 * Fetch detailed trades for a specific day
 * @param {string} date - Format: YYYY-MM-DD
 * @returns {Promise<DailyResponse>}
 */
export async function fetchPnlDaily(date) {
  try {
    if (!date) {
      throw new Error("Date parameter is required");
    }
    const data = await api(`/api/pnl/daily?date=${encodeURIComponent(date)}`, {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch daily PnL:", error);
    throw error;
  }
}

/**
 * Fetch overall trading statistics
 * @returns {Promise<StatsResponse>}
 */
export async function fetchPnlStats() {
  try {
    const data = await api("/api/pnl/stats", { method: "GET" });
    return data;
  } catch (error) {
    console.error("Failed to fetch PnL stats:", error);
    throw error;
  }
}

// ============================================
// Custom React Hooks
// ============================================

/**
 * Hook for PnL calendar data
 * @param {string} month - Format: YYYY-MM
 */
export function usePnlCalendar(month) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchPnlCalendar(month);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load calendar");
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [month]);

  const refresh = async () => {
    try {
      const result = await fetchPnlCalendar(month);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to refresh calendar");
    }
  };

  return { data, loading, error, refresh };
}

/**
 * Hook for PnL summary data
 * @param {Object} options - Date range options
 */
export function usePnlSummary({ from, to } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchPnlSummary({ from, to });
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load summary");
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [from, to]);

  const refresh = async () => {
    try {
      const result = await fetchPnlSummary({ from, to });
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to refresh summary");
    }
  };

  return { data, loading, error, refresh };
}

/**
 * Hook for daily PnL data
 * @param {string} date - Format: YYYY-MM-DD
 */
export function usePnlDaily(date) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!date) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchPnlDaily(date);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load daily data");
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [date]);

  const refresh = async () => {
    if (!date) return;
    try {
      const result = await fetchPnlDaily(date);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to refresh daily data");
    }
  };

  return { data, loading, error, refresh };
}

/**
 * Hook for overall PnL stats
 */
export function usePnlStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchPnlStats();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load stats");
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = async () => {
    try {
      const result = await fetchPnlStats();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to refresh stats");
    }
  };

  return { data, loading, error, refresh };
}

// ============================================
// Type Definitions (for reference/JSDoc)
// ============================================

/**
 * @typedef {Object} CalendarResponse
 * @property {string} month - YYYY-MM
 * @property {DayData[]} days - Array of daily data
 * @property {MonthSummary} summary - Monthly summary
 */

/**
 * @typedef {Object} DayData
 * @property {string} date - YYYY-MM-DD
 * @property {number} pnl - Total PnL for the day
 * @property {number} trades - Number of trades
 * @property {number} fees - Total fees
 * @property {number} wins - Winning trades
 * @property {number} losses - Losing trades
 */

/**
 * @typedef {Object} MonthSummary
 * @property {number} totalPnl
 * @property {number} totalFees
 * @property {number} totalTrades
 * @property {number} wins
 * @property {number} losses
 * @property {number} winRate
 */

/**
 * @typedef {Object} SummaryResponse
 * @property {string} from - YYYY-MM-DD
 * @property {string} to - YYYY-MM-DD
 * @property {number} trades
 * @property {number} wins
 * @property {number} losses
 * @property {number} breakeven
 * @property {number} winRate
 * @property {number} totalPnl
 * @property {number} totalFees
 * @property {number} netPnl
 * @property {number} grossProfit
 * @property {number} grossLoss
 * @property {number} avgWin
 * @property {number} avgLoss
 * @property {number} profitFactor
 */

/**
 * @typedef {Object} DailyResponse
 * @property {string} date - YYYY-MM-DD
 * @property {Trade[]} trades
 * @property {DailySummary} summary
 */

/**
 * @typedef {Object} DailySummary
 * @property {number} count
 * @property {number} totalPnl
 * @property {number} totalFees
 * @property {number} netPnl
 * @property {number} wins
 * @property {number} losses
 * @property {number} winRate
 */

/**
 * @typedef {Object} StatsResponse
 * @property {number} totalTrades
 * @property {number} wins
 * @property {number} losses
 * @property {number} winRate
 * @property {number} totalPnl
 * @property {number} totalFees
 * @property {number} netPnl
 * @property {number} avgPnl
 * @property {number} grossProfit
 * @property {number} grossLoss
 * @property {number} avgWin
 * @property {number} avgLoss
 * @property {number} profitFactor
 * @property {number} largestWin
 * @property {number} largestLoss
 * @property {number} tradingDays
 * @property {number} winningDays
 * @property {number} losingDays
 * @property {number} dayWinRate
 */