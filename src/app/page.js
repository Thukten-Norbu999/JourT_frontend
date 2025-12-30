"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between">
          {/* Left: Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-900/40 grid place-items-center">
              <span className="text-amber-300 font-bold">J</span>
            </div>
            <div className="leading-tight">
              <div className="font-semibold">JourT</div>
              <div className="text-xs text-slate-400">Trading Journal</div>
            </div>
          </Link>

          {/* Right: Auth actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm hover:bg-slate-900"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-sm hover:bg-emerald-500/20"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/30 px-3 py-1 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Side project — built for real journaling
            </div>

            <h1 className="mt-5 text-3xl sm:text-4xl font-semibold leading-tight">
              JourT helps you journal trades properly —
              <span className="text-amber-300"> not just track numbers.</span>
            </h1>

            <p className="mt-4 text-slate-400 leading-relaxed">
              This is a personal side project built to learn and ship fast — but the goal is serious:
              a clean trading journal with psychology, setups, and PnL insights that actually helps you
              improve.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/15 px-5 py-3 text-sm hover:bg-emerald-500/20 text-center"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-slate-800 bg-slate-950 px-5 py-3 text-sm hover:bg-slate-900 text-center"
              >
                Login
              </Link>
            </div>

            <div className="mt-6 text-xs text-slate-500">
              Backend-ready • CSV import • PnL calendar • Trade journal • Setups
            </div>
          </div>

          {/* Right visual card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/20 p-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Today’s Focus</div>
                  <div className="text-xs text-slate-500 mt-1">
                    “Execute well, results come after.”
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-300">
                  Prototype
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat label="Discipline" value="78/100" />
                <MiniStat label="Win rate" value="52%" />
                <MiniStat label="Avg R" value="1.4R" />
                <MiniStat label="PnL" value="+$128.20" good />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/20 p-4">
                <div className="text-xs text-slate-400">Recent trade</div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">FX: GBPUSD</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Setup: London Breakout • Notes + psychology
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-emerald-300">+0.9R</div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500 leading-relaxed">
              JourT is still evolving. The UI is built first, then backend integration.
              The mission: keep it slick, fast, and actually useful.
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Feature
            title="Trade journal + psychology"
            desc="Log thesis, mistakes, lessons, tags, and execution discipline per trade."
          />
          <Feature
            title="PnL calendar & dashboard"
            desc="See daily PnL, streaks, and what setups actually perform."
          />
          <Feature
            title="CSV import (backend-ready)"
            desc="Upload broker exports, map columns, validate, then import."
          />
        </div>

        <footer className="mt-10 text-center text-xs text-slate-600">
          JourT • built as a side project • shipping incrementally
        </footer>
      </section>
    </main>
  );
}

function MiniStat({ label, value, good }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-1 text-sm font-semibold ${good ? "text-emerald-300" : "text-slate-100"}`}>
        {value}
      </div>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/20 p-5">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm text-slate-400 leading-relaxed">{desc}</div>
    </div>
  );
}
