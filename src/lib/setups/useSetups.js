"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchSetups, createSetup, deleteSetup } from "@/lib/setups/setupsApi";
import { fallbackGetSetups, fallbackSaveSetups } from "@/lib/setups/setupsFallback";

export function useSetups() {
  const [setups, setSetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendReady, setBackendReady] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSetups();
      // expect array: [{ id, name }]
      setSetups(Array.isArray(data) ? data : []);
      setBackendReady(true);
    } catch (e) {
      // backend not ready -> fallback
      const local = fallbackGetSetups();
      setSetups(local);
      setBackendReady(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(
    async (name) => {
      if (!name.trim()) return;
      // optimistic UI
      const temp = { id: `tmp-${Date.now()}`, name: name.trim() };
      setSetups((s) => [temp, ...s]);

      try {
        const created = await createSetup(name.trim());
        setSetups((s) => [created, ...s.filter((x) => x.id !== temp.id)]);
        setBackendReady(true);
      } catch (e) {
        // fallback create
        const next = [normalizeLocalSetup(name), ...setups.filter((x) => x.id !== temp.id)];
        setSetups(next);
        fallbackSaveSetups(next);
        setBackendReady(false);
      }
    },
    [setups]
  );

  const remove = useCallback(
    async (id) => {
      // optimistic
      const prev = setups;
      setSetups((s) => s.filter((x) => x.id !== id));

      try {
        await deleteSetup(id);
        setBackendReady(true);
      } catch (e) {
        // fallback delete
        const next = prev.filter((x) => x.id !== id);
        setSetups(next);
        fallbackSaveSetups(next);
        setBackendReady(false);
      }
    },
    [setups]
  );

  return { setups, loading, backendReady, reload: load, add, remove };
}

function normalizeLocalSetup(name) {
  const id = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return { id: id || `setup-${Date.now()}`, name: name.trim() };
}
