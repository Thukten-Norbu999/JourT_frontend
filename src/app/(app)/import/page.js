"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { parseCSV } from "@/lib/import/csv";
import { importTrades } from "@/lib/import/importApi";

/**
 * UPDATED (one-go, broker-safe)
 * Fixes:
 * - Duplicate header names => React key errors (Markets, etc.)
 * - Robust CSV parsing handled in parseCSV (quotes, delimiters, etc.)
 * - AutoMap works even when headers become "X (2)"
 * - normalizeRow no longer references missing placingTime/closingTime fields
 */

const REQUIRED_FIELDS = [
  { key: "date", label: "Date/Time", hints: ["closing time", "placing time", "time", "date", "filled", "executed"] },
  { key: "symbol", label: "Symbol", hints: ["symbol", "ticker", "instrument", "product"] },
  { key: "side", label: "Side", hints: ["side", "buy/sell", "direction", "action"] },
  { key: "qty", label: "Quantity", hints: ["qty", "quantity", "size", "volume", "units"] },
];

const OPTIONAL_FIELDS = [
  { key: "entry", label: "Entry Price", hints: ["entry", "avg entry", "open price"] },
  { key: "exit", label: "Exit Price", hints: ["exit", "avg exit", "close price"] },
  { key: "price", label: "Single Price (Fill Price)", hints: ["fill price", "filled price", "price", "avg price", "average price"] },

  { key: "fees", label: "Fees / Commission", hints: ["commission", "fee", "fees", "swap"] },
  { key: "pnl", label: "PnL (if exists)", hints: ["pnl", "profit", "pl", "net pnl"] },

  { key: "status", label: "Status", hints: ["status", "state"] },
  { key: "type", label: "Order Type", hints: ["type", "order type"] },
  { key: "orderId", label: "Order ID", hints: ["order id", "id", "orderid"] },
];

const STEP = {
  UPLOAD: 1,
  MAP: 2,
  REVIEW: 3,
  IMPORT: 4,
};

export default function ImportPage() {
  const inputRef = useRef(null);

  const [step, setStep] = useState(STEP.UPLOAD);

  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const [mapping, setMapping] = useState({});
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [importing, setImporting] = useState(false);

  // options
  const [filledOnly, setFilledOnly] = useState(true);
  const [singlePriceMode, setSinglePriceMode] = useState(true);
  const [preferClosingTime, setPreferClosingTime] = useState(true); // UI-only hint (no broken fields)

  // UX
  const [headerSearch, setHeaderSearch] = useState("");
  const [showRawPreview, setShowRawPreview] = useState(false);

  const previewRaw = useMemo(() => rows.slice(0, 25), [rows]);

  const mappingComplete = useMemo(() => {
    return REQUIRED_FIELDS.every((f) => mapping[f.key]);
  }, [mapping]);

  const mappedRows = useMemo(() => {
    if (!rows.length || !mappingComplete) return [];
    return rows.slice(0, 300).map((r) => normalizeRow(r, mapping));
  }, [rows, mapping, mappingComplete]);

  const filteredMappedRows = useMemo(() => {
    if (!mappedRows.length) return [];
    if (!filledOnly) return mappedRows;

    return mappedRows.filter((t) => {
      const st = String(t.status || "").toLowerCase();
      if (!st) return true;
      return st.includes("filled");
    });
  }, [mappedRows, filledOnly]);

  const validation = useMemo(() => {
    if (!filteredMappedRows.length) return null;

    let invalidDate = 0;
    let invalidSide = 0;
    let zeroQty = 0;
    let missingPrice = 0;

    for (const t of filteredMappedRows.slice(0, 300)) {
      if (!t.date || !isValidDateLike(t.date)) invalidDate += 1;
      if (!["BUY", "SELL"].includes(t.side)) invalidSide += 1;
      if (!t.qty || t.qty <= 0) zeroQty += 1;

      const hasEntryExit = t.entry > 0 || t.exit > 0;
      const hasSingle = t.price > 0;
      if (!hasEntryExit && !hasSingle) missingPrice += 1;
    }

    const total = Math.min(filteredMappedRows.length, 300);
    const ok = invalidDate === 0 && invalidSide === 0 && zeroQty === 0;

    return { ok, total, invalidDate, invalidSide, zeroQty, missingPrice };
  }, [filteredMappedRows]);

  const filteredHeaders = useMemo(() => {
    const q = headerSearch.trim().toLowerCase();
    if (!q) return headers;
    return headers.filter((h) => h.toLowerCase().includes(q));
  }, [headers, headerSearch]);

  function openPicker() {
    inputRef.current?.click();
  }

  async function onFile(file) {
    setStatus({ type: "", msg: "" });
    setFileName(file?.name || "");

    const text = await file.text();
    const parsed = parseCSV(text, 5000);

    setHeaders(parsed.headers || []);
    setRows(parsed.rows || []);

    const auto = autoMap(parsed.headers || []);
    setMapping(auto);

    const hset = new Set((parsed.headers || []).map((x) => baseHeader(x)));
    if (hset.has("fill price")) setSinglePriceMode(true);
    if (hset.has("status")) setFilledOnly(true);

    setStep(STEP.MAP);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  function resetAll() {
    setStep(STEP.UPLOAD);
    setFileName("");
    setHeaders([]);
    setRows([]);
    setMapping({});
    setStatus({ type: "", msg: "" });
    setImporting(false);
    setHeaderSearch("");
    setShowRawPreview(false);

    setFilledOnly(true);
    setSinglePriceMode(true);
    setPreferClosingTime(true);
  }

  function goNext() {
    setStatus({ type: "", msg: "" });

    if (step === STEP.UPLOAD) {
      if (!rows.length) return setStatus({ type: "err", msg: "Upload a CSV first." });
      return setStep(STEP.MAP);
    }

    if (step === STEP.MAP) {
      if (!rows.length) return setStatus({ type: "err", msg: "Upload a CSV first." });
      if (!mappingComplete) return setStatus({ type: "err", msg: "Map the required fields first." });
      return setStep(STEP.REVIEW);
    }

    if (step === STEP.REVIEW) {
      if (!mappingComplete) return setStatus({ type: "err", msg: "Map the required fields first." });
      if (validation && !validation.ok) {
        return setStatus({ type: "err", msg: "Fix validation issues before importing (see checklist)." });
      }
      return setStep(STEP.IMPORT);
    }
  }

  function goBack() {
    setStatus({ type: "", msg: "" });
    setStep((s) => Math.max(STEP.UPLOAD, s - 1));
  }

  async function doImport() {
    setStatus({ type: "", msg: "" });

    if (!rows.length) return setStatus({ type: "err", msg: "Upload a CSV first." });
    if (!mappingComplete) return setStatus({ type: "err", msg: "Map the required fields first." });

    setImporting(true);
    try {
      const trades = rows
        .map((r) => normalizeRow(r, mapping))
        .filter((t) => {
          if (!filledOnly) return true;
          const st = String(t.status || "").toLowerCase();
          if (!st) return true;
          return st.includes("filled");
        })
        .map((t) => toBackendTrade(t, { singlePriceMode }));

      await importTrades({
        sourceFile: fileName,
        mapping,
        options: {
          filledOnly,
          singlePriceMode,
          preferClosingTime,
        },
        trades,
      });

      setStatus({ type: "ok", msg: "Import sent to backend. Backend will persist and return summary later." });
    } catch (e) {
      setStatus({
        type: "err",
        msg: e?.message || "Backend not ready yet (import endpoint missing). UI is working though.",
      });
    } finally {
      setImporting(false);
    }
  }

  return (
    <Suspense><div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Import</h1>
          <p className="text-sm text-slate-400 mt-1">Upload → Map → Review → Import (CSV-first).</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetAll}
            className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 hover:bg-slate-900 text-sm"
          >
            Reset
          </button>

          <button
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 hover:bg-slate-900 text-sm"
            onClick={() => setStatus({ type: "ok", msg: "Export will call GET /export/trades later." })}
          >
            Export CSV
          </button>
        </div>
      </div>

      <Stepper step={step} fileName={fileName} mappingComplete={mappingComplete} validation={validation} />

      {status.msg ? (
        <div
          className={[
            "rounded-xl border p-3 text-sm",
            status.type === "ok"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
              : "border-rose-500/20 bg-rose-500/10 text-rose-200",
          ].join(" ")}
        >
          {status.msg}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {step === STEP.UPLOAD ? (
            <Card title="Upload CSV" subtitle="Drag & drop your broker export, or browse files.">
              <Dropzone
                dragOver={dragOver}
                setDragOver={setDragOver}
                onDrop={onDrop}
                openPicker={openPicker}
                fileName={fileName}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFile(f);
                  }}
                />
              </Dropzone>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={goNext}
                  disabled={!rows.length}
                  className={[
                    "rounded-xl border px-4 py-3 text-sm flex-1",
                    !rows.length
                      ? "border-slate-800 bg-slate-900/30 text-slate-500 cursor-not-allowed"
                      : "border-emerald-500/30 bg-emerald-500/20 hover:bg-emerald-500/25",
                  ].join(" ")}
                >
                  Continue to Mapping
                </button>
              </div>

              <div className="mt-3 text-xs text-slate-500">
                Tip: Many broker exports do <span className="text-slate-300">not</span> include PnL. That’s fine.
              </div>
            </Card>
          ) : null}

          {step === STEP.MAP ? (
            <Card
              title="Map Columns"
              subtitle="Map the required fields first. Optional fields improve the import."
              right={
                <div className="text-xs text-slate-500">
                  Loaded: <span className="text-slate-300">{fileName || "—"}</span>
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <Toggle
                  title="Filled-only"
                  desc="Skip cancelled orders (recommended)."
                  value={filledOnly}
                  onChange={setFilledOnly}
                />
                <Toggle
                  title="Single price mode"
                  desc="Use Fill Price when Exit/PnL not present."
                  value={singlePriceMode}
                  onChange={setSinglePriceMode}
                />
                <Toggle
                  title="Prefer Closing Time"
                  desc="(UI hint) pick Closing Time header if broker provides it."
                  value={preferClosingTime}
                  onChange={setPreferClosingTime}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-200 font-semibold">Required Fields</div>
                    <span
                      className={[
                        "text-xs px-2 py-1 rounded-lg border",
                        mappingComplete
                          ? "border-emerald-500/30 text-emerald-200 bg-emerald-500/10"
                          : "border-slate-700 text-slate-400 bg-slate-950",
                      ].join(" ")}
                    >
                      {mappingComplete ? "Complete" : "Incomplete"}
                    </span>
                  </div>

                  <div className="mt-3 space-y-3">
                    {REQUIRED_FIELDS.map((f) => (
                      <FieldSelect
                        key={f.key}
                        field={f}
                        headers={headers}
                        value={mapping[f.key] || ""}
                        onChange={(v) => setMapping((m) => ({ ...m, [f.key]: v }))}
                      />
                    ))}
                  </div>

                  <div className="mt-4 text-xs text-slate-500">You must map these 4 fields to continue.</div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
                  <div className="text-sm text-slate-200 font-semibold">Optional Fields</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Strongly recommended: <span className="text-slate-300">Status</span> +{" "}
                    <span className="text-slate-300">Fill Price</span>.
                  </div>

                  <div className="mt-3 space-y-3">
                    {OPTIONAL_FIELDS.map((f) => (
                      <FieldSelect
                        key={f.key}
                        field={f}
                        headers={headers}
                        value={mapping[f.key] || ""}
                        onChange={(v) => setMapping((m) => ({ ...m, [f.key]: v }))}
                        optional
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
                <div className="text-sm text-slate-200 font-semibold">Headers</div>
                <div className="text-xs text-slate-500 mt-1">Search & verify column names.</div>

                <input
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="Search headers..."
                  className="mt-3 w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
                />

                <div className="mt-3 max-h-[240px] overflow-auto rounded-xl border border-slate-800 bg-slate-950">
                  {filteredHeaders.length ? (
                    <ul className="divide-y divide-slate-800 text-sm">
                      {filteredHeaders.map((h, i) => (
                        <li key={`${h}-${i}`} className="px-3 py-2 text-slate-200">
                          {h}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-3 py-3 text-sm text-slate-500">No headers match.</div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={goBack}
                  className="rounded-xl border border-slate-800 px-4 py-3 text-sm hover:bg-slate-900"
                >
                  Back
                </button>
                <button
                  onClick={goNext}
                  disabled={!mappingComplete}
                  className={[
                    "rounded-xl border px-4 py-3 text-sm flex-1",
                    !mappingComplete
                      ? "border-slate-800 bg-slate-900/30 text-slate-500 cursor-not-allowed"
                      : "border-emerald-500/30 bg-emerald-500/20 hover:bg-emerald-500/25",
                  ].join(" ")}
                >
                  Continue to Review
                </button>
              </div>
            </Card>
          ) : null}

          {step === STEP.REVIEW ? (
            <Card
              title="Review & Validate"
              subtitle="We validate core fields (Date/Side/Qty). PnL is optional."
              right={
                <button
                  onClick={() => setShowRawPreview((v) => !v)}
                  className="text-xs rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900"
                >
                  {showRawPreview ? "Show Normalized" : "Show Raw Preview"}
                </button>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Checklist validation={validation} />
                <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
                  <div className="text-sm text-slate-200 font-semibold">Import Options</div>
                  <div className="mt-3 space-y-2 text-sm">
                    <SummaryRow label="Filled-only" value={filledOnly ? "Yes" : "No"} good={filledOnly} />
                    <SummaryRow label="Single price mode" value={singlePriceMode ? "Yes" : "No"} good={singlePriceMode} />
                    <SummaryRow label="Prefer Closing Time" value={preferClosingTime ? "Yes" : "No"} />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 bg-slate-900 text-sm text-slate-300 flex items-center justify-between">
                  <span>Preview</span>
                  <span className="text-xs text-slate-500">{showRawPreview ? "Raw rows" : "Normalized rows"} (first 25)</span>
                </div>

                <div className="overflow-auto max-h-[420px]">
                  {showRawPreview ? (
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-slate-950 border-b border-slate-800">
                        <tr>
                          {headers.slice(0, 8).map((h, i) => (
                            <th key={`${h}-${i}`} className="text-left px-3 py-2 text-slate-400 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRaw.map((r, idx) => (
                          <tr key={idx} className="border-t border-slate-800 hover:bg-slate-900/40">
                            {headers.slice(0, 8).map((h, i) => (
                              <td key={`${h}-${i}`} className="px-3 py-2 text-slate-200 whitespace-nowrap">
                                {String(r[h] ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-slate-950 border-b border-slate-800">
                        <tr>
                          {["date", "symbol", "side", "qty", "price", "entry", "exit", "fees", "pnl", "status"].map((h) => (
                            <th key={h} className="text-left px-3 py-2 text-slate-400 whitespace-nowrap">
                              {h.toUpperCase()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMappedRows.slice(0, 25).map((t, idx) => (
                          <tr key={idx} className="border-t border-slate-800 hover:bg-slate-900/40">
                            <td className="px-3 py-2 text-slate-200 whitespace-nowrap">{String(t.date)}</td>
                            <td className="px-3 py-2 text-slate-200 whitespace-nowrap">{String(t.symbol)}</td>
                            <td className="px-3 py-2 text-slate-200 whitespace-nowrap">{String(t.side)}</td>
                            <td className="px-3 py-2 text-slate-200 whitespace-nowrap">{String(t.qty)}</td>
                            <td className="px-3 py-2 text-slate-200 whitespace-nowrap">{String(t.price)}</td>
                            <td className="px-3 py-2 text-slate-200 whitespace-nowrap">{String(t.entry)}</td>
                            <td className="px-3 py-2 text-slate-200 whitespace-nowrap">{String(t.exit)}</td>
                            <td className="px-3 py-2 text-slate-200 whitespace-nowrap">{String(t.fees)}</td>
                            <td className="px-3 py-2 text-slate-200 whitespace-nowrap">{String(t.pnl)}</td>
                            <td className="px-3 py-2 text-slate-200 whitespace-nowrap">{String(t.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={goBack}
                  className="rounded-xl border border-slate-800 px-4 py-3 text-sm hover:bg-slate-900"
                >
                  Back
                </button>

                <button
                  onClick={goNext}
                  disabled={validation ? !validation.ok : true}
                  className={[
                    "rounded-xl border px-4 py-3 text-sm flex-1",
                    validation && validation.ok
                      ? "border-emerald-500/30 bg-emerald-500/20 hover:bg-emerald-500/25"
                      : "border-slate-800 bg-slate-900/30 text-slate-500 cursor-not-allowed",
                  ].join(" ")}
                >
                  Continue to Import
                </button>
              </div>
            </Card>
          ) : null}

          {step === STEP.IMPORT ? (
            <Card
              title="Import"
              subtitle="This will send your normalized payload to the backend."
              right={
                <div className="text-xs text-slate-500">
                  Endpoint: <span className="text-slate-300">POST /import/csv</span>
                </div>
              }
            >
              <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-200 font-semibold">Ready</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Rows loaded: <span className="text-slate-300">{rows.length}</span> ·{" "}
                      {filledOnly ? (
                        <>
                          Filled rows (estimated): <span className="text-slate-300">{filteredMappedRows.length}</span>
                        </>
                      ) : (
                        <>Importing all rows</>
                      )}
                    </div>
                  </div>

                  <span className="text-xs px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200">
                    Validation passed
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  PnL may be 0 for some brokers (not provided). That’s normal — compute later.
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={goBack}
                  className="rounded-xl border border-slate-800 px-4 py-3 text-sm hover:bg-slate-900"
                >
                  Back
                </button>

                <button
                  disabled={importing}
                  onClick={doImport}
                  className={[
                    "rounded-xl border px-4 py-3 text-sm flex-1",
                    importing
                      ? "border-slate-800 bg-slate-900/30 text-slate-500 cursor-not-allowed"
                      : "border-emerald-500/30 bg-emerald-500/20 hover:bg-emerald-500/25",
                  ].join(" ")}
                >
                  {importing ? "Importing..." : "Import Trades"}
                </button>
              </div>
            </Card>
          ) : null}
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card title="Import Summary" subtitle="Quick stats from your current file.">
            <div className="space-y-3 text-sm">
              <SummaryRow label="File" value={fileName || "—"} />
              <SummaryRow label="Rows loaded" value={rows.length ? String(rows.length) : "—"} />
              <SummaryRow label="Headers" value={headers.length ? String(headers.length) : "—"} />
              <SummaryRow label="Filled-only" value={filledOnly ? "Yes" : "No"} good={filledOnly} />
              <SummaryRow label="Single price mode" value={singlePriceMode ? "On" : "Off"} good={singlePriceMode} />
              <SummaryRow label="Mapping required" value={mappingComplete ? "Complete" : "Incomplete"} good={mappingComplete} />
              <SummaryRow
                label="Validation"
                value={!validation ? "—" : validation.ok ? "Passed" : "Issues"}
                good={validation ? validation.ok : false}
              />
            </div>
          </Card>

          <Card title="Supported CSVs" subtitle="PnL not required.">
            <ul className="text-sm text-slate-300 space-y-2">
              <li className="flex items-start gap-2"><span className="text-emerald-300">•</span> Order history / filled orders (single price)</li>
              <li className="flex items-start gap-2"><span className="text-emerald-300">•</span> Closed trades (entry + exit) with optional PnL</li>
              <li className="flex items-start gap-2"><span className="text-emerald-300">•</span> Anything with headers — you map columns</li>
            </ul>
          </Card>
        </div>
      </div>
    </div></Suspense>
  );
}

/* ---------------- UI components ---------------- */

function Card({ title, subtitle, right, children }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-200 font-semibold">{title}</div>
          {subtitle ? <div className="text-xs text-slate-500 mt-1">{subtitle}</div> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Stepper({ step, fileName, mappingComplete, validation }) {
  const items = [
    { n: STEP.UPLOAD, label: "Upload", sub: fileName ? "Loaded" : "Pick a file" },
    { n: STEP.MAP, label: "Map", sub: mappingComplete ? "Required mapped" : "Map required" },
    { n: STEP.REVIEW, label: "Review", sub: validation ? (validation.ok ? "Passed" : "Issues") : "Validate sample" },
    { n: STEP.IMPORT, label: "Import", sub: "Send to backend" },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {items.map((it) => {
          const active = it.n === step;
          const done = it.n < step;
          return (
            <div
              key={it.n}
              className={[
                "rounded-xl border px-3 py-3",
                active
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : done
                  ? "border-slate-800 bg-slate-900/30"
                  : "border-slate-800 bg-slate-950",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Step {it.n}</div>
                <span
                  className={[
                    "text-[11px] px-2 py-0.5 rounded-lg border",
                    active
                      ? "border-emerald-500/30 text-emerald-200"
                      : done
                      ? "border-slate-700 text-slate-300"
                      : "border-slate-800 text-slate-500",
                  ].join(" ")}
                >
                  {active ? "Current" : done ? "Done" : "Next"}
                </span>
              </div>
              <div className="text-sm text-slate-200 font-semibold mt-2">{it.label}</div>
              <div className="text-xs text-slate-500 mt-1">{it.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Dropzone({ dragOver, setDragOver, onDrop, openPicker, fileName, children }) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={[
        "rounded-2xl border border-dashed p-8 text-center",
        dragOver ? "border-emerald-500/40 bg-emerald-500/5" : "border-slate-700 bg-slate-900/20",
      ].join(" ")}
    >
      {children}

      <div className="text-sm text-slate-300">
        Drag & drop CSV here, or{" "}
        <button onClick={openPicker} className="text-emerald-300 hover:underline">
          browse files
        </button>
      </div>

      <div className="text-xs text-slate-500 mt-2">
        {fileName ? `Loaded: ${fileName}` : "Tip: order history CSVs often have Status + Fill Price."}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, good }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span
        className={[
          "text-slate-200",
          typeof good === "boolean" ? (good ? "text-emerald-300" : "text-rose-300") : "",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function Checklist({ validation }) {
  if (!validation) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
        <div className="text-sm text-slate-200 font-semibold">Checklist</div>
        <div className="text-xs text-slate-500 mt-2">Complete mapping to run validation.</div>
      </div>
    );
  }

  const ok = validation.ok;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-200 font-semibold">Checklist</div>
        <span
          className={[
            "text-xs px-2 py-1 rounded-lg border",
            ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-rose-500/30 bg-rose-500/10 text-rose-200",
          ].join(" ")}
        >
          {ok ? "Passed" : "Issues found"}
        </span>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <CheckRow ok={validation.invalidDate === 0} label={`Valid dates (invalid: ${validation.invalidDate})`} />
        <CheckRow ok={validation.invalidSide === 0} label={`Valid side BUY/SELL (invalid: ${validation.invalidSide})`} />
        <CheckRow ok={validation.zeroQty === 0} label={`Quantity > 0 (zero: ${validation.zeroQty})`} />
        <CheckRow
          ok={validation.missingPrice === 0}
          label={`Has a usable price (missing: ${validation.missingPrice})`}
          hint="Map Fill Price (single price) or Entry/Exit."
        />
      </div>
    </div>
  );
}

function CheckRow({ ok, label, hint }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
      <div className="flex items-center justify-between">
        <span className="text-slate-200">{label}</span>
        <span className={ok ? "text-emerald-300" : "text-rose-300"}>{ok ? "OK" : "Fix"}</span>
      </div>
      {hint ? <div className="text-[11px] text-slate-500 mt-1">{hint}</div> : null}
    </div>
  );
}

function Toggle({ title, desc, value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={[
        "text-left rounded-2xl border p-4 transition",
        value ? "border-emerald-500/30 bg-emerald-500/10" : "border-slate-800 bg-slate-900/20 hover:bg-slate-900/30",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-200 font-semibold">{title}</div>
        <span
          className={[
            "text-[11px] px-2 py-1 rounded-lg border",
            value ? "border-emerald-500/30 text-emerald-200" : "border-slate-700 text-slate-400",
          ].join(" ")}
        >
          {value ? "ON" : "OFF"}
        </span>
      </div>
      <div className="text-xs text-slate-500 mt-1">{desc}</div>
    </button>
  );
}

function FieldSelect({ field, headers, value, onChange, optional }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-slate-400">{field.label}</div>
        <span className="text-[11px] text-slate-500">{optional ? "Optional" : "Required"}</span>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
      >
        <option value="">{optional ? "— Not used —" : "— Select column —"}</option>
        {headers.map((h, i) => (
          <option key={`${h}-${i}`} value={h}>
            {h}
          </option>
        ))}
      </select>

      <div className="mt-1 text-[11px] text-slate-500">Hints: {field.hints.join(", ")}</div>
    </div>
  );
}

/* ---------------- Data helpers ---------------- */

function baseHeader(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s*\(\d+\)\s*$/, "")
    .trim();
}

function parseAndNormalizeDate(dateStr) {
  if (!dateStr) return "";
  
  const str = String(dateStr).trim();
  if (!str) return "";

  // Try standard Date.parse first (handles ISO, RFC, etc.)
  let date = new Date(str);
  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }

  // Handle "Sep 15, 2025 16:59:02 ET" format (with timezone suffix)
  const tzSuffixPattern = /^(.+?)\s+(ET|EST|EDT|PT|PST|PDT|CT|CST|CDT|MT|MST|MDT|AT|AST|ADT|GMT|UTC|Z)$/i;
  const tzMatch = str.match(tzSuffixPattern);
  if (tzMatch) {
    // Remove timezone suffix and try parsing
    date = new Date(tzMatch[1]);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  // Handle "DD/MM/YYYY" or "MM/DD/YYYY" formats
  const slashPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/;
  const slashMatch = str.match(slashPattern);
  if (slashMatch) {
    const [, p1, p2, year, hour = "0", minute = "0", second = "0"] = slashMatch;
    // Try MM/DD/YYYY first (US format)
    date = new Date(year, parseInt(p1) - 1, parseInt(p2), parseInt(hour), parseInt(minute), parseInt(second));
    if (!isNaN(date.getTime()) && date.getMonth() === parseInt(p1) - 1) {
      return date.toISOString();
    }
    // Try DD/MM/YYYY
    date = new Date(year, parseInt(p2) - 1, parseInt(p1), parseInt(hour), parseInt(minute), parseInt(second));
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  // Handle "YYYY-MM-DD HH:mm:ss" format
  const isoPattern = /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/;
  const isoMatch = str.match(isoPattern);
  if (isoMatch) {
    const [, year, month, day, hour = "0", minute = "0", second = "0"] = isoMatch;
    date = new Date(year, parseInt(month) - 1, day, parseInt(hour), parseInt(minute), parseInt(second));
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  // If all parsing fails, return original string
  return str;
}

/**
Check if a date string is valid*/
function isValidDateLike(s) {
  if (!s) return false;
  const str = String(s).trim();
  if (!str) return false;

  // Remove timezone suffixes before testing
  const tzSuffixPattern = /\s+(ET|EST|EDT|PT|PST|PDT|CT|CST|CDT|MT|MST|MDT|AT|AST|ADT|GMT|UTC|Z)$/i;
  const cleaned = str.replace(tzSuffixPattern, "");

  // Try parsing
  const parsed = parseAndNormalizeDate(str);
  
  // Check if it's a valid ISO string or the original parse succeeded
  if (parsed !== str) {
    const date = new Date(parsed);
    return !isNaN(date.getTime());
  }

  // Fallback: check common patterns
  const patterns = [
    /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /^\d{1,2}\/\d{1,2}\/\d{4}/, // MM/DD/YYYY or DD/MM/YYYY
    /^[A-Za-z]{3}\s+\d{1,2},?\s+\d{4}/, // Mon DD, YYYY or Mon DD YYYY
  ];

  return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Format date for display (shorter format)
 */
function formatDateForDisplay(isoStr) {
  if (!isoStr) return "";
  try {
    const date = new Date(isoStr);
    if (isNaN(date.getTime())) return String(isoStr);
    
    // Format as: "Dec 31, 2025 10:30 AM"
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(isoStr);
  }
}


function autoMap(headers) {
  const h = headers.map(baseHeader);

  const pick = (includesList) => {
    const idx = h.findIndex((x) => includesList.some((k) => x.includes(k)));
    return idx >= 0 ? headers[idx] : "";
  };

  return {
    date: pick(["closing time", "filled time", "execution time", "time", "date", "executed", "placed", "placing time"]),
    symbol: pick(["symbol", "ticker", "instrument", "product", "contract"]),
    side: pick(["side", "buy/sell", "direction", "action"]),
    qty: pick(["qty", "quantity", "size", "volume", "units"]),

    price: pick(["fill price", "filled price", "price", "avg price", "average price"]),
    entry: pick(["entry", "avg entry", "open price"]),
    exit: pick(["exit", "avg exit", "close price"]),
    fees: pick(["commission", "fee", "fees", "swap"]),
    pnl: pick(["pnl", "profit", "pl", "net pnl"]),

    status: pick(["status", "state"]),
    type: pick(["type", "order type"]),
    orderId: pick(["order id", "id", "orderid"]),
  };
}

function normalizeRow(row, mapping) {
  const get = (k) => (mapping[k] ? row[mapping[k]] : "") ?? "";

  // Parse and normalize the date
  const rawDate = String(get("date") ?? "").trim();
  const normalizedDate = parseAndNormalizeDate(rawDate);

  return {
    date: normalizedDate,
    symbol: String(get("symbol") ?? "").trim(),
    side: String(get("side") ?? "").toUpperCase().trim(),
    qty: num(get("qty")),

    entry: num(get("entry")),
    exit: num(get("exit")),
    price: num(get("price")),
    fees: num(get("fees")),
    pnl: num(get("pnl")),

    status: String(get("status") ?? "").trim(),
    type: String(get("type") ?? "").trim(),
    orderId: String(get("orderId") ?? "").trim(),
  };
}

/* ---------------- Helper functions ---------------- */

function num(v) {
  const n = Number(String(v ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function toBackendTrade(t, opts) {
  const single = !!opts?.singlePriceMode;
  const entry = single ? (t.price || t.entry) : t.entry;
  const exit = t.exit || 0;
  const pnl = t.pnl || 0;

  return {
    date: t.date, // Already normalized to ISO format
    symbol: t.symbol,
    side: t.side,
    qty: t.qty,

    entry: entry || 0,
    exit: exit || 0,
    fees: t.fees || 0,
    pnl,

    meta: {
      status: t.status || "",
      type: t.type || "",
      orderId: t.orderId || "",
      price: t.price || 0,
    },
  };
}


