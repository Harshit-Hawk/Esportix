"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Tournament, TournamentAuditLog } from "@/types/database";
import {
  Trophy,
  PlusCircle,
  Gamepad2,
  Calendar,
  Eye,
  Sliders,
  Users,
  ShieldCheck,
  Radio,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [auditLogs, setAuditLogs] = useState<TournamentAuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: tourneys } = await supabase
          .from("tournaments")
          .select("*, game:games(*), matches(*), teams(*)")
          .order("created_at", { ascending: false });

        setTournaments(tourneys || []);

        const { data: logs } = await supabase
          .from("tournament_audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(8);

        setAuditLogs(logs || []);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeTourneys = tournaments.filter((t) => t.status === "LIVE");
  const completedTourneys = tournaments.filter((t) => t.status === "COMPLETED");
  const totalTeams = tournaments.reduce((acc, t) => acc + (t.teams?.length || 0), 0);
  const totalMatches = tournaments.reduce((acc, t) => acc + (t.matches?.length || 0), 0);

  const filteredTournaments = tournaments.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.game?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Fast Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-600">
              TOURNAMENT ORGANIZER PORTAL
            </span>
          </div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-slate-900 sm:text-4xl">
            Control Room Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create events, manage teams, dynamically schedule matches, and publish live scores in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/tournaments/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <PlusCircle className="h-4 w-4 text-yellow-300" />
            <span>Create Tournament</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Tournaments</span>
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="mt-3 font-display text-3xl font-black text-slate-900">
            {tournaments.length}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{activeTourneys.length} Active • {completedTourneys.length} Completed</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Squads / Players</span>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-3 font-display text-3xl font-black text-slate-900">
            {totalTeams}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            Across all registered tournaments
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Matches Scheduled</span>
            <Layers className="h-5 w-5 text-cyan-600" />
          </div>
          <div className="mt-3 font-display text-3xl font-black text-slate-900">
            {totalMatches}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            Dynamic on-demand scheduling
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Live System Sync</span>
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-3 font-display text-xl font-black text-emerald-600 flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            REALTIME ACTIVE
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            WebSockets auto-broadcasting
          </div>
        </div>
      </div>

      {/* Tournaments List Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            <h2 className="font-display text-xl font-black uppercase text-slate-900">
              Tournament Events
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tournament by name or game..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredTournaments.map((tourney) => {
            const isLive = tourney.status === "LIVE";
            const teamCount = tourney.teams?.length || 0;
            const matchCount = tourney.matches?.length || 0;

            return (
              <div
                key={tourney.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                        {tourney.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={tourney.logo_url}
                            alt={tourney.name}
                            className="h-full w-full object-cover rounded-xl"
                          />
                        ) : (
                          <Gamepad2 className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-lg font-black uppercase text-slate-900 group-hover:text-blue-600 transition-colors">
                            {tourney.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-semibold text-slate-800">
                            {tourney.game?.name || "BGMI"}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-blue-600 font-bold">
                            {tourney.format || "SQUAD"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {isLive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-black uppercase text-red-600">
                          <Radio className="h-3 w-3 animate-pulse" /> LIVE
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                          {tourney.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                    {tourney.description || "Official tournament scorecard and dynamic match standings."}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-y border-slate-100 py-3 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Teams / Players:</span>
                      <strong className="text-slate-900 font-mono">{teamCount} Registered</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Matches:</span>
                      <strong className="text-slate-900 font-mono">{matchCount} Scheduled</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/admin/tournaments/${tourney.id}/matches`}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold uppercase text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Matches ({matchCount})
                    </Link>

                    <Link
                      href={`/admin/tournaments/${tourney.id}/teams`}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold uppercase text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Roster ({teamCount})
                    </Link>

                    <Link
                      href={`/admin/tournaments/${tourney.id}/scoring`}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold uppercase text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      title="Edit Scoring Rules"
                    >
                      <Sliders className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <Link
                    href={`/tournament/${tourney.slug}`}
                    target="_blank"
                    className="flex items-center gap-1 text-xs font-black uppercase text-blue-600 hover:text-blue-700"
                  >
                    <span>Public View</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Log Activity Feed */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="font-display text-base font-black uppercase text-slate-900">
              Immutable Score Audit Trail
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Tracks score changes, match locks, and publisher actions
          </span>
        </div>

        <div className="space-y-2">
          {auditLogs.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No audit logs recorded yet.
            </div>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-yellow-400 px-2 py-0.5 font-mono text-[10px] font-black text-slate-950 border border-yellow-500">
                    {log.action}
                  </span>
                  <span className="text-slate-900 font-semibold">{log.user_name || "Admin"}</span>
                  <span className="text-slate-500 text-[11px] hidden sm:inline">
                    {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)}...)` : ""}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
