export function mockPnlCalendar(month = "2025-12") {
  const days = [];

  for (let d = 1; d <= 31; d++) {
    const date = `${month}-${String(d).padStart(2, "0")}`;
    const pnl =
      Math.round((Math.sin(d) * 180 + (d % 4 === 0 ? -120 : 90)) * 10) / 10;

    days.push({
      date,
      pnl,
      trades: Math.max(0, Math.floor(Math.abs(pnl) / 70)),
    });
  }

  return { month, days };
}
