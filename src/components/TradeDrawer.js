"use client";

import { useEffect, useMemo, useState } from "react";
import { useSetups } from "@/lib/setups/useSetups";

// Trade-level psychology rules (per trade)
const TRADE_RULES = [
  { key: "followedPlan", label: "Followed trading plan" },
  { key: "respectedRisk", label: "Respected risk limits" },
  { key: "waitedConfirmation", label: "Waited for confirmation" },
  { key: "noRevenge", label: "No revenge trading" },
];

// Psychology tags
const PSY_TAGS = [
  "FOMO",
  "Revenge",
  "Hesitation",
  "Overconfidence",
  "Fear",
  "Patience",
  "Discipline",
];

export default function TradeDrawer({ trade, open, onClose, onSave }) {
  const initial = useMemo(() => trade?.journal || {}, [trade]);
  const { setups: setupsList, loading: setupsLoading } = useSetups();

  // Core journal fields
  // NOTE: setup stores setupId (backend)
  const [setup, setSetup] = useState(initial.setup || "");
  const [thesis, setThesis] = useState(initial.thesis || "");
  const [mistakes, setMistakes] = useState(initial.mistakes || "");
  const [lessons, setLessons] = useState(initial.lessons || "");
  const [rating, setRating] = useState(initial.rating || 0);
  const [tagsText, setTagsText] = useState((initial.tags || []).join(", "));

  // Psychology (inside trade journal)
  const [emotion, setEmotion] = useState(initial.psychology?.emotion ?? 3);
  const [confidence, setConfidence] = useState(initial.psychology?.confidence ?? 3);
  const [executionScore, setExecutionScore] = useState(
    initial.psychology?.executionScore ?? 3
  );
  const [psyTags, setPsyTags] = useState(initial.psychology?.psyTags ?? []);
  const [rules, setRules] = useState(
    initial.psychology?.rules ?? {
      followedPlan: false,
      respectedRisk: false,
      waitedConfirmation: false,
      noRevenge: false,
    }
  );

  // Metrics (optional but backend-ready)
  const [rMultiple, setRMultiple] = useState(initial.metrics?.rMultiple ?? 0);
  const [mae, setMae] = useState(initial.metrics?.mae ?? 0);
  const [mfe, setMfe] = useState(initial.metrics?.mfe ?? 0);

  // Screenshots (placeholder UI)
  const [shotBefore, setShotBefore] = useState(initial.screenshots?.before ?? null);
  const [shotAfter, setShotAfter] = useState(initial.screenshots?.after ?? null);

  const [saving, setSaving] = useState(false);

  // ✅ Correct reset when a new trade opens (useEffect, not useMemo)
  useEffect(() => {
    if (!open || !trade) return;
    const j = trade.journal || {};

    setSetup(j.setup || ""); // setupId
    setThesis(j.thesis || "");
    setMistakes(j.mistakes || "");
    setLessons(j.lessons || "");
    setRating(j.rating || 0);
    setTagsText((j.tags || []).join(", "));

    setEmotion(j.psychology?.emotion ?? 3);
    setConfidence(j.psychology?.confidence ?? 3);
    setExecutionScore(j.psychology?.executionScore ?? 3);
    setPsyTags(j.psychology?.psyTags ?? []);
    setRules(
      j.psychology?.rules ?? {
        followedPlan: false,
        respectedRisk: false,
        waitedConfirmation: false,
        noRevenge: false,
      }
    );

    setRMultiple(j.metrics?.rMultiple ?? 0);
    setMae(j.metrics?.mae ?? 0);
    setMfe(j.metrics?.mfe ?? 0);

    setShotBefore(j.screenshots?.before ?? null);
    setShotAfter(j.screenshots?.after ?? null);
  }, [trade?.id, open]); // eslint-disable-line react-hooks/exhaustive-deps

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
      await onSave({
        setup, // setupId from backend
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

  const pnlGood = trade.pnl >= 0;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/50" />

      {/* panel */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-[560px] bg-slate-950 border-l border-slate-800">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between">
          <div>
            <div className="text-xs text-slate-400">Trade Journal</div>
            <div className="text-lg font-semibold mt-1">
              {trade.symbol} · {trade.side} ·{" "}
              <span className={pnlGood ? "text-emerald-300" : "text-rose-300"}>
                {pnlGood ? "+" : ""}
                {trade.pnl.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {trade.date} · Entry {trade.entry} · Exit {trade.exit} · Qty {trade.qty}
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-auto h-[calc(100%-148px)]">
          {/* Setup + Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-400 mb-1">Setup</div>
              <select
                value={setup}
                onChange={(e) => setSetup(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
              >
                <option value="">
                  {setupsLoading ? "Loading setups..." : "— Select setup —"}
                </option>
                {setupsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="text-[11px] text-slate-500 mt-1">
                Manage setups from your “Manage Setups” modal (backend).
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-1">Rating</div>
              <Segment6 value={rating || 0} onChange={setRating} />
            </div>
          </div>

          {/* Tags */}
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
                  <span
                    key={t}
                    className="text-xs px-2 py-1 rounded-lg border border-slate-800 bg-slate-900/40"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </Field>

          {/* Core journal */}
          <Field label="Thesis / Plan">
            <textarea
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              className="w-full min-h-[90px] rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
              placeholder="Why did you take this trade?"
            />
          </Field>

          <Field label="Mistakes">
            <textarea
              value={mistakes}
              onChange={(e) => setMistakes(e.target.value)}
              className="w-full min-h-[80px] rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
              placeholder="Rule breaks, execution issues..."
            />
          </Field>

          <Field label="Lessons / Improvements">
            <textarea
              value={lessons}
              onChange={(e) => setLessons(e.target.value)}
              className="w-full min-h-[80px] rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
              placeholder="What will you do next time?"
            />
          </Field>

          {/* Psychology (better UX) */}
          <Collapsible title="Psychology" defaultOpen>
            <div className="space-y-4">
              {/* Summary */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-3 flex items-center justify-between">
                <div className="text-sm text-slate-200">
                  Discipline{" "}
                  <span className="text-slate-400">
                    {disciplineScoreFromRules(rules)}/100
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Emotion {emotion}/5 · Confidence {confidence}/5 · Exec {executionScore}/5
                </div>
              </div>

              {/* Segmented controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Segment5 label="Emotion" value={emotion} onChange={setEmotion} />
                <Segment5 label="Confidence" value={confidence} onChange={setConfidence} />
                <Segment5 label="Execution" value={executionScore} onChange={setExecutionScore} />
              </div>

              {/* Psychology tags */}
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

              {/* Rules */}
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
                              ok
                                ? "border-emerald-500/30 text-emerald-200"
                                : "border-slate-700 text-slate-500",
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

          {/* Metrics */}
          <Collapsible title="Metrics (optional)" defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Metric label="R Multiple" value={rMultiple} setValue={setRMultiple} />
              <Metric label="MAE" value={mae} setValue={setMae} />
              <Metric label="MFE" value={mfe} setValue={setMfe} />
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Leave these blank for now if you don’t track them yet.
            </div>
          </Collapsible>

          {/* Screenshots (placeholder UI) */}
          <Collapsible title="Screenshots (later backend)" defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ShotCard
                title="Before"
                value={shotBefore}
                setValue={setShotBefore}
                hint="Paste a URL for now (later: file upload)."
              />
              <ShotCard
                title="After"
                value={shotAfter}
                setValue={setShotAfter}
                hint="Paste a URL for now (later: file upload)."
              />
            </div>
          </Collapsible>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-800 flex gap-3">
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

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-800 px-4 py-3 hover:bg-slate-900"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- small UI helpers (kept inside same file) ---------- */

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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between"
      >
        <div className="text-sm text-slate-300">{title}</div>
        <div className="text-xs text-slate-500">{open ? "Hide" : "Show"}</div>
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

// 1–5 segmented control
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

// 0–5 segmented control for rating
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
        value={value}
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
