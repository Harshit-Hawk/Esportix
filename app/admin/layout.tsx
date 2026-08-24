"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Shield,
  LayoutDashboard,
  PlusCircle,
  Radio,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [activeTourney, setActiveTourney] = useState<{ name: string; slug: string } | null>(null);

  useEffect(() => {
    async function loadActive() {
      const { data } = await supabase
        .from("tournaments")
        .select("name, slug")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (data) setActiveTourney(data);
    }
    loadActive();
  }, []);

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

        {/* Dynamic Tournament Link if exists */}
        {activeTourney ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div className="text-[11px] font-semibold text-slate-700">
              Active Event
            </div>
            <p className="text-[11px] text-slate-500 leading-tight truncate">
              {activeTourney.name}
            </p>
            <Link
              href={`/tournament/${activeTourney.slug}`}
              target="_blank"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs"
            >
              <Radio className="h-3 w-3 text-red-500" />
              <span>Public Scorecard</span>
            </Link>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3 text-center space-y-2">
            <Trophy className="mx-auto h-5 w-5 text-slate-400" />
            <p className="text-[11px] text-slate-500">
              No tournaments yet. Create one to get started.
            </p>
          </div>
        )}
      </aside>

      {/* Main Admin Viewport */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
