"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Trophy,
  LayoutDashboard,
  PlusCircle,
  Users,
  Crosshair,
  Sliders,
  History,
  ArrowLeft,
  Flame,
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
    { href: "/admin", label: "Dashboard Overview", icon: LayoutDashboard },
    { href: "/admin/tournaments/new", label: "Create Tournament", icon: PlusCircle },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#F8FAFC]">
      {/* Admin Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 md:block shadow-sm">
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-widest text-blue-600">
          <Shield className="h-4 w-4" />
          <span>Admin Control Center</span>
        </div>

        <nav className="mt-4 space-y-1.5">
          {sidebarLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-black uppercase tracking-wider transition-all",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-yellow-300" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Demo Access Box */}
        <div className="mt-8 rounded-2xl border border-yellow-300 bg-gradient-to-br from-yellow-50 to-white p-4 space-y-2.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-800">
            <Flame className="h-3.5 w-3.5 text-yellow-600" />
            <span>Active Live Tournament</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            BGMI Campus Showdown 2026 is currently live.
          </p>
          <Link
            href="/tournament/bgmi-campus-showdown-2026"
            target="_blank"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[11px] font-black uppercase text-blue-600 hover:bg-blue-50 border border-slate-200 shadow-sm"
          >
            <Radio className="h-3.5 w-3.5 text-red-500 animate-pulse" />
            <span>Open Public Board</span>
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
