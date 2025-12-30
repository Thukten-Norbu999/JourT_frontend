"use client";

import Link from "next/link";
import LogoJourT from "@/components/LogoJourT";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trades", label: "Trades" },
  { href: "/pnl", label: "PnL" },
  { href: "/import", label: "Import / Export" },
  { href: "/backtest", label: "Backtest" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-r border-slate-800 p-5">
      {/* TOP: Logo (same treatment as Topbar) */}
      <div className="h-14 px-4 flex items-center border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <LogoJourT width={120} />
        </Link>

      </div>
     <div className="text-xs text-slate-400">Trading Journal</div>

      

      <nav className="mt-6 space-y-1">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded-xl px-3 py-2 border ${
                active
                  ? "bg-slate-900 border-slate-700"
                  : "border-transparent hover:bg-slate-900/40"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
