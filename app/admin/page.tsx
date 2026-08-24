"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Tournament, TournamentAuditLog } from "@/types/database";
import {
  Trophy,
  PlusCircle,
  Radio,
  Gamepad2,
  Users,
  Crosshair,
  Sliders,
  History,
  ArrowRight,
  ShieldCheck,
  Zap,
  Edit,
  Clock,
  Sparkles,
  Database,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [auditLogs, setAuditLogs] = useState<TournamentAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const { data: tourneys } = await supabase
          .from("tournaments")
          .select("*, game:games(*), teams(count), matches(count)")
          .order("created_at", { ascending: false });

        setTournaments(tourneys || []);

        const { data: logs } = await supabase
          .from("tournament_audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(8);

        setAuditLogs(logs || []);
      } catch (err) {
        console.error("Admin load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const totalTourneys = tournaments.length;
  const liveTourneys = tournaments.filter((t) => t.status === "LIVE").length;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-esports-navy-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Tournament Admin Control Room
            </h1>
            <span className="rounded-full bg-esports-orange/20 border border-esports-orange/40 px-2.5 py-0.5 text-[10px] font-black uppercase text-esports-orange">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-esports-silver mt-1">
            Manage tournaments, configure scoring systems, add matches, and enter rapid scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/tournaments/new"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-esports-orange to-orange-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-esports-orange/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Tournament</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-esports-navy-border bg-esports-navy-card p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-esports-silver">Active / Live Events</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
              <Radio className="h-4 w-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 font-display text-2xl font-black text-white">{liveTourneys}</div>
          <span className="text-[11px] text-emerald-400 font-semibold">Broadcasting Live</span>
        </div>

        <div className="rounded-xl border border-esports-navy-border bg-esports-navy-card p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-esports-silver">Total Tournaments</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-esports-orange/10 text-esports-orange">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-display text-2xl font-black text-white">{totalTourneys}</div>
          <span className="text-[11px] text-esports-silver">Configured in platform</span>
        </div>

        <div className="rounded-xl border border-esports-navy-border bg-esports-navy-card p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-esports-silver">Scoring Engine</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-esports-gold/10 text-esports-gold">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-display text-2xl font-black text-esports-gold">100% Active</div>
          <span className="text-[11px] text-esports-silver">Auto Tie-Breakers Enabled</span>
        </div>

        <div className="rounded-xl border border-esports-navy-border bg-esports-navy-card p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-esports-silver">Audit Trail</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <History className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-display text-2xl font-black text-white">{auditLogs.length}</div>
          <span className="text-[11px] text-esports-silver">Recent Score Actions</span>
        </div>
      </div>

      {/* Tournaments Management List */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-black uppercase text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-esports-orange" />
          <span>Tournaments Management</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {tournaments.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-4 rounded-xl border border-esports-navy-border bg-esports-navy-card p-5 shadow-lg lg:flex-row lg:items-center lg:justify-between hover:border-esports-orange/60 transition-all"
            >
              {/* Left Info */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-esports-navy-border bg-esports-navy-dark">
                  {t.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.logo_url} alt={t.name} className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    <Trophy className="h-6 w-6 text-esports-orange" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-black uppercase text-white">
                      {t.name}
                    </h3>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
                        t.status === "LIVE"
                          ? "bg-red-500/20 text-red-400 border border-red-500/40"
                          : "bg-esports-navy-light text-esports-silver"
                      )}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-esports-silver mt-1">
                    <span>Game: <strong className="text-white">{t.game?.name || "BGMI"}</strong></span>
                    <span>•</span>
                    <span>Slug: <code className="font-mono text-esports-orange">/{t.slug}</code></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/tournaments/${t.id}/matches`}
                  className="flex items-center gap-1.5 rounded-md bg-esports-orange px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow hover:brightness-110"
                >
                  <Crosshair className="h-3.5 w-3.5" />
                  <span>Enter Scores / Matches</span>
                </Link>

                <Link
                  href={`/admin/tournaments/${t.id}/teams`}
                  className="flex items-center gap-1.5 rounded-md border border-esports-navy-border bg-esports-navy-light px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-esports-cream hover:text-white hover:bg-esports-navy"
                >
                  <Users className="h-3.5 w-3.5 text-esports-gold" />
                  <span>Teams</span>
                </Link>

                <Link
                  href={`/admin/tournaments/${t.id}/scoring`}
                  className="flex items-center gap-1.5 rounded-md border border-esports-navy-border bg-esports-navy-light px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-esports-cream hover:text-white hover:bg-esports-navy"
                >
                  <Sliders className="h-3.5 w-3.5 text-blue-400" />
                  <span>Rules</span>
                </Link>

                <Link
                  href={`/admin/tournaments/${t.id}/audit`}
                  className="flex items-center gap-1.5 rounded-md border border-esports-navy-border bg-esports-navy-light px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-esports-silver hover:text-white hover:bg-esports-navy"
                >
                  <History className="h-3.5 w-3.5 text-purple-400" />
                  <span>Audit</span>
                </Link>

                <Link
                  href={`/tournament/${t.slug}`}
                  target="_blank"
                  className="flex items-center gap-1.5 rounded-md border border-esports-navy-border bg-esports-navy-dark px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-esports-silver hover:text-white"
                >
                  <Radio className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Public View</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Audit Trail Feed */}
      <div className="rounded-xl border border-esports-navy-border bg-esports-navy-card p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-esports-navy-border pb-3">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-esports-gold" />
            <h3 className="font-display text-base font-black uppercase text-white">
              Recent Score Audit Trail
            </h3>
          </div>
          <span className="text-xs text-esports-silver">Fair-play & Dispute Logging</span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-esports-silver py-4">No recent score edits recorded.</p>
        ) : (
          <div className="divide-y divide-esports-navy-border/40">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="rounded bg-esports-navy-dark px-2 py-0.5 font-mono text-[10px] font-bold text-esports-orange border border-esports-navy-border">
                    {log.action}
                  </span>
                  <span className="font-bold text-white">
                    {log.user_name || "Admin"} updated {log.entity_type}
                  </span>
                  {log.new_value && (
                    <span className="text-esports-silver font-mono text-[11px]">
                      {JSON.stringify(log.new_value).slice(0, 60)}...
                    </span>
                  )}
                </div>
                <span className="text-esports-silver font-mono text-[11px]">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
