import { api } from "../apiClient";

/**
 * POST /backtest/run
 * body:
 * {
 *   strategy: "ema-crossover",
 *   symbol: "EURUSD",
 *   timeframe: "M15",
 *   from: "2024-01-01",
 *   to: "2024-12-31",
 *   params: { fast: 20, slow: 50, risk: 1 }
 * }
 */
export function runBacktest(payload) {
  return api("/backtest/run", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
