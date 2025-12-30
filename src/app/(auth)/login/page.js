"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LogoJourT from "@/components/LogoJourT";
import { login } from "@/lib/auth/manualAuth";
import { oauthStart } from "@/lib/auth/oauth";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => {
    return email.trim().length > 3 && password.length >= 1 && !loading;
  }, [email, password, loading]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!email.trim()) return setErr("Email is required.");
    if (!password) return setErr("Password is required.");

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace(next);
    } catch (e2) {
      setErr("Login failed. Check email/password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* subtle background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_0%,rgba(16,185,129,0.10),transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
          {/* Left: Brand / Pitch */}
          <section className="hidden lg:flex flex-col justify-center">
            <Link href="/" className="inline-flex items-center gap-3">
              <LogoJourT width={150} />
            </Link>

            <h1 className="mt-6 text-3xl font-semibold leading-tight">
              Journal better trades.
              <span className="block text-slate-400 text-xl mt-2">
                Clean PnL, calendar, setups, and psychology — in one place.
              </span>
            </h1>

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <Feature
                title="Fast logging"
                desc="Add trades + journal in seconds."
              />
              <Feature
                title="Trade calendar"
                desc="See your PnL per day instantly."
              />
              <Feature
                title="Setups library"
                desc="Track what actually works."
              />
              <Feature
                title="Psychology"
                desc="Patterns behind your execution."
              />
            </div>

            <p className="mt-6 text-xs text-slate-500">
              Side project build. Backend-ready UI.
            </p>
          </section>

          {/* Right: Login Card */}
          <section className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.35)] backdrop-blur">
                {/* Mobile header */}
                <div className="lg:hidden flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-3">
                    <LogoJourT width={120} />
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm text-emerald-300 hover:underline"
                  >
                    Sign up
                  </Link>
                </div>

                <div className="mt-4 lg:mt-0">
                  <h2 className="text-xl font-semibold">Welcome back</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Login with OAuth or email/password.
                  </p>
                </div>

                {/* OAuth */}
                <div className="mt-5 space-y-3">
                  <OAuthBtn onClick={() => oauthStart("google")}>
                    Continue with Google
                  </OAuthBtn>
                  <OAuthBtn onClick={() => oauthStart("github")}>
                    Continue with GitHub
                  </OAuthBtn>
                </div>

                <Divider />

                {/* Manual */}
                <form onSubmit={onSubmit} className="space-y-4">
                  <Field label="Email">
                    <input
                      className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm outline-none focus:border-slate-600"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      inputMode="email"
                    />
                  </Field>

                  <Field label="Password">
                    <div className="relative">
                      <input
                        className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 pr-24 text-sm outline-none focus:border-slate-600"
                        placeholder="Your password"
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs hover:bg-slate-900"
                      >
                        {showPw ? "Hide" : "Show"}
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {email.trim() ? " " : " "}
                      </span>
                      <Link
                        href="/forgot"
                        className="text-slate-400 hover:text-slate-200 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </Field>

                  {err ? (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
                      {err}
                    </div>
                  ) : null}

                  <button
                    disabled={!canSubmit}
                    className={[
                      "w-full rounded-2xl border px-4 py-3 text-sm transition",
                      canSubmit
                        ? "border-emerald-500/30 bg-emerald-500/20 hover:bg-emerald-500/25"
                        : "border-slate-800 bg-slate-900/30 text-slate-500 cursor-not-allowed",
                    ].join(" ")}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                <div className="mt-5 text-sm text-slate-400">
                  No account?{" "}
                  <Link href="/register" className="text-emerald-300 hover:underline">
                    Create one
                  </Link>
                </div>

                <div className="mt-6 text-[11px] text-slate-500 leading-relaxed">
                  By continuing, you agree to our Terms and acknowledge our Privacy Policy.
                </div>
              </div>

              <div className="mt-4 text-center text-xs text-slate-600">
                JourT · built for clean journaling & backend integration.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* --------- small UI helpers (same file) --------- */

function Feature({ title, desc }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="text-sm font-semibold text-slate-200">{title}</div>
      <div className="mt-1 text-xs text-slate-500">{desc}</div>
    </div>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-800" />
      <div className="text-[11px] text-slate-500">OR</div>
      <div className="h-px flex-1 bg-slate-800" />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm text-slate-200">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function OAuthBtn({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm hover:bg-slate-900 transition"
    >
      {children}
    </button>
  );
}
