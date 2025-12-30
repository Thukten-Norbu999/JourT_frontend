const KEY = "jourt_setups_fallback";

export function fallbackGetSetups() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (raw) return JSON.parse(raw);

  const defaults = [
    { id: "london-breakout", name: "London Breakout" },
    { id: "ny-continuation", name: "NY Continuation" },
    { id: "reversal", name: "Reversal" },
  ];
  localStorage.setItem(KEY, JSON.stringify(defaults));
  return defaults;
}

export function fallbackSaveSetups(setups) {
  localStorage.setItem(KEY, JSON.stringify(setups));
}
