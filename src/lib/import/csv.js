// src/lib/import/csv.js

function stripBOM(s) {
  return s && s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

/**
 * Normalizes date/time strings.
 * Converts YYYY-MM-DD to DD-MM-YYYY while preserving any attached time.
 */
function normalizeDateTime(val) {
  if (!val || typeof val !== "string") return val;
  
  const trimmed = val.trim();
  // Split by whitespace to separate Date and Time
  const parts = trimmed.split(/\s+/);
  const datePart = parts[0];
  const timePart = parts.slice(1).join(" ");

  // Regex to detect YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = datePart.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    // Format to DD-MM-YYYY
    const formattedDate = `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
    return timePart ? `${formattedDate} ${timePart}` : formattedDate;
  }

  return val; // Return original if it doesn't match ISO format
}

function makeUniqueHeaders(headers) {
  const seen = new Map();
  return headers.map((h) => {
    const base = String(h ?? "").trim() || "Column";
    const n = (seen.get(base) || 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base} (${n})`;
  });
}

function parseRecords(text, delimiter, maxRecords) {
  const out = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === delimiter) {
      row.push(field);
      field = "";
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      field = "";
      const allEmpty = row.every((x) => String(x ?? "").trim() === "");
      if (!allEmpty) out.push(row);
      row = [];
      if (maxRecords && out.length >= maxRecords) break;
      continue;
    }
    field += ch;
  }
  row.push(field);
  const allEmpty = row.every((x) => String(x ?? "").trim() === "");
  if (!allEmpty) out.push(row);
  return out;
}

function detectDelimiter(text) {
  const candidates = [",", ";", "\t", "|"];
  let best = ",";
  let bestCols = 0;
  const sample = stripBOM(String(text || "")).slice(0, 50000);
  for (const d of candidates) {
    const recs = parseRecords(sample, d, 1);
    const cols = recs?.[0]?.length || 0;
    if (cols > bestCols) {
      bestCols = cols;
      best = d;
    }
  }
  return best;
}

export function parseCSV(text, maxRows = 5000) {
  if (!text) return { headers: [], rows: [], meta: { delimiter: "," } };

  text = stripBOM(String(text));
  const delimiter = detectDelimiter(text);
  const records = parseRecords(text, delimiter, maxRows + 1);

  if (!records.length) return { headers: [], rows: [], meta: { delimiter } };

  const rawHeaders = (records[0] || []).map((h) => String(h ?? "").trim());
  const headers = makeUniqueHeaders(rawHeaders);

  const rows = [];
  for (let r = 1; r < records.length; r++) {
    const rec = records[r] || [];
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      const headerName = headers[c];
      let value = rec[c] ?? "";

      // Logic: If column header mentions "date" or "time", try to normalize
      if (/date|time/i.test(headerName)) {
        value = normalizeDateTime(value);
      }

      obj[headerName] = value;
    }
    rows.push(obj);
  }

  return {
    headers,
    rows,
    meta: { delimiter, rawHeaders, uniqueHeaders: headers },
  };
}