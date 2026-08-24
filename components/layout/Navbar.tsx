"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy,
  Shield,
  Layers,
  Sparkles,
  Tv,
  Radio,
  ExternalLink,
  ChevronRight,
  Sliders,
  Database,
  Flame,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const isAdmin = pathname.startsWith("/admin");

  const handleQuickSeed = async () => {
    try {
      setSeeding(true);
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSeedSuccess(true);
        setTimeout(() => {
          setSeedSuccess(false);
          window.location.href = `/tournament/${data.tournament.slug}`;
        }, 1200);
      } else {
        alert("Seed failed: " + data.error);
      }
    } catch (err: any) {
      alert("Seed request error: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo with Electric Blue & Yellow */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Trophy className="h-5 w-5 text-yellow-300 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xl font-black uppercase tracking-tight text-slate-900">
                  Esport<span className="text-blue-600">ix</span>
                </span>
                <span className="rounded-full bg-yellow-400/30 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-widest text-slate-900 border border-yellow-400">
                  PRO
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 -mt-1">
                Tournament Matrix
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all",
                pathname === "/"
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              Tournaments
            </Link>

            <Link
              href="/admin"
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all",
                isAdmin
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              Control Room
            </Link>
          </nav>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Seed Button */}
          <button
            onClick={handleQuickSeed}
            disabled={seeding || seedSuccess}
            className={cn(
              "hidden sm:flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all",
              seedSuccess
                ? "bg-emerald-50 text-emerald-600 border-emerald-300"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            )}
            title="Reset and populate BGMI 16-Squads Demo tournament"
          >
            <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
            <span>{seeding ? "Populating..." : seedSuccess ? "✓ Seeded Live!" : "Load Demo Data"}</span>
          </button>

          {/* Admin Switcher */}
          {!isAdmin ? (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <Shield className="h-3.5 w-3.5 text-yellow-300" />
              <span>Admin Room</span>
            </Link>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
            >
              <Tv className="h-3.5 w-3.5 text-blue-600" />
              <span>Public View</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
