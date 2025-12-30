"use client";

import { useEffect, useMemo, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState({ type: "", msg: "" });

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("jourt_user") || "null");
      setUser(u);
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

  function saveLocal(e) {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    // for now: local-only
    localStorage.setItem("jourt_user", JSON.stringify(user));
    setStatus({ type: "ok", msg: "Saved locally. (Backend-ready later.)" });
  }

  if (!user) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="text-sm text-slate-400 mt-2">
          No user found. Login first so we can load your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="text-sm text-slate-400 mt-1">
          Basic account info. (For now stored locally, backend later.)
        </p>
      </div>

      {status.msg ? (
        <div
          className={[
            "rounded-xl border p-3 text-sm",
            status.type === "ok"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
              : "border-rose-500/20 bg-rose-500/10 text-rose-200",
          ].join(" ")}
        >
          {status.msg}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full border border-slate-800 bg-slate-900/60 flex items-center justify-center text-lg font-semibold">
            {initials}
          </div>

          <div>
            <div className="text-slate-200 font-semibold">{user.username}</div>
            <div className="text-sm text-slate-500">{user.email}</div>
          </div>
        </div>

        <form onSubmit={saveLocal} className="mt-6 space-y-4">
          <Field label="Username">
            <input
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-slate-600"
              value={user.username || ""}
              onChange={(e) =>
                setUser((u) => ({ ...u, username: e.target.value }))
              }
              autoComplete="username"
            />
          </Field>

          <Field label="Email (read-only for now)">
            <input
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400"
              value={user.email || ""}
              readOnly
            />
          </Field>

          <button className="rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-4 py-3 hover:bg-emerald-500/25">
            Save changes
          </button>

          <div className="text-xs text-slate-500">
            Backend-ready later: PATCH <span className="text-slate-300">/auth/me</span>
          </div>
        </form>
      </div>
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
