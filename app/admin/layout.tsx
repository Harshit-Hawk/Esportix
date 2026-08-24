"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  PlusCircle,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const sidebarLinks = [
    { href: "/admin", label: "Tournaments", icon: LayoutDashboard },
    { href: "/admin/tournaments/new", label: "Create Tournament", icon: PlusCircle },
  ];

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-slate-50">
      {/* Admin Sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-3 md:block">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Organizer Portal
        </div>

        <nav className="mt-1 space-y-1">
          {sidebarLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Public Scoreboard Link */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
          <div className="text-[11px] font-semibold text-slate-700">
            Active Event
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            BGMI Campus Showdown 2026
          </p>
          <Link
            href="/tournament/bgmi-campus-showdown-2026"
            target="_blank"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs"
          >
            <Radio className="h-3 w-3 text-red-500" />
            <span>Public Scorecard</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Viewport */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
