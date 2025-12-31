// FILE: /components/TradeDrawer.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSetups } from "@/lib/setups/useSetups";

const TRADE_RULES = [
  { key: "followedPlan", label: "Followed trading plan" },
  { key: "respectedRisk", label: "Respected risk limits" },
  { key: "waitedConfirmation", label: "Waited for confirmation" },
  { key: "noRevenge", label: "No revenge trading" },
];

const PSY_TAGS = ["FOMO", "Revenge", "Hesitation", "Overconfidence", "Fear", "Patience", "Discipline"];

export default function TradeDrawer({ trade, open, onClose, onSave }) {
  const j0 = useMemo(() => trade?.Journal || trade?.journal || {}, [trade]);
  const { setups: setupsList, loading: setupsLoading } = useSetups();

  // Journal
  const [setup, setSetup] = useState(j0.Setup || j0.setup || "");
  const [thesis, setThesis] = useState(j0.Thesis || j0.thesis || "");
  const [mistakes, setMistakes] = useState(j0.Mistakes || j0.mistakes || "");
  const [lessons, setLessons] = useState(j0.Lessons || j0.lessons || "");
  const [rating, setRating] = useState(Number(j0.Rating ?? j0.rating ?? 0));
  const [tagsText, setTagsText] = useState(csvToText(j0.Tags ?? j0.tags ?? ""));

  // Psychology
  const p0 = j0.Psychology || j0.psychology || {};
  const [emotion, setEmotion] = useState(Number(p0.Emotion ?? p0.emotion ?? 3));
  const [confidence, setConfidence] = useState(Number(p0.Confidence ?? p0.confidence ?? 3));
  const [executionScore, setExecutionScore] = useState(Number(p0.ExecutionScore ?? p0.executionScore ?? 3));
  const [psyTags, setPsyTags] = useState(csvToArray(p0.PsyTags ?? p0.psyTags ?? ""));

  const [rules, setRules] = useState({
    followedPlan: !!(p0.FollowedPlan ?? p0.followedPlan ?? false),
    respectedRisk: !!(p0.RespectedRisk ?? p0.respectedRisk ?? false),
    waitedConfirmation: !!(p0.WaitedConfirmation ?? p0.waitedConfirmation ?? false),
    noRevenge: !!(p0.NoRevenge ?? p0.noRevenge ?? false),
    ...(p0.rules || {}),
  });

  // Metrics
  const m0 = j0.Metrics || j0.metrics || {};
  const [rMultiple, setRMultiple] = useState(Number(m0.RMultiple ?? m0.rMultiple ?? 0));
  const [mae, setMae] = useState(Number(m0.MAE ?? m0.mae ?? 0));
  const [mfe, setMfe] = useState(Number(m0.MFE ?? m0.mfe ?? 0));

  // Screenshots
  const s0 = j0.Screenshots || j0.screenshots || {};
  const [shotBefore, setShotBefore] = useState(s0.Before ?? s0.before ?? null);
  const [shotAfter, setShotAfter] = useState(s0.After ?? s0.after ?? null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !trade) return;

    const j = trade?.Journal || trade?.journal || {};
    const p = j?.Psychology || j?.psychology || {};
    const m = j?.Metrics || j?.metrics || {};
    const s = j?.Screenshots || j?.screenshots || {};

    setSetup(j.Setup || j.setup || "");
    setThesis(j.Thesis || j.thesis || "");
    setMistakes(j.Mistakes || j.mistakes || "");
    setLessons(j.Lessons || j.lessons || "");
    setRating(Number(j.Rating ?? j.rating ?? 0));
    setTagsText(csvToText(j.Tags ?? j.tags ?? ""));

    setEmotion(Number(p.Emotion ?? p.emotion ?? 3));
    setConfidence(Number(p.Confidence ?? p.confidence ?? 3));
    setExecutionScore(Number(p.ExecutionScore ?? p.executionScore ?? 3));
    setPsyTags(csvToArray(p.PsyTags ?? p.psyTags ?? ""));

    setRules({
      followedPlan: !!(p.FollowedPlan ?? p.followedPlan ?? false),
      respectedRisk: !!(p.RespectedRisk ?? p.respectedRisk ?? false),
      waitedConfirmation: !!(p.WaitedConfirmation ?? p.waitedConfirmation ?? false),
      noRevenge: !!(p.NoRevenge ?? p.noRevenge ?? false),
      ...(p.rules || {}),
    });

    setRMultiple(Number(m.RMultiple ?? m.rMultiple ?? 0));
    setMae(Number(m.MAE ?? m.mae ?? 0));
    setMfe(Number(m.MFE ?? m.mfe ?? 0));

    setShotBefore(s.Before ?? s.before ?? null);
    setShotAfter(s.After ?? s.after ?? null);
  }, [trade?.id, open]);

  if (!open || !trade) return null;

  const tags = tagsText
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);

  function toggleRule(key) {
    setRules((r) => ({ ...r, [key]: !r[key] }));
  }

  function togglePsyTag(tag) {
    setPsyTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave?.({
        setup,
        thesis,
        mistakes,
        lessons,
        rating,
        tags,
        psychology: {
          emotion,
          confidence,
          executionScore,
          psyTags,
          rules,
          discipline: disciplineScoreFromRules(rules),
        },
        metrics: {
          rMultiple,
          mae,
          mfe,
        },
        screenshots: {
          before: shotBefore,
          after: shotAfter,
        },
      });
    } finally {
      setSaving(false);
    }
  }

  const pnl = Number(trade?.pnl ?? trade?.PnL ?? 0);
  const pnlGood = Number.isFinite(pnl) ? pnl >= 0 : true;

  return (
    <div className="fixed inset-0 z-50">
      <div onClick={onClose} className="absolute inset-0 bg-black/50" />

      <div className="absolute right-0 top-0 h-full w-full sm:w-[560px] bg-slate-950 border-l border-slate-800 flex flex-col overflow-hidden">
        {/* Scrollable container for entire drawer */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950">
            <div>
              <div className="text-xs text-slate-400">Trade Journal</div>
              <div className="text-lg font-semibold mt-1">
                {String(trade?.symbol || trade?.Symbol || "—")} · {String(trade?.side || trade?.Side || "—")} ·{" "}
                <span className={pnlGood ? "text-emerald-300" : "text-rose-300"}>
                  {Number.isFinite(pnl) ? (pnlGood ? "+" : "") + pnl.toFixed(2) : "—"}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {String(trade?.date || trade?.Date || "—")} · Entry {String(trade?.entry ?? trade?.Entry ?? "—")} · Exit{" "}
                {String(trade?.exit ?? trade?.Exit ?? "—")} · Qty {String(trade?.qty ?? trade?.Qty ?? "—")}
              </div>
            </div>

            <button onClick={onClose} className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900">
              Close
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-400 mb-1">Setup</div>
                <select
                  value={setup}
                  onChange={(e) => setSetup(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
                >
                  <option value="">{setupsLoading ? "Loading setups..." : "— Select setup —"}</option>
                  {(setupsList || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-xs text-slate-400 mb-1">Rating</div>
                <Segment6 value={rating || 0} onChange={setRating} />
              </div>
            </div>

            <Field label="Tags (comma separated)">
              <input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
                placeholder="A+ Setup, FOMO, Patience..."
              />
              {tags.length ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((t) => (
                    <span key={t} className="text-xs px-2 py-1 rounded-lg border border-slate-800 bg-slate-900/40">
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </Field>

            <Field label="Thesis / Plan">
              <textarea
                value={thesis}
                onChange={(e) => setThesis(e.target.value)}
                className="w-full min-h-[90px] rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
              />
            </Field>

            <Field label="Mistakes">
              <textarea
                value={mistakes}
                onChange={(e) => setMistakes(e.target.value)}
                className="w-full min-h-[80px] rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
              />
            </Field>

            <Field label="Lessons / Improvements">
              <textarea
                value={lessons}
                onChange={(e) => setLessons(e.target.value)}
                className="w-full min-h-[80px] rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
              />
            </Field>

            <Collapsible title="Psychology" defaultOpen>
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-3 flex items-center justify-between">
                  <div className="text-sm text-slate-200">
                    Discipline <span className="text-slate-400">{disciplineScoreFromRules(rules)}/100</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Emotion {emotion}/5 · Confidence {confidence}/5 · Exec {executionScore}/5
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Segment5 label="Emotion" value={emotion} onChange={setEmotion} />
                  <Segment5 label="Confidence" value={confidence} onChange={setConfidence} />
                  <Segment5 label="Execution" value={executionScore} onChange={setExecutionScore} />
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-2">Psychology tags</div>
                  <div className="flex flex-wrap gap-2">
                    {PSY_TAGS.map((t) => (
                      <Chip key={t} active={psyTags.includes(t)} onClick={() => togglePsyTag(t)}>
                        {t}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-slate-400">Rules adherence</div>
                    <div className="text-xs text-slate-500">
                      {Object.values(rules || {}).filter(Boolean).length}/{TRADE_RULES.length} checked
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {TRADE_RULES.map((r) => {
                      const ok = !!rules?.[r.key];
                      return (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => toggleRule(r.key)}
                          className={[
                            "text-left rounded-xl border p-3 transition",
                            ok
                              ? "border-emerald-500/30 bg-emerald-500/10"
                              : "border-slate-800 bg-slate-900/20 hover:bg-slate-900/40",
                          ].join(" ")}
                        >
                          <div className="text-sm text-slate-200 flex items-center justify-between">
                            <span>{r.label}</span>
                            <span
                              className={[
                                "text-xs px-2 py-0.5 rounded-lg border",
                                ok ? "border-emerald-500/30 text-emerald-200" : "border-slate-700 text-slate-500",
                              ].join(" ")}
                            >
                              {ok ? "Yes" : "No"}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">Tap to toggle</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Collapsible>

            <Collapsible title="Metrics (optional)" defaultOpen={false}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Metric label="R Multiple" value={rMultiple} setValue={setRMultiple} />
                <Metric label="MAE" value={mae} setValue={setMae} />
                <Metric label="MFE" value={mfe} setValue={setMfe} />
              </div>
              <div className="text-xs text-slate-500 mt-2">Leave blank if you don't track these yet.</div>
            </Collapsible>

            <Collapsible title="Screenshots (later backend)" defaultOpen={false}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ShotCard title="Before" value={shotBefore} setValue={setShotBefore} hint="Paste a URL for now." />
                <ShotCard title="After" value={shotAfter} setValue={setShotAfter} hint="Paste a URL for now." />
              </div>
            </Collapsible>
          </div>
        </div>

        {/* Footer - Sticky at bottom */}
        <div className="sticky bottom-0 p-5 border-t border-slate-800 bg-slate-950 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={[
              "flex-1 rounded-xl border px-4 py-3",
              saving
                ? "border-slate-800 bg-slate-900/40 text-slate-400 cursor-not-allowed"
                : "border-emerald-500/30 bg-emerald-500/20 hover:bg-emerald-500/25",
            ].join(" ")}
          >
            {saving ? "Saving..." : "Save Journal"}
          </button>

          <button onClick={onClose} className="rounded-xl border border-slate-800 px-4 py-3 hover:bg-slate-900">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      {children}
    </div>
  );
}

function Collapsible({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-slate-800 pt-4">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between">
        <div className="text-sm text-slate-300">{title}</div>
        <div className="text-xs text-slate-500">{open ? "Hide" : "Show"}</div>
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

function Segment5({ label, value, onChange }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-3">
      {label ? <div className="text-xs text-slate-400 mb-2">{label}</div> : null}
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={[
              "rounded-lg border py-2 text-xs transition",
              n === value
                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                : "border-slate-800 bg-slate-950 hover:bg-slate-900/50 text-slate-300",
            ].join(" ")}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function Segment6({ value, onChange }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-3">
      <div className="grid grid-cols-6 gap-2">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={[
              "rounded-lg border py-2 text-xs transition",
              n === value
                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                : "border-slate-800 bg-slate-950 hover:bg-slate-900/50 text-slate-300",
            ].join(" ")}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-1 rounded-xl border text-xs transition",
        active
          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
          : "border-slate-800 bg-slate-950 hover:bg-slate-900/40 text-slate-300",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Metric({ label, value, setValue }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <input
        type="number"
        step="0.01"
        value={Number.isFinite(Number(value)) ? value : 0}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
      />
    </div>
  );
}

function ShotCard({ title, value, setValue, hint }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-3">
      <div className="text-sm text-slate-200">{title}</div>
      <div className="text-xs text-slate-500 mt-1">{hint}</div>
      <input
        value={value || ""}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://..."
        className="mt-3 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm"
      />
    </div>
  );
}

function disciplineScoreFromRules(rules = {}) {
  const keys = Object.keys(rules);
  if (!keys.length) return 0;
  const ok = keys.filter((k) => !!rules[k]).length;
  return Math.round((ok / keys.length) * 100);
}

function csvToArray(v) {
  if (Array.isArray(v)) return v.map(String).map((x) => x.trim()).filter(Boolean);
  return String(v || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function csvToText(v) {
  if (Array.isArray(v)) return v.join(", ");
  return String(v || "");
}