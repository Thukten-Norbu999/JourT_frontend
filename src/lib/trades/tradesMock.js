export function mockTrades(date) {
  const d = date || "2025-12-15";
  return [
    {
      id: "t1",
      date: d,
      symbol: "EURUSD",
      side: "BUY",
      qty: 1,
      entry: 1.0832,
      exit: 1.0861,
      pnl: 120.5,
      journal: {
        setup: "London Breakout",
        rating: 4,
        tags: ["A+ Setup", "Patience"],
        thesis: "Break + retest of session high",
        emotions: "Calm",
        mistakes: "None",
        lessons: "Waited for confirmation",
      },
    },
    {
      id: "t2",
      date: d,
      symbol: "XAUUSD",
      side: "SELL",
      qty: 0.5,
      entry: 2038.2,
      exit: 2041.0,
      pnl: -80.0,
      journal: {
        setup: "Reversal",
        rating: 2,
        tags: ["FOMO"],
        thesis: "",
        emotions: "Impatient",
        mistakes: "Late entry",
        lessons: "Stick to plan",
      },
    },
  ];
}
