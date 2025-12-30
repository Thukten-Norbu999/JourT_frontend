"use client";

import { useEffect, useMemo, useState } from "react";
import { useSetups } from "@/lib/setups/useSetups";

/**
 * AddTradeModal (backend-integration ready)
 * - UI only (no backend required yet)
 * - Calls onCreate(payload) when you click "Create Trade"
 *
 * Expected payload shape:
 * {
 *   trade: { date, symbol, side, qty, entry, exit, fees, account, session, notes? },
 *   journal: { setupId, thesis, mistakes, lessons, rating, tags: [] },
 *   psychology: { emotion, confidence, executionScore, psyTags: [], rules: {...}, discipline },
 *   metrics: { rMultiple, mae, mfe }
 * }
 */

const SIDE_OPTIONS = ["BUY", "SELL"];
const ACCOUNT_OPTIONS = ["Paper", "Live", "Meme"];
const PSY_TAGS = ["FOMO", "Revenge", "Hesitation", "Overconfidence", "Fear", "Patience", "Discipline"];
const TRADE_RULES = [
  { key: "followedPlan", label: "Followed trading plan" },
  { key: "respectedRisk", label: "Respected risk limits" },
  { key: "waitedConfirmation", label: "Waited for confirmation" },
  { key: "noRevenge", label: "No revenge trading" },
];

export default function AddTradeModal({
  open,
  onClose,
  onCreate, // optional: async (payload) => {}
}) {
  const { setups: setupsList, loading: setupsLoading } = useSetups();

  // Trade
  const [date, setDate] = useState(nowLocalInput());
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState("BUY");
  const [qty, setQty] = useState(1);
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [fees, setFees] = useState("");
  const [account, setAccount] = useState("Paper");
  const [session, setSession] = useState("");
  const [tradeNotes, setTradeNotes] = useState("");

  // Journal
  const [setupId, setSetupId] = useState("");
  const [thesis, setThesis] = useState("");
  const [mistakes, setMistakes] = useState("");
  const [lessons, setLessons] = useState("");
  const [rating, setRating] = useState(0);
  const [tagsText, setTagsText] = useState("");

  // Psychology
  const [emotion, setEmotion] = useState(3);
  const [confidence, setConfidence] = useState(3);
  const [executionScore, setExecutionScore] = useState(3);
  const [psyTags, setPsyTags] = useState([]);
  const [rules, setRules] = useState({
    followedPlan: false,
    respectedRisk: false,
    waitedConfirmation: false,
    noRevenge: false,
  });

  // Metrics (optional)
  const [rMultiple, setRMultiple] = useState("");
  const [mae, setMae] = useState("");
  const [mfe, setMfe] = useState("");

  const [activeTab, setActiveTab] = useState("trade"); // trade | journal | psychology | metrics
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const tags = useMemo(() => {
    return tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12);
  }, [tagsText]);

  const pnlPreview = useMemo(() => {
    const en = num(entry);
    const ex = num(exit);
    const q = Number(qty) || 0;
    const f = num(fees);
    if (!en || !ex || !q) return null;
    const raw = side === "BUY" ? (ex - en) * q : (en - ex) * q;
    return raw - f;
  }, [entry, exit, qty, fees, side]);

  // reset on open
  useEffect(() => {
    if (!open) return;
    setErr("");
    setActiveTab("trade");
    // keep default date as "now" each time opened
    setDate(nowLocalInput());
  }, [open]);

  // close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function toggleRule(key) {
    setRules((r) => ({ ...r, [key]: !r[key] }));
  }

  function togglePsyTag(tag) {
    setPsyTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]));
  }

  function validate() {
    if (!symbol.trim()) return "Symbol is required (e.g. EURUSD, NASDAQ:NVDA).";
    if (!SIDE_OPTIONS.includes(side)) return "Side must be BUY or SELL.";
    if (!(Number(qty) > 0)) return "Quantity must be > 0.";
    if (!date) return "Date/Time is required.";
    // entry/exit can be blank if you want, but it’s better to have at least entry
    if (entry === "" && exit === "") return null;
    if (entry !== "" && Number.isNaN(num(entry))) return "Entry must be a number.";
    if (exit !== "" && Number.isNaN(num(exit))) return "Exit must be a number.";
    if (fees !== "" && Number.isNaN(num(fees))) return "Fees must be a number.";
    return null;
  }

  async function createTrade() {
    setErr("");
    const v = validate();
    if (v) return setErr(v);

    const payload = {
      trade: {
        date: toISOFromLocalInput(date), // backend-friendly ISO
        symbol: symbol.trim(),
        side,
        qty: Number(qty),
        entry: entry === "" ? null : num(entry),
        exit: exit === "" ? null : num(exit),
        fees: fees === "" ? 0 : num(fees),
        account,
        session: session.trim() || null,
        notes: tradeNotes.trim() || null,
      },
      journal: {
        setupId: setupId || null,
        thesis,
        mistakes,
        lessons,
        rating: Number(rating) || 0,
        tags,
      },
      psychology: {
        emotion,
        confidence,
        executionScore,
        psyTags,
        rules,
        discipline: disciplineScoreFromRules(rules),
      },
      metrics: {
        rMultiple: rMultiple === "" ? null : num(rMultiple),
        mae: mae === "" ? null : num(mae),
        mfe: mfe === "" ? null : num(mfe),
      },
    };

    setSaving(true);
    try {
      if (onCreate) await onCreate(payload);
      onClose?.();
    } catch (e) {
      setErr(e?.message || "Failed to create trade (backend not ready / request error).");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />

      {/* modal */}
      <div className="absolute left-1/2 top-1/2 w-[94vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
        {/* header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">Manual Entry</div>
            <div className="text-lg font-semibold text-slate-100 mt-1">Add Trade</div>
            <div className="text-xs text-slate-500 mt-1">
              Fill trade details + optional journal & psychology (backend-ready payload).
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900"
          >
            Close
          </button>
        </div>

        {/* tabs */}
        <div className="px-5 pt-4">
          <TabRow
            value={activeTab}
            onChange={setActiveTab}
            tabs={[
              { key: "trade", label: "Trade" },
              { key: "journal", label: "Journal" },
              { key: "psychology", label: "Psychology" },
              { key: "metrics", label: "Metrics" },
            ]}
          />
        </div>

        {/* body */}
        <div className="px-5 pb-5 pt-4 max-h-[72vh] overflow-auto">
          {err ? (
            <div className="mb-4 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-sm text-rose-200">
              {err}
            </div>
          ) : null}

          {/* TRADE TAB */}
          {activeTab === "trade" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Date/Time">
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input"
                  />
                </Field>

                <Field label="Account">
                  <select value={account} onChange={(e) => setAccount(e.target.value)} className="input">
                    {ACCOUNT_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Session (optional)">
                  <input
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className="input"
                    placeholder="London / NY / Asia..."
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Field label="Symbol">
                  <input
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="input"
                    placeholder="EURUSD / NASDAQ:NVDA / BTCUSD..."
                  />
                </Field>

                <Field label="Side">
                  <select value={side} onChange={(e) => setSide(e.target.value)} className="input">
                    {SIDE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Quantity">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="input"
                  />
                </Field>

                <Field label="Fees">
                  <input
                    value={fees}
                    onChange={(e) => setFees(e.target.value)}
                    className="input"
                    placeholder="0.00"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Entry Price">
                  <input
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    className="input"
                    placeholder="e.g. 1.33321"
                  />
                </Field>

                <Field label="Exit Price">
                  <input
                    value={exit}
                    onChange={(e) => setExit(e.target.value)}
                    className="input"
                    placeholder="e.g. 1.33626"
                  />
                </Field>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-200 font-semibold">PnL Preview</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Uses (Exit - Entry) × Qty (or reverse for SELL) minus Fees.
                    </div>
                  </div>
                  <div
                    className={[
                      "text-sm font-semibold",
                      pnlPreview == null ? "text-slate-500" : pnlPreview >= 0 ? "text-emerald-300" : "text-rose-300",
                    ].join(" ")}
                  >
                    {pnlPreview == null ? "—" : format2(pnlPreview)}
                  </div>
                </div>
              </div>

              <Field label="Notes (optional)">
                <textarea
                  value={tradeNotes}
                  onChange={(e) => setTradeNotes(e.target.value)}
                  className="input min-h-[96px]"
                  placeholder="Quick notes about execution / context..."
                />
              </Field>
            </div>
          ) : null}

          {/* JOURNAL TAB */}
          {activeTab === "journal" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Setup">
                  <select
                    value={setupId}
                    onChange={(e) => setSetupId(e.target.value)}
                    className="input"
                    disabled={setupsLoading}
                  >
                    <option value="">{setupsLoading ? "Loading..." : "— Select —"}</option>
                    {(setupsList || []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Rating">
                  <Segment value={rating} onChange={setRating} labels={["0", "1", "2", "3", "4", "5"]} />
                </Field>
              </div>

              <Field label="Tags (comma separated)">
                <input
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  className="input"
                  placeholder="A+ Setup, Patience, FOMO..."
                />
                {tags.length ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-1 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-200"
                      >
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
                  className="input min-h-[110px]"
                  placeholder="Why did you take this trade? What was the plan?"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Mistakes">
                  <textarea
                    value={mistakes}
                    onChange={(e) => setMistakes(e.target.value)}
                    className="input min-h-[110px]"
                    placeholder="Rule breaks, execution issues..."
                  />
                </Field>

                <Field label="Lessons / Improvements">
                  <textarea
                    value={lessons}
                    onChange={(e) => setLessons(e.target.value)}
                    className="input min-h-[110px]"
                    placeholder="What will you do next time?"
                  />
                </Field>
              </div>
            </div>
          ) : null}

          {/* PSYCHOLOGY TAB */}
          {activeTab === "psychology" ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4 flex items-center justify-between gap-3">
                <div className="text-sm text-slate-200">
                  Discipline{" "}
                  <span className="text-slate-400">{disciplineScoreFromRules(rules)}/100</span>
                </div>
                <div className="text-xs text-slate-500">
                  Emotion {emotion}/5 · Confidence {confidence}/5 · Exec {executionScore}/5
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Segment label="Emotion" value={emotion} onChange={setEmotion} />
                <Segment label="Confidence" value={confidence} onChange={setConfidence} />
                <Segment label="Execution" value={executionScore} onChange={setExecutionScore} />
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
                <div className="text-sm text-slate-200 font-semibold">Psychology Tags</div>
                <div className="text-xs text-slate-500 mt-1">
                  Pick what you felt during the trade (helps spot patterns).
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {PSY_TAGS.map((t) => (
                    <Chip key={t} active={psyTags.includes(t)} onClick={() => togglePsyTag(t)}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-200 font-semibold">Rules Adherence</div>
                  <div className="text-xs text-slate-500">
                    {Object.values(rules || {}).filter(Boolean).length}/{TRADE_RULES.length} checked
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
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
                            : "border-slate-800 bg-slate-950 hover:bg-slate-900/40",
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
          ) : null}

          {/* METRICS TAB */}
          {activeTab === "metrics" ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
                <div className="text-sm text-slate-200 font-semibold">Optional Metrics</div>
                <div className="text-xs text-slate-500 mt-1">
                  Leave blank if you don’t track these yet. Backend-ready fields.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  <Metric label="R Multiple" value={rMultiple} setValue={setRMultiple} placeholder="e.g. 1.5" />
                  <Metric label="MAE" value={mae} setValue={setMae} placeholder="e.g. -25" />
                  <Metric label="MFE" value={mfe} setValue={setMfe} placeholder="e.g. 60" />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* footer */}
        <div className="px-5 py-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Required: <span className="text-slate-300">Symbol, Side, Qty, Date</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-800 px-4 py-2 text-sm hover:bg-slate-900"
              disabled={saving}
            >
              Cancel
            </button>

            <button
              onClick={createTrade}
              disabled={saving}
              className={[
                "rounded-xl border px-4 py-2 text-sm",
                saving
                  ? "border-slate-800 bg-slate-900/30 text-slate-500 cursor-not-allowed"
                  : "border-emerald-500/30 bg-emerald-500/20 hover:bg-emerald-500/25 text-emerald-100",
              ].join(" ")}
            >
              {saving ? "Creating..." : "Create Trade"}
            </button>
          </div>
        </div>
      </div>

      {/* little global style helper for inputs */}
      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          background: rgb(2 6 23 / 1); /* slate-950 */
          border: 1px solid rgb(30 41 59 / 1); /* slate-800 */
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          outline: none;
          color: rgb(226 232 240 / 1); /* slate-200 */
        }
        .input:focus {
          border-color: rgb(71 85 105 / 1); /* slate-600 */
        }
      `}</style>
    </div>
  );
}

/* ---------------- small UI helpers ---------------- */

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div className="text-xs text-slate-400">{label}</div>
        {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function TabRow({ value, onChange, tabs }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={[
              "rounded-xl border px-3 py-2 text-sm transition",
              active
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900/40",
            ].join(" ")}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function Segment({ label, value, onChange, labels }) {
  const options = labels ? labels.map((x) => Number(x)) : [1, 2, 3, 4, 5];

  // Avoid Tailwind dynamic class names (they won’t compile):
  const colsClass = labels ? "grid-cols-6" : "grid-cols-5";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
      {label ? <div className="text-xs text-slate-400 mb-2">{label}</div> : null}

      <div className={`grid ${colsClass} gap-2`}>
        {options.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={[
              "rounded-lg border py-2 text-xs transition",
              Number(n) === Number(value)
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

function Metric({ label, value, setValue, placeholder }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="input"
        inputMode="decimal"
      />
    </div>
  );
}

/* ---------------- helpers ---------------- */

function disciplineScoreFromRules(rules = {}) {
  const keys = Object.keys(rules);
  if (!keys.length) return 0;
  const ok = keys.filter((k) => !!rules[k]).length;
  return Math.round((ok / keys.length) * 100);
}

function num(v) {
  const n = Number(String(v ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function format2(n) {
  const x = Math.round(n * 100) / 100;
  return x >= 0 ? `+${x.toFixed(2)}` : x.toFixed(2);
}

function nowLocalInput() {
  // datetime-local expects "YYYY-MM-DDTHH:mm"
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function toISOFromLocalInput(v) {
  // v like "2025-12-22T10:30"
  // interpret as local time, convert to ISO string
  const d = new Date(v);
  return d.toISOString();
}
