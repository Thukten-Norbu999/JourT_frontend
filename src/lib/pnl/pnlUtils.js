export function pnlStats(days) {
  const wins = days.filter(d => d.pnl > 0);
  const losses = days.filter(d => d.pnl < 0);

  const best = wins.reduce((a, b) => (b.pnl > a.pnl ? b : a), wins[0]);
  const worst = losses.reduce((a, b) => (b.pnl < a.pnl ? b : a), losses[0]);

  return {
    total: days.reduce((s, d) => s + d.pnl, 0),
    winDays: wins.length,
    lossDays: losses.length,
    bestDay: best,
    worstDay: worst,
  };
}

export function streaks(days) {
  let cur = 0;
  let best = 0;

  for (const d of days) {
    if (d.pnl > 0) {
      cur++;
      best = Math.max(best, cur);
    } else {
      cur = 0;
    }
  }

  return { current: cur, best };
}

export function byWeekday(days) {
  const map = {};
  days.forEach(d => {
    const w = new Date(d.date).toLocaleDateString("en-US", { weekday: "short" });
    map[w] = (map[w] || 0) + d.pnl;
  });
  return map;
}
