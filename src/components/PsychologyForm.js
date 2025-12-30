"use client";

import { useMemo, useState } from "react";
import { RULES, PSY_TAGS } from "@/lib/psychology/psychologyConstants";

export default function PsychologyForm({ date, initial, onSave }) {
  const [prePlan, setPrePlan] = useState(initial.prePlan || "");
  const [postReview, setPostReview] = useState(initial.postReview || "");
  const [emotion, setEmotion] = useState(initial.emotion || 3);
  const [discipline, setDiscipline] = useState(initial.discipline || 3);
  const [rules, setRules] = useState(initial.rules || {});
  const [tags, setTags] = useState(initial.tags || []);
  const [saving, setSaving] = useState(false);

  const ruleScore = useMemo(() => {
    const total = RULES.length;
    const ok = RULES.filter(r => rules[r]).length;
    return Math.round((ok / total) * 100);
  }, [rules]);

  function toggleRule(r) {
    setRules(prev => ({ ...prev, [r]: !prev[r] }));
  }

  function toggleTag(t) {
    setTags(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  }

  async function submit() {
    setSaving(true);
    await onSave({
      date,
      prePlan,
      postReview,
      emotion,
      discipline,
      rules,
      tags,
      ruleScore,
    });
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      {/* PRE MARKET */}
      <Section title="Pre-Market Plan">
        <textarea
          value={prePlan}
          onChange={e => setPrePlan(e.target.value)}
          className="input min-h-[90px]"
          placeholder="What is today’s plan? What setups are allowed?"
        />
      </Section>

      {/* POST MARKET */}
      <Section title="Post-Market Reflection">
        <textarea
          value={postReview}
          onChange={e => setPostReview(e.target.value)}
          className="input min-h-[110px]"
          placeholder="What went well? What went wrong?"
        />
      </Section>

      {/* SCORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Score label="Emotional State" value={emotion} onChange={setEmotion} />
        <Score label="Discipline" value={discipline} onChange={setDiscipline} />
      </div>

      {/* RULES */}
      <Section title={`Rules Adherence (${ruleScore}%)`}>
        <div className="space-y-2">
          {RULES.map(r => (
            <label key={r} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!rules[r]}
                onChange={() => toggleRule(r)}
              />
              {r}
            </label>
          ))}
        </div>
      </Section>

      {/* TAGS */}
      <Section title="Psychology Tags">
        <div className="flex flex-wrap gap-2">
          {PSY_TAGS.map(t => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={`px-3 py-1 rounded-xl border text-xs ${
                tags.includes(t)
                  ? "border-emerald-500/40 bg-emerald-500/20"
                  : "border-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Section>

      {/* SAVE */}
      <button
        onClick={submit}
        disabled={saving}
        className={`rounded-xl border px-4 py-3 ${
          saving
            ? "border-slate-800 bg-slate-900/40"
            : "border-emerald-500/30 bg-emerald-500/20 hover:bg-emerald-500/25"
        }`}
      >
        {saving ? "Saving..." : "Save Daily Psychology"}
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-sm text-slate-300 mb-2">{title}</div>
      {children}
    </div>
  );
}

function Score({ label, value, onChange }) {
  return (
    <div>
      <div className="text-sm text-slate-300 mb-2">
        {label}: <span className="text-slate-400">{value}/5</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
