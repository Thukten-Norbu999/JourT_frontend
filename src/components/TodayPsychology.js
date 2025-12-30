export default function TodayPsychology() {
  // backend-ready: GET /psychology/today
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
      <div className="text-sm text-slate-300">Today’s Psychology</div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Discipline</span>
          <span className="text-slate-500">—</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Emotional state</span>
          <span className="text-slate-500">Not logged</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Rules broken</span>
          <span className="text-slate-500">—</span>
        </div>
      </div>

      <a
        href="/psychology"
        className="mt-4 inline-block text-xs text-emerald-300 hover:underline"
      >
        Fill today’s journal →
      </a>
    </div>
  );
}
