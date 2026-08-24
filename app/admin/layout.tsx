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
    <div className="flex min-h-[calc(100vh-4rem)] bg-esports-navy-dark">
      {/* Admin Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-esports-navy-border/80 bg-esports-navy/60 p-4 md:block">
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-widest text-esports-orange">
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
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-all",
                  isActive
                    ? "bg-esports-orange text-white shadow-md shadow-esports-orange/20"
                    : "text-esports-silver hover:bg-esports-navy-light hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Demo Access Box */}
        <div className="mt-8 rounded-xl border border-esports-navy-border bg-esports-navy-card p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-esports-gold">
            <Flame className="h-3.5 w-3.5" />
            <span>Active Live Tournament</span>
          </div>
          <p className="text-[11px] text-esports-silver">
            BGMI Campus Showdown 2026 is currently live.
          </p>
          <Link
            href="/tournament/bgmi-campus-showdown-2026"
            target="_blank"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-esports-navy-light px-3 py-1.5 text-[11px] font-bold uppercase text-white hover:bg-esports-navy border border-esports-navy-border"
          >
            <Radio className="h-3 w-3 text-esports-orange" />
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
