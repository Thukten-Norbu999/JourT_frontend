export function mockRecentTrades() {
  return [
    {
      id: "t1",
      symbol: "EURUSD",
      side: "BUY",
      pnl: 120.5,
      journal: {},
    },
    {
      id: "t2",
      symbol: "XAUUSD",
      side: "SELL",
      pnl: -80.0,
      journal: {
        setup: "Reversal",
      },
    },
    {
      id: "t3",
      symbol: "GBPUSD",
      side: "BUY",
      pnl: 65.0,
      journal: {},
    },
  ];
}
