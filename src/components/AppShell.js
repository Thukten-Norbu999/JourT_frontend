"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex flex-col">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
