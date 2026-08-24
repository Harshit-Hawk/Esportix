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
  Terminal,
  Activity,
  Cpu,
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
    { href: "/admin", label: "Command Center", icon: LayoutDashboard },
    { href: "/admin/tournaments/new", label: "Launch Tournament", icon: PlusCircle },
  ];

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-[#05050A] text-white font-rajdhani">
      {/* Admin Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r-2 border-[#252538] bg-[#0A0A12] p-4 md:block">
        <div className="px-3 py-2 text-[10px] font-orbitron font-bold uppercase tracking-widest text-[#FCEE0A]">
          OPERATIONS TERMINAL
        </div>

        <nav className="mt-2 space-y-1.5">
          {sidebarLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cyber-cut-tr",
                  isActive
                    ? "bg-[#FCEE0A] text-slate-950 font-black shadow-[0_0_15px_rgba(252,238,10,0.4)]"
                    : "text-slate-300 hover:bg-[#12121E] hover:text-[#FCEE0A]"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Dynamic Tournament Link */}
        {activeTourney ? (
          <div className="mt-8 border-2 border-[#FCEE0A]/40 bg-[#0E0E1A] p-3.5 space-y-2 shadow-[0_0_15px_rgba(252,238,10,0.1)] cyber-cut-tr">
            <div className="text-[10px] font-orbitron font-bold uppercase text-[#FCEE0A]">
              ACTIVE ARENA
            </div>
            <p className="text-xs text-white font-bold truncate">
              {activeTourney.name}
            </p>
            <Link
              href={`/tournament/${activeTourney.slug}`}
              target="_blank"
              className="inline-flex w-full items-center justify-center gap-1.5 bg-[#00F0FF] px-3 py-2 text-xs font-black uppercase text-slate-950 hover:brightness-110 transition-all cyber-cut-tr shadow-[0_0_10px_rgba(0,240,255,0.3)]"
            >
              <Radio className="h-3.5 w-3.5 text-slate-950 animate-pulse" />
              <span>Spectate Live</span>
            </Link>
          </div>
        ) : (
          <div className="mt-8 border border-dashed border-[#252538] bg-[#0E0E1A]/50 p-4 text-center space-y-2 cyber-cut-tr">
            <Trophy className="mx-auto h-5 w-5 text-slate-600" />
            <p className="text-xs text-slate-400">
              No active tournaments linked.
            </p>
          </div>
        )}
      </aside>

      {/* Main Admin Viewport */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto cyber-grid">
        {children}
      </div>
    </div>
  );
}
