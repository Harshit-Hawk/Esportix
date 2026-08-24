"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Tournament, TournamentAuditLog } from "@/types/database";
import { GameLogo } from "@/components/common/GameLogo";
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
  Layers,
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
          .limit(6);

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
  const totalTeams = tournaments.reduce((acc, t) => acc + (t.teams?.length || 0), 0);
  const totalMatches = tournaments.reduce((acc, t) => acc + (t.matches?.length || 0), 0);

  const filteredTournaments = tournaments.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.game?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
            Tournament Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage teams, schedule matches on-demand, and record live scores.
          </p>
        </div>

        <Link
          href="/admin/tournaments/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Tournament</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Tournaments
          </span>
          <div className="mt-1 font-bold text-2xl text-slate-900 font-mono">
            {tournaments.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
            {activeTourneys.length} Live
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Total Teams
          </span>
          <div className="mt-1 font-bold text-2xl text-slate-900 font-mono">
            {totalTeams}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
            Registered
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Matches
          </span>
          <div className="mt-1 font-bold text-2xl text-slate-900 font-mono">
            {totalMatches}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
            Scheduled
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Realtime Engine
          </span>
          <div className="mt-1 font-bold text-base text-emerald-600 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Active</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            WebSockets Connected
          </span>
        </div>
      </div>

      {/* Tournaments List */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Tournaments ({filteredTournaments.length})
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tournament..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-sm"
            />
          </div>
        </div>

        {filteredTournaments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 space-y-4 shadow-xs">
            <Trophy className="mx-auto h-12 w-12 text-slate-300" />
            <div className="space-y-1">
              <h3 className="font-display font-black text-slate-900 text-base uppercase">
                {tournaments.length === 0 ? "No Active Tournaments" : "No Matching Tournaments Found"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {tournaments.length === 0
                  ? "You haven't created any tournaments yet. Click below to launch a new tournament with custom scoring rules, teams, and dynamic matches."
                  : "Try adjusting your search filter."}
              </p>
            </div>
            {tournaments.length === 0 && (
              <Link
                href="/admin/tournaments/new"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create New Tournament</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTournaments.map((tourney) => {
              const isLive = tourney.status === "LIVE";
              const teamCount = tourney.teams?.length || 0;
              const matchCount = tourney.matches?.length || 0;

              return (
                <div
                  key={tourney.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Game Logo */}
                        <GameLogo
                          slug={tourney.game?.slug}
                          name={tourney.game?.name}
                          logoUrl={tourney.logo_url}
                          size="md"
                        />

                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">
                            {tourney.name}
                          </h3>
                          <span className="text-xs text-slate-500 font-medium">
                            {tourney.game?.name || "Game"} • <span className="text-blue-600 font-semibold">{tourney.format || "SQUAD"}</span>
                          </span>
                        </div>
                      </div>

                      {isLive ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 border border-red-200 shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-600" /> Live
                        </span>
                      ) : (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 shrink-0">
                          {tourney.status}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase block">Teams</span>
                        <strong className="text-slate-900 font-mono">{teamCount}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase block">Matches</span>
                        <strong className="text-slate-900 font-mono">{matchCount}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Link
                        href={`/admin/tournaments/${tourney.id}/matches`}
                        className="rounded px-2 py-1 text-slate-700 hover:bg-slate-100"
                      >
                        Matches
                      </Link>
                      <Link
                        href={`/admin/tournaments/${tourney.id}/teams`}
                        className="rounded px-2 py-1 text-slate-700 hover:bg-slate-100"
                      >
                        Roster
                      </Link>
                      <Link
                        href={`/admin/tournaments/${tourney.id}/scoring`}
                        className="rounded px-2 py-1 text-slate-700 hover:bg-slate-100"
                      >
                        Rules
                      </Link>
                    </div>

                    <Link
                      href={`/tournament/${tourney.slug}`}
                      target="_blank"
                      className="font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Public &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audit Log Activity */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs">
          <span className="font-semibold text-slate-900">Recent Audit Actions</span>
          <span className="text-slate-400">Score & Match Activity</span>
        </div>

        <div className="space-y-1.5 text-xs">
          {auditLogs.length === 0 ? (
            <div className="py-4 text-center text-slate-400">No activity logged yet.</div>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-1.5 text-slate-600 border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                    {log.action}
                  </span>
                  <span className="font-medium text-slate-900">{log.user_name || "Admin"}</span>
                  <span className="text-slate-400 text-[11px] hidden sm:inline">
                    {log.entity_type}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">
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
