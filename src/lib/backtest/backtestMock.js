export function mockBacktest() {
  return {
    summary: {
      trades: 128,
      winRate: 0.56,
      totalPnl: 1840,
      profitFactor: 1.7,
      maxDrawdown: -620,
    },
    equity: Array.from({ length: 50 }).map((_, i) => ({
      x: i,
      equity: 10000 + i * 60 + Math.sin(i / 4) * 180,
    })),
    trades: Array.from({ length: 20 }).map((_, i) => ({
      id: i + 1,
      date: `2024-03-${String(i + 1).padStart(2, "0")}`,
      symbol: "EURUSD",
      side: i % 2 === 0 ? "BUY" : "SELL",
      pnl: i % 3 === 0 ? -40 : 85,
    })),
  };
}
