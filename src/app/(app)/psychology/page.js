"use client";

import { Suspense, useState } from "react";
import PsychologyForm from "@/components/PsychologyForm";
// later: import { fetchPsychology, savePsychology } from "@/lib/psychologyApi";

export default function PsychologyPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);

  const initial = {}; // backend-ready

  async function save(data) {
    console.log("Psychology payload", data);

    // BACKEND READY:
    // await savePsychology(data);
  }

  return (
    <Suspense><div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Daily Psychology</h1>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="input"
        />
      </div>

      <PsychologyForm
        date={date}
        initial={initial}
        onSave={save}
      />
    </div></Suspense>
  );
}
