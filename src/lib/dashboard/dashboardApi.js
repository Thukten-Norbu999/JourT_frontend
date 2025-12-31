// lib/dashboardApi.js
import { api } from "@/lib/apiClient";
import { useState, useEffect } from "react";

/**
 * Fetch dashboard data for a given time range
 * @param {string} range - Time range: "7d", "30d", "90d", "365d", "all"
 * @returns {Promise<DashboardData>}
 * 
 * Expected backend response:
 * {
 *   stats: {
 *     totalPnl: 1250,
 *     totalTrades: 45,
 *     winRate: 0.57,
 *     avgWin: 120,
 *     avgLoss: -80,
 *     profitFactor: 1.8,
 *     maxDrawdown: -420,
 *     grossProfit: 2500,
 *     grossLoss: -1250,
 *     totalFees: 150,
 *     netPnl: 1100,
 *     wins: 25,
 *     losses: 18,
 *     breakeven: 2,
 *     streak: { current: 3, best: 6 }
 *   },
 *   equityCurve: [
 *     { date: "2025-12-01", equity: 10250 },
 *     { date: "2025-12-02", equity: 10380 }
 *   ],
 *   recentTrades: [
 *     {
 *       id: "uuid",
 *       date: "2025-12-15T10:30:00Z",
 *       symbol: "AAPL",
 *       side: "BUY",
 *       qty: 100,
 *       entry: 150.25,
 *       exit: 152.80,
 *       pnl: 255.00,
 *       fees: 2.50
 *     }
 *   ]
 * }
 */
export async function fetchDashboard(range = "30d") {
  try {
    const data = await api(`/api/dashboard?range=${encodeURIComponent(range)}`, {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch dashboard:", error);
    throw error;
  }
}

/**
 * Custom hook for dashboard data
 * @param {string} range - Time range: "7d", "30d", "90d", "365d", "all"
 * @returns {Object} { data, loading, error, refresh }
 */
export function useDashboard(range = "30d") {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchDashboard(range);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load dashboard");
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
  }, [range]);

  const refresh = async () => {
    try {
      setLoading(true);
      const result = await fetchDashboard(range);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to refresh dashboard");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh };
}

/**
 * Get dashboard summary (quick stats without full data)
 * @param {string} range - Optional time range, defaults to "30d"
 * @returns {Promise<DashboardSummary>}
 */
export async function fetchDashboardSummary(range = "30d") {
  try {
    const data = await fetchDashboard(range);
    return {
      totalPnl: data?.stats?.totalPnl ?? 0,
      totalTrades: data?.stats?.totalTrades ?? 0,
      winRate: data?.stats?.winRate ?? 0,
      currentStreak: data?.stats?.streak?.current ?? 0,
      bestStreak: data?.stats?.streak?.best ?? 0,
      wins: data?.stats?.wins ?? 0,
      losses: data?.stats?.losses ?? 0,
      profitFactor: data?.stats?.profitFactor ?? 0,
      maxDrawdown: data?.stats?.maxDrawdown ?? 0,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard summary:", error);
    return {
      totalPnl: 0,
      totalTrades: 0,
      winRate: 0,
      currentStreak: 0,
      bestStreak: 0,
      wins: 0,
      losses: 0,
      profitFactor: 0,
      maxDrawdown: 0,
    };
  }
}

/**
 * Custom hook for dashboard summary
 * @param {string} range - Time range
 * @returns {Object} { summary, loading, error, refresh }
 */
export function useDashboardSummary(range = "30d") {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchDashboardSummary(range);
        if (!cancelled) {
          setSummary(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load summary");
          setSummary(null);
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
  }, [range]);

  const refresh = async () => {
    try {
      setLoading(true);
      const result = await fetchDashboardSummary(range);
      setSummary(result);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to refresh summary");
    } finally {
      setLoading(false);
    }
  };

  return { summary, loading, error, refresh };
}

// ============================================
// Type Definitions (for JSDoc/IDE support)
// ============================================

/**
 * @typedef {Object} DashboardData
 * @property {DashboardStats} stats
 * @property {EquityPoint[]} equityCurve
 * @property {RecentTrade[]} recentTrades
 */

/**
 * @typedef {Object} DashboardStats
 * @property {number} totalPnl
 * @property {number} totalTrades
 * @property {number} winRate
 * @property {number} avgWin
 * @property {number} avgLoss
 * @property {number} profitFactor
 * @property {number} maxDrawdown
 * @property {number} grossProfit
 * @property {number} grossLoss
 * @property {number} totalFees
 * @property {number} netPnl
 * @property {number} wins
 * @property {number} losses
 * @property {number} breakeven
 * @property {Streak} streak
 */

/**
 * @typedef {Object} Streak
 * @property {number} current
 * @property {number} best
 */

/**
 * @typedef {Object} EquityPoint
 * @property {string} date - Format: YYYY-MM-DD
 * @property {number} equity
 */

/**
 * @typedef {Object} RecentTrade
 * @property {string} id
 * @property {string} date
 * @property {string} symbol
 * @property {string} side
 * @property {number} qty
 * @property {number} entry
 * @property {number} exit
 * @property {number} pnl
 * @property {number} fees
 */

/**
 * @typedef {Object} DashboardSummary
 * @property {number} totalPnl
 * @property {number} totalTrades
 * @property {number} winRate
 * @property {number} currentStreak
 * @property {number} bestStreak
 * @property {number} wins
 * @property {number} losses
 * @property {number} profitFactor
 * @property {number} maxDrawdown
 */