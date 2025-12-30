"use client";

import { useEffect, useState } from "react";
import { useSetups } from "@/lib/setups/useSetups";

export default function ManageSetupsModal({ open, onClose }) {
  const { setups, loading, error, add, remove, reload } = useSetups();
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">Manage Setups</h2>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-900"
          >
            Close
          </button>
        </div>

        {error ? (
          <div className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="flex gap-2 mt-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New setup name"
            className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
          />
          <button
            onClick={async () => {
              await add(name);
              setName("");
            }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-4"
          >
            Add
          </button>
        </div>

        <div className="mt-4 space-y-2 max-h-[320px] overflow-auto">
          {loading ? (
            <div className="text-sm text-slate-500">Loading setups...</div>
          ) : setups.length === 0 ? (
            <div className="text-sm text-slate-500">
              No setups yet (or backend returned empty).
            </div>
          ) : (
            setups.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm"
              >
                <span>{s.name}</span>
                <button
                  onClick={() => remove(s.id)}
                  className="text-xs text-rose-300 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
