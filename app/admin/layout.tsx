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
    { href: "/admin", label: "Tournament Command", icon: LayoutDashboard },
    { href: "/admin/tournaments/new", label: "Launch Tournament", icon: PlusCircle },
  ];

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-[#090A10] text-white">
      {/* Admin Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-[#242945] bg-[#0D0E18] p-4 md:block font-chakra">
        <div className="px-3 py-2 text-[10px] font-orbitron font-bold uppercase tracking-widest text-[#00F0FF]">
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
                  "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all",
                  isActive
                    ? "bg-[#16192B] text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                    : "text-slate-400 hover:bg-[#11131F] hover:text-white"
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
          <div className="mt-8 rounded-2xl border border-[#00F0FF]/30 bg-[#11131F] p-3.5 space-y-2 shadow-sm">
            <div className="text-[10px] font-orbitron font-bold uppercase text-[#00F0FF]">
              ACTIVE WARZONE
            </div>
            <p className="text-xs text-white font-chakra font-bold truncate">
              {activeTourney.name}
            </p>
            <Link
              href={`/tournament/${activeTourney.slug}`}
              target="_blank"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 px-3 py-2 text-xs font-bold uppercase text-[#00F0FF] hover:bg-[#00F0FF] hover:text-slate-950 transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)]"
            >
              <Radio className="h-3.5 w-3.5 text-[#FF2A85] animate-pulse" />
              <span>Public Arena</span>
            </Link>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-[#242945] bg-[#11131F]/50 p-4 text-center space-y-2">
            <Trophy className="mx-auto h-5 w-5 text-slate-600" />
            <p className="text-xs text-slate-400">
              No active tournaments in orbit.
            </p>
          </div>
        )}
      </aside>

      {/* Main Admin Viewport */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto retro-grid">
        {children}
      </div>
    </div>
  );
}
