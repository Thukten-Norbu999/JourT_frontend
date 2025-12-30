import { api } from "../apiClient";

/**
 * Expected backend response:
 * {
 *   equityCurve: [{ date: "2025-12-01", equity: 10250 }],
 *   stats: {
 *     totalPnl: 1250,
 *     winRate: 0.57,
 *     avgWin: 120,
 *     avgLoss: -80,
 *     profitFactor: 1.8,
 *     maxDrawdown: -420,
 *     streak: { current: 3, best: 6 }
 *   }
 * }
 */
export function fetchDashboard(range = "30d") {
  return api(`/dashboard?range=${range}`);
}
