"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Trophy, Shield, Flame, Radio, LayoutDashboard, Database, Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleQuickSeed = async () => {
    try {
      setIsSeeding(true);
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSeedSuccess(true);
        setTimeout(() => setSeedSuccess(false), 4000);
        window.location.reload();
      } else {
        alert("Seed error: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Seed failed: " + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const navLinks = [
    { href: "/", label: "Tournaments", icon: Trophy },
    { href: "/tournament/bgmi-campus-showdown-2026", label: "Live Scorecard", icon: Radio, pulse: true },
    { href: "/admin", label: "Admin Control Room", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-esports-navy-border/80 bg-esports-navy-dark/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-esports-orange to-orange-600 shadow-lg shadow-esports-orange/20 transition-transform group-hover:scale-105">
              <Flame className="h-6 w-6 text-white" />
              <div className="absolute -inset-0.5 rounded-lg bg-esports-orange opacity-40 blur-sm group-hover:opacity-75 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-2xl font-black tracking-wider text-white">
                ESPORT<span className="text-esports-orange">IX</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-esports-silver -mt-1 font-semibold">
                Tournament Scoring Engine
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 ml-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all",
                    isActive
                      ? "bg-esports-navy-light text-white shadow-sm border border-esports-navy-border text-glow-orange"
                      : "text-esports-silver hover:bg-esports-navy-light/50 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-4 w-4", link.pulse ? "text-esports-orange animate-pulse" : "")} />
                  <span>{link.label}</span>
                  {link.pulse && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-esports-orange opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-esports-orange"></span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Quick Seed Button */}
          <button
            onClick={handleQuickSeed}
            disabled={isSeeding}
            title="Seed BGMI Showdown with 16 teams and 18 matches"
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border",
              seedSuccess
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-esports-navy-light/60 text-esports-silver hover:text-white border-esports-navy-border hover:border-esports-orange/50 hover:bg-esports-navy-light"
            )}
          >
            <Database className={cn("h-3.5 w-3.5", isSeeding ? "animate-spin" : "text-esports-gold")} />
            <span>{isSeeding ? "Seeding..." : seedSuccess ? "✓ Seeded 18 Matches" : "Quick Seed Demo"}</span>
          </button>

          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-md bg-gradient-to-r from-esports-orange to-orange-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-esports-orange/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Shield className="h-4 w-4" />
            <span>Admin Center</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-esports-silver hover:bg-esports-navy-light hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-esports-navy-border bg-esports-navy px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold uppercase tracking-wider",
                  isActive
                    ? "bg-esports-navy-light text-esports-orange"
                    : "text-esports-silver hover:bg-esports-navy-light hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-esports-navy-border/60 flex flex-col gap-2">
            <button
              onClick={handleQuickSeed}
              disabled={isSeeding}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-esports-navy-border bg-esports-navy-light/60 px-3 py-2 text-xs font-bold uppercase tracking-wider text-esports-silver"
            >
              <Database className="h-4 w-4 text-esports-gold" />
              <span>{isSeeding ? "Seeding..." : "Quick Seed BGMI 18 Matches"}</span>
            </button>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-esports-orange px-3 py-2 text-xs font-black uppercase tracking-wider text-white"
            >
              <Shield className="h-4 w-4" />
              <span>Admin Center</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
