"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Tv, PlusCircle, Zap, Terminal, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-[#FCEE0A]/40 bg-[#05050A]/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Cyberpunk Yellow Cutout Box */}
            <div className="relative flex h-8 w-8 items-center justify-center bg-[#FCEE0A] text-slate-950 font-orbitron font-black text-base cyber-cut-tr shadow-[0_0_15px_rgba(252,238,10,0.5)] group-hover:scale-105 transition-transform">
              E
            </div>
            <div className="flex flex-col">
              <span className="font-orbitron text-base font-black uppercase tracking-wider text-white group-hover:text-[#FCEE0A] transition-colors">
                ESPORTIX<span className="text-[#FCEE0A]">_2077</span>
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#00F0FF] leading-none">
                [ SYS_NET: LINKED ]
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-rajdhani font-bold tracking-wider uppercase">
            <Link
              href="/"
              className={cn(
                "rounded-md px-3.5 py-1.5 transition-all cyber-cut-tr",
                pathname === "/"
                  ? "bg-[#FCEE0A] text-slate-950 font-black shadow-[0_0_12px_rgba(252,238,10,0.4)]"
                  : "text-slate-300 hover:text-white hover:bg-[#12121E]"
              )}
            >
              Tournaments
            </Link>

            <Link
              href="/admin"
              className={cn(
                "rounded-md px-3.5 py-1.5 transition-all cyber-cut-tr",
                isAdmin
                  ? "bg-[#00F0FF] text-slate-950 font-black shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                  : "text-slate-300 hover:text-white hover:bg-[#12121E]"
              )}
            >
              Command Center
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/tournaments/new"
            className="inline-flex items-center gap-1.5 bg-[#FCEE0A]/10 border border-[#FCEE0A] px-3.5 py-1.5 font-rajdhani text-xs font-bold uppercase tracking-wider text-[#FCEE0A] hover:bg-[#FCEE0A] hover:text-slate-950 transition-all cyber-cut-tr shadow-[0_0_10px_rgba(252,238,10,0.2)]"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Create Tournament</span>
          </Link>

          {!isAdmin ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#FF0055] to-[#FF007F] px-4 py-1.5 font-rajdhani text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 active:scale-95 transition-all cyber-cut-tr shadow-[0_0_15px_rgba(255,0,85,0.35)]"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Organizer Terminal</span>
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 border border-[#252538] bg-[#0E0E1A] px-3.5 py-1.5 font-rajdhani text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:border-[#00F0FF] transition-colors cyber-cut-tr"
            >
              <Tv className="h-3.5 w-3.5 text-[#00F0FF]" />
              <span>Arena HUD</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
