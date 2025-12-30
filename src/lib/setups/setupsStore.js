"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchSetups, createSetup, deleteSetup } from "@/lib/setups/setupsApi";

export function useSetups() {
  const [setups, setSetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchSetups();
      setSetups(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load setups.");
      setSetups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = useCallback(async (name) => {
    const n = (name || "").trim();
    if (!n) return;

    const temp = { id: `tmp-${Date.now()}`, name: n };
    setSetups((s) => [temp, ...s]);

    try {
      const created = await createSetup(n);
      setSetups((s) => [created, ...s.filter((x) => x.id !== temp.id)]);
    } catch (e) {
      setSetups((s) => s.filter((x) => x.id !== temp.id));
      setError("Failed to create setup.");
      throw e;
    }
  }, []);

  const remove = useCallback(
    async (id) => {
      const prev = setups;
      setSetups((s) => s.filter((x) => x.id !== id));

      try {
        await deleteSetup(id);
      } catch (e) {
        setSetups(prev);
        setError("Failed to delete setup.");
        throw e;
      }
    },
    [setups]
  );

  return { setups, loading, error, reload, add, remove };
}
