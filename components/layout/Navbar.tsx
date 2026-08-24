"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Tv, PlusCircle, Zap, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#242945] bg-[#090A10]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00F0FF] to-[#FF2A85] text-slate-950 font-orbitron font-black text-base shadow-[0_0_12px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-transform">
              E
            </div>
            <div className="flex flex-col">
              <span className="font-orbitron text-base font-black uppercase tracking-wider text-white group-hover:text-[#00F0FF] transition-colors">
                ESPORTIX<span className="text-[#FF2A85]">.</span>
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#00F0FF]/80 leading-none">
                SYS.V2.6 // REALTIME
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-chakra font-bold tracking-wider uppercase">
            <Link
              href="/"
              className={cn(
                "rounded-lg px-3.5 py-1.5 transition-all",
                pathname === "/"
                  ? "bg-[#16192B] text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  : "text-slate-400 hover:text-white hover:bg-[#11131F]"
              )}
            >
              Tournaments
            </Link>

            <Link
              href="/admin"
              className={cn(
                "rounded-lg px-3.5 py-1.5 transition-all",
                isAdmin
                  ? "bg-[#16192B] text-[#FF2A85] border border-[#FF2A85]/40 shadow-[0_0_10px_rgba(255,42,133,0.2)]"
                  : "text-slate-400 hover:text-white hover:bg-[#11131F]"
              )}
            >
              Admin Terminal
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/tournaments/new"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#00F0FF]/40 bg-[#00F0FF]/10 px-3.5 py-1.5 font-chakra text-xs font-bold uppercase tracking-wider text-[#00F0FF] hover:bg-[#00F0FF] hover:text-slate-950 transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)]"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Create Tournament</span>
          </Link>

          {!isAdmin ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FF2A85] to-[#9D4EDD] px-4 py-1.5 font-chakra text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,42,133,0.3)]"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Host Portal</span>
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#242945] bg-[#11131F] px-3.5 py-1.5 font-chakra text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            >
              <Tv className="h-3.5 w-3.5 text-[#00F0FF]" />
              <span>Arena View</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
