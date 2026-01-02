// app/(auth)/register/RegisterClient.jsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LogoJourT from "@/components/LogoJourT";
import { register } from "@/lib/auth/manualAuth";
import { oauthStart } from "@/lib/auth/oauth";

export default function RegisterClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const pwScore = useMemo(() => scorePassword(pw), [pw]);
  const pwOk = pw.length >= 8;
  const matchOk = pw && pw2 && pw === pw2;

  const canSubmit = useMemo(() => {
    return (
      username.trim().length >= 2 &&
      email.trim().length >= 3 &&
      pwOk &&
      matchOk &&
      !loading
    );
  }, [username, email, pwOk, matchOk, loading]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    const u = username.trim();
    const em = email.trim().toLowerCase();

    if (!u) return setErr("Username is required.");
    if (!em) return setErr("Email is required.");
    if (!pwOk) return setErr("Password must be at least 8 characters.");
    if (!matchOk) return setErr("Passwords do not match.");

    setLoading(true);
    try {
      await register(u, em, pw);
      router.replace(next);
    } catch (e2) {
      setErr(e2?.message || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_0%,rgba(245,158,11,0.10),transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
          {/* Left pitch */}
          <section className="hidden lg:flex flex-col justify-center">
            <Link href="/" className="inline-flex items-center gap-3">
              <LogoJourT width={150} />
            </Link>

            <h1 className="mt-6 text-3xl font-semibold leading-tight">
              Build consistency.
              <span className="block text-slate-400 text-xl mt-2">
                Capture trades, journaling, and psychology — the right way.
              </span>
            </h1>

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <Feature title="Cleaner records" desc="You’ll actually trust your stats." />
              <Feature title="Setups that win" desc="Tag & filter what works." />
              <Feature title="Backtest ready" desc="Run sims once the backend is live." />
              <Feature title="Import CSV" desc="Map columns, validate, import." />
            </div>

            <p className="mt-6 text-xs text-slate-500">JourT · side project build.</p>
          </section>

          {/* Card */}
          <section className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.35)] backdrop-blur">
                {/* Mobile header */}
                <div className="lg:hidden flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-3">
                    <LogoJourT width={120} />
                  </Link>
                  <Link href="/login" className="text-sm text-emerald-300 hover:underline">
                    Login
                  </Link>
                </div>

                <div className="mt-4 lg:mt-0">
                  <h2 className="text-xl font-semibold">Create your account</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Sign up with OAuth or email/password.
                  </p>
                </div>

                {/* OAuth */}
                <div className="mt-5 space-y-3">
                  <OAuthBtn onClick={() => oauthStart("google")}>Continue with Google</OAuthBtn>
                  <OAuthBtn onClick={() => oauthStart("github")}>Continue with GitHub</OAuthBtn>
                </div>

                <Divider />

                {/* Manual */}
                <form onSubmit={onSubmit} className="space-y-4">
                  <Field label="Username">
                    <input
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-slate-600 text-sm"
                      placeholder="thukten"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      inputMode="text"
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-slate-600 text-sm"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      inputMode="email"
                    />
                  </Field>

                  <Field label="Password" hint="At least 8 characters. Use a mix for stronger passwords.">
                    <div className="relative">
                      <input
                        className="w-full px-4 py-3 pr-24 rounded-2xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-slate-600 text-sm"
                        placeholder="Create a password"
                        type={showPw ? "text" : "password"}
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900"
                      >
                        {showPw ? "Hide" : "Show"}
                      </button>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <StrengthBar score={pwScore} />
                      <span className="text-xs text-slate-400">{pwScoreLabel(pwScore)}</span>
                    </div>
                  </Field>

                  <Field label="Confirm password">
                    <input
                      className={[
                        "w-full px-4 py-3 rounded-2xl bg-slate-950 border focus:outline-none text-sm",
                        pw2.length === 0
                          ? "border-slate-800 focus:border-slate-600"
                          : matchOk
                          ? "border-emerald-500/40 focus:border-emerald-500/60"
                          : "border-rose-500/40 focus:border-rose-500/60",
                      ].join(" ")}
                      placeholder="Re-enter password"
                      type={showPw ? "text" : "password"}
                      value={pw2}
                      onChange={(e) => setPw2(e.target.value)}
                      autoComplete="new-password"
                    />
                    {pw2.length > 0 && !matchOk ? (
                      <div className="text-xs text-rose-300 mt-2">Passwords don’t match.</div>
                    ) : null}
                  </Field>

                  {err ? (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
                      {err}
                    </div>
                  ) : null}

                  <button
                    disabled={!canSubmit}
                    className={[
                      "w-full px-4 py-3 rounded-2xl border text-sm transition",
                      canSubmit
                        ? "bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/25"
                        : "bg-slate-900/40 border-slate-800 text-slate-500 cursor-not-allowed",
                    ].join(" ")}
                  >
                    {loading ? "Creating account..." : "Create account"}
                  </button>

                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    By continuing, you agree to our Terms and acknowledge our Privacy Policy.
                  </div>
                </form>

                <div className="mt-5 text-sm text-slate-400">
                  Already have an account?{" "}
                  <Link href="/login" className="text-emerald-300 hover:underline">
                    Login
                  </Link>
                </div>
              </div>

              <div className="mt-4 text-center text-xs text-slate-600">
                JourT · simple, clean, backend-ready.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* -------- helpers -------- */

function Feature({ title, desc }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="text-sm font-semibold text-slate-200">{title}</div>
      <div className="mt-1 text-xs text-slate-500">{desc}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <label className="text-sm text-slate-200">{label}</label>
        {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px bg-slate-800 flex-1" />
      <div className="text-xs text-slate-500">OR</div>
      <div className="h-px bg-slate-800 flex-1" />
    </div>
  );
}

function OAuthBtn({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 hover:bg-slate-900 transition text-sm"
    >
      {children}
    </button>
  );
}

function StrengthBar({ score }) {
  const w = `${(score / 4) * 100}%`;
  return (
    <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
      <div className="h-full bg-slate-200/70" style={{ width: w }} />
    </div>
  );
}

function scorePassword(pw) {
  let s = 0;
  if (!pw) return 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(4, s);
}

function pwScoreLabel(score) {
  if (score <= 1) return "Weak";
  if (score === 2) return "Okay";
  if (score === 3) return "Strong";
  return "Very strong";
}
