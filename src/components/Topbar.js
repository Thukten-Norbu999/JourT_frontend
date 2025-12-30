"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LogoJourT from "@/components/LogoJourT";
import { clearAuthed } from "@/lib/auth/requiredAuth"; // ✅ FIX: correct import
import { logout as apiLogout } from "@/lib/auth/manualAuth"; // ✅ FIX: rename to avoid recursion
import AddTradeModal from "@/components/AddTradeModal";
import { createTrade } from "@/lib/trades/tradesApi";

export default function Topbar() {
  const router = useRouter();
  const [openAdd, setOpenAdd] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  // ✅ Better than useMemo for localStorage (updates if you later change it)
  const [user, setUser] = useState(null);
  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("jourt_user") || "null"));
    } catch {
      setUser(null);
    }
  }, []);

  const initials = useMemo(() => {
    const name = (user?.username || user?.email || "U").toString().trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] || "U";
    const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (a + b).toUpperCase();
  }, [user]);

  async function handleLogout() {
    setOpenProfile(false);

    // call backend logout if you implement it (safe even if not)
    try {
      await apiLogout();
    } catch {
      // ignore for now (server down / route missing)
    }

    clearAuthed();
    try {
      localStorage.removeItem("jourt_user");
    } catch {}

    router.replace("/login");
  }

  return (
    <>
      <header className="h-14 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between bg-slate-950">
        <Link href="/dashboard" className="flex items-center gap-3">
          <LogoJourT width={120} />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <select className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>

          <select className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-sm">
            <option value="paper">Paper</option>
            <option value="live">Live</option>
          </select>

          <button
            type="button"
            onClick={() => setOpenAdd(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-500/20"
            title="Add trade"
          >
            <span className="text-base leading-none">＋</span>
            <span className="hidden sm:inline">Add Trade</span>
          </button>
        </div>

        {/* RIGHT: Profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenProfile((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-2 py-2 hover:bg-slate-900"
            title="Profile"
          >
            <div className="h-8 w-8 rounded-full border border-slate-800 bg-slate-900/60 flex items-center justify-center text-xs font-semibold text-slate-200">
              {initials}
            </div>

            <div className="hidden md:block text-left">
              <div className="text-sm text-slate-200 leading-tight">
                {user?.username || "Profile"}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight">
                {user?.email || "Signed in"}
              </div>
            </div>

            <span className="hidden sm:inline text-slate-400 text-xs px-1">▾</span>
          </button>

          {openProfile ? (
            <>
              {/* click-away backdrop */}
              <button
                type="button"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setOpenProfile(false)}
                aria-label="Close profile menu"
              />

              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-950 z-50 overflow-hidden shadow-lg">
                <div className="px-4 py-3 border-b border-slate-800">
                  <div className="text-sm text-slate-200 font-semibold">
                    {user?.username || "User"}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {user?.email || "—"}
                  </div>
                </div>

                <div className="p-2">
                  <Link
                    href="/profile"
                    onClick={() => setOpenProfile(false)}
                    className="block w-full rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-slate-900"
                  >
                    Profile settings
                  </Link>

                  <Link
                    href="/import"
                    onClick={() => setOpenProfile(false)}
                    className="block w-full rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-slate-900"
                  >
                    Import trades
                  </Link>

                  <div className="my-2 h-px bg-slate-800" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left rounded-xl px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/10"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </header>

      <AddTradeModal open={openAdd} onClose={() => setOpenAdd(false)} onCreate={async (payload)=>{
        const created= await createTrade(payload);
        const list = await fetchTrades();
        setTrades(list);
        return created;
      }} />
    </>
  );
}
