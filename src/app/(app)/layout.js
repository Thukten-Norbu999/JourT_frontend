"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { me } from "@/lib/auth/manualAuth";
import AppShell from "@/components/AppShell";

export default function AppLayout({ children }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let mounted = true;
    me()
      .then(() => mounted && (setOk(true)))
      .catch(() => {
        router.replace("/login?next=/dashboard");
      });
    return () => { mounted = false; };
  }, [router]);

  if (!ok) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-sm text-slate-400">Checking session…</div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
