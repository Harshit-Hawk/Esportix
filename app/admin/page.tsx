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
  Activity,
  Terminal,
  Cpu,
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
    <div className="space-y-6 max-w-7xl mx-auto font-rajdhani">
      {/* Top Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b-2 border-[#252538] pb-4">
        <div>
          <h1 className="font-orbitron text-xl font-black uppercase text-white tracking-tight sm:text-2xl">
            Operations Command Hub
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Manage teams, schedule matches on-demand, and record live telemetry.
          </p>
        </div>

        <Link
          href="/admin/tournaments/new"
          className="inline-flex items-center gap-2 bg-[#FCEE0A] px-5 py-2 font-orbitron text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_15px_rgba(252,238,10,0.4)] hover:brightness-110 active:scale-95 transition-all cyber-cut-tr"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Tournament</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="border-2 border-[#252538] bg-[#0A0A12] p-4 shadow-sm cyber-cut-tr">
          <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest block">
            TOURNAMENTS
          </span>
          <div className="mt-1 font-orbitron font-black text-2xl text-white">
            {tournaments.length}
          </div>
          <span className="text-xs text-[#00FF66] font-bold mt-0.5 block font-mono">
            {activeTourneys.length} LIVE NOW
          </span>
        </div>

        <div className="border-2 border-[#252538] bg-[#0A0A12] p-4 shadow-sm cyber-cut-tr">
          <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest block">
            TOTAL COMBATANTS
          </span>
          <div className="mt-1 font-orbitron font-black text-2xl text-white">
            {totalTeams}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block font-bold">
            REGISTERED
          </span>
        </div>

        <div className="border-2 border-[#252538] bg-[#0A0A12] p-4 shadow-sm cyber-cut-tr">
          <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest block">
            MATCHES
          </span>
          <div className="mt-1 font-orbitron font-black text-2xl text-white">
            {totalMatches}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block font-bold">
            SCHEDULED
          </span>
        </div>

        <div className="border-2 border-[#252538] bg-[#0A0A12] p-4 shadow-sm cyber-cut-tr">
          <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest block">
            REALTIME TELEMETRY
          </span>
          <div className="mt-1 font-orbitron font-bold text-base text-[#00FF66] flex items-center gap-1.5 drop-shadow-[0_0_5px_#00FF66]">
            <span className="h-2 w-2 rounded-full bg-[#00FF66] animate-pulse" />
            <span>LINKED</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block font-mono">
            WebSockets 100%
          </span>
        </div>
      </div>

      {/* Tournaments List */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-orbitron text-sm font-black uppercase text-white tracking-wider">
            Tournaments ({filteredTournaments.length})
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search tournament title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-[#252538] bg-[#0E0E1A] py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-[#FCEE0A] focus:outline-none shadow-sm"
            />
          </div>
        </div>

        {filteredTournaments.length === 0 ? (
          <div className="border-2 border-dashed border-[#252538] bg-[#0A0A12] p-12 text-center text-slate-400 space-y-4 shadow-sm cyber-cut-tr">
            <Trophy className="mx-auto h-12 w-12 text-slate-600" />
            <div className="space-y-1">
              <h3 className="font-orbitron font-black text-white text-base uppercase">
                {tournaments.length === 0 ? "No Active Tournaments" : "No Matching Tournaments Found"}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {tournaments.length === 0
                  ? "Launch a new tournament with custom scoring rules, teams, and dynamic matches."
                  : "Try adjusting your search filter."}
              </p>
            </div>
            {tournaments.length === 0 && (
              <Link
                href="/admin/tournaments/new"
                className="inline-flex items-center gap-2 bg-[#FCEE0A] px-6 py-2.5 font-orbitron text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_15px_rgba(252,238,10,0.4)] hover:brightness-110 transition-all cyber-cut-tr"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Launch New Tournament</span>
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
                  className="flex flex-col justify-between border-2 border-[#252538] bg-[#0A0A12] p-5 shadow-sm space-y-4 hover:border-[#FCEE0A] transition-all cyber-cut-tr"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-[#12121E] border border-[#FCEE0A]/40 cyber-cut-tr">
                          <GameLogo
                            slug={tourney.game?.slug}
                            name={tourney.game?.name}
                            logoUrl={tourney.logo_url}
                            size="md"
                          />
                        </div>

                        <div>
                          <h3 className="font-orbitron font-black text-white text-sm">
                            {tourney.name}
                          </h3>
                          <span className="text-xs text-slate-400 font-bold">
                            {tourney.game?.name} • <span className="text-[#FCEE0A]">{tourney.format || "SQUAD"}</span>
                          </span>
                        </div>
                      </div>

                      {isLive ? (
                        <span className="inline-flex items-center gap-1 bg-[#FF0055] px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-[0_0_8px_rgba(255,0,85,0.4)] shrink-0 cyber-cut-tr">
                          <span className="h-1.5 w-1.5 bg-white animate-pulse" /> Live
                        </span>
                      ) : (
                        <span className="bg-[#161626] border border-[#252538] px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-300 shrink-0 cyber-cut-tr">
                          {tourney.status}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 bg-[#12121E] border border-[#252538] p-3 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase block font-bold">Combatants</span>
                        <strong className="text-white font-mono text-sm">{teamCount}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase block font-bold">Matches</span>
                        <strong className="text-white font-mono text-sm">{matchCount}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#252538] pt-3 text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/tournaments/${tourney.id}/matches`}
                        className="rounded px-2.5 py-1 text-slate-300 hover:bg-[#161626] hover:text-[#FCEE0A] transition-colors"
                      >
                        Matches
                      </Link>
                      <Link
                        href={`/admin/tournaments/${tourney.id}/teams`}
                        className="rounded px-2.5 py-1 text-slate-300 hover:bg-[#161626] hover:text-[#FCEE0A] transition-colors"
                      >
                        Roster
                      </Link>
                      <Link
                        href={`/admin/tournaments/${tourney.id}/scoring`}
                        className="rounded px-2.5 py-1 text-slate-300 hover:bg-[#161626] hover:text-[#FCEE0A] transition-colors"
                      >
                        Rules
                      </Link>
                    </div>

                    <Link
                      href={`/tournament/${tourney.slug}`}
                      target="_blank"
                      className="font-bold text-[#FCEE0A] hover:underline"
                    >
                      Arena &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audit Log Activity */}
      <div className="border-2 border-[#252538] bg-[#0A0A12] p-5 shadow-sm space-y-3 cyber-cut-tr">
        <div className="flex items-center justify-between border-b border-[#252538] pb-2.5 text-xs">
          <span className="font-orbitron font-bold text-white uppercase">[ TELEMETRY AUDIT ACTIONS ]</span>
          <span className="text-slate-400 font-mono text-[11px]">Score & Match Logging</span>
        </div>

        <div className="space-y-1.5 text-xs">
          {auditLogs.length === 0 ? (
            <div className="py-4 text-center text-slate-500">No activity logged yet.</div>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-2 text-slate-300 border-b border-[#252538]/40 last:border-0 font-medium"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-[#161626] border border-[#252538] px-2 py-0.5 font-mono text-[10px] font-bold text-[#FCEE0A]">
                    {log.action}
                  </span>
                  <span className="font-bold text-white">{log.user_name || "Admin"}</span>
                  <span className="text-slate-400 text-[11px] hidden sm:inline">
                    {log.entity_type}
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
