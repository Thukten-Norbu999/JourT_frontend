"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TradesTable from "@/components/TradesTable";
import TradeDrawer from "@/components/TradeDrawer";
import { fetchAllTrades, upsertTradeJournal } from "@/lib/trades/tradesApi";
import { uiError } from "@/lib/apiClient";

function TradesContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const dateQuery = sp.get("date") || "";

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Filter State: 'all' or 'today'
  const [activeFilter, setActiveFilter] = useState("all");

  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Logic to filter trades based on button selection OR URL query
  const filteredTrades = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    return trades.filter((t) => {
      // Prioritize URL date query if it exists
      if (dateQuery) {
        return (t.date || "").includes(dateQuery);
      }
      // Otherwise use quick filters
      if (activeFilter === "today") {
        return (t.date || "").includes(todayStr);
      }
      return true; // "all"
    });
  }, [trades, activeFilter, dateQuery]);

  const header = useMemo(() => (dateQuery ? `Trades · ${dateQuery}` : "Trades"), [dateQuery]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchAllTrades();
      setTrades(Array.isArray(data) ? data : data?.trades || []);
    } catch (e) {
      setErr(uiError(e));
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleQuickFilter = (type) => {
    setActiveFilter(type);
    if (dateQuery) {
      router.push("/trades"); // Clear the URL date query when clicking All/Today
    }
  };

  function openTrade(t) {
    setSelected(t);
    setDrawerOpen(true);
  }

  async function saveJournal(journalPayloadFromDrawer) {
    if (!selected?.id) return;

    setTrades((prev) =>
      prev.map((t) => (String(t.id) === String(selected.id) ? { ...t, Journal: mergeJournal(t, journalPayloadFromDrawer) } : t))
    );

    try {
      const out = await upsertTradeJournal(selected.id, journalPayloadFromDrawer);
      const updated = out?.trade || out;

      if (updated?.id) {
        setTrades((prev) => prev.map((t) => (String(t.id) === String(updated.id) ? updated : t)));
        setSelected(updated);
      }
      setDrawerOpen(false);
    } catch (e) {
      setErr(uiError(e));
      await load();
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{header}</h1>
          <p className="text-sm text-slate-400 mt-1">
            Click a trade to journal.
          </p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900 disabled:opacity-50 transition-colors"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* --- Quick Filter Bar --- */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/50 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => handleQuickFilter("all")}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeFilter === "all" && !dateQuery
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          All Trades
        </button>
        <button
          onClick={() => handleQuickFilter("today")}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeFilter === "today" && !dateQuery
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Today
        </button>
        
        {dateQuery && (
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 ml-1">
            <span>Date: {dateQuery}</span>
            <button 
              onClick={() => router.push("/trades")} 
              className="hover:text-indigo-200 ml-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Error banner */}
      {err && (
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4">
          <div className="text-sm text-rose-200 font-semibold">{err.title}</div>
          <div className="text-sm text-rose-200/90 mt-1">{err.message}</div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <TradesSkeleton />
      ) : filteredTrades.length ? (
        <TradesTable trades={filteredTrades} onSelect={openTrade} />
      ) : (
        <EmptyState 
          date={dateQuery} 
          isToday={activeFilter === 'today'} 
        />
      )}

      {/* Drawer */}
      <TradeDrawer
        trade={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={saveJournal}
      />
    </div>
  );
}

export default function TradesPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h-7 w-32 bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-48 bg-slate-800/50 rounded mt-2 animate-pulse" />
          </div>
          <div className="h-9 w-24 bg-slate-800 rounded-xl animate-pulse" />
        </div>
        <TradesSkeleton />
      </div>
    }>
      <TradesContent />
    </Suspense>
  );
}

// Helper: Merge logic remains the same
function mergeJournal(trade, payload) {
  const current = trade?.Journal || trade?.journal || null;
  return {
    ...(current || {}),
    Setup: payload?.setup ?? current?.Setup ?? "",
    Thesis: payload?.thesis ?? current?.Thesis ?? "",
    Mistakes: payload?.mistakes ?? current?.Mistakes ?? "",
    Lessons: payload?.lessons ?? current?.Lessons ?? "",
    Rating: Number(payload?.rating ?? current?.Rating ?? 0),
    Tags: Array.isArray(payload?.tags) ? payload.tags.join(",") : payload?.tags ?? current?.Tags ?? "",
    Psychology: payload?.psychology ?? current?.Psychology ?? null,
    Metrics: payload?.metrics ?? current?.Metrics ?? null,
    Screenshots: payload?.screenshots ?? current?.Screenshots ?? null,
  };
}

function EmptyState({ date, isToday }) {
  let message = "Create a trade or import a CSV to see data here.";
  if (date) message = `No trades found for ${date}.`;
  else if (isToday) message = "No trades found for today.";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-12 text-center">
      <div className="text-sm text-slate-200 font-semibold text-center">No trades found</div>
      <div className="text-sm text-slate-500 mt-1 text-center">{message}</div>
    </div>
  );
}

function TradesSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
      <div className="animate-pulse h-4 w-40 bg-slate-800 rounded" />
      <div className="animate-pulse h-10 bg-slate-900/40 rounded-xl" />
      <div className="animate-pulse h-10 bg-slate-900/40 rounded-xl" />
    </div>
  );
}