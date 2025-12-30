export function mockDashboard() {
  const equityCurve = [];
  let equity = 10000;

  for (let i = 1; i <= 30; i++) {
    equity += Math.round((Math.sin(i / 3) * 120 + 40));
    equityCurve.push({
      date: `2025-12-${String(i).padStart(2, "0")}`,
      equity,
    });
  }

  return {
    equityCurve,
    stats: {
      totalPnl: equity - 10000,
      winRate: 0.58,
      avgWin: 135,
      avgLoss: -82,
      profitFactor: 1.9,
      maxDrawdown: -410,
      streak: { current: 3, best: 6 },
    },
  };
}
