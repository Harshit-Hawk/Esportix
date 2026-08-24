"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Tv, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900 tracking-tight">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
              E
            </div>
            <span className="text-base font-bold text-slate-900">
              Esportix
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            <Link
              href="/"
              className={cn(
                "rounded-md px-3 py-1.5 transition-colors",
                pathname === "/"
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              Tournaments
            </Link>

            <Link
              href="/admin"
              className={cn(
                "rounded-md px-3 py-1.5 transition-colors",
                isAdmin
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              Admin Center
            </Link>
          </nav>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/tournaments/new"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <PlusCircle className="h-3.5 w-3.5 text-blue-600" />
            <span>Create Tournament</span>
          </Link>

          {!isAdmin ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Organizer Portal</span>
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Tv className="h-3.5 w-3.5 text-slate-500" />
              <span>Public View</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
