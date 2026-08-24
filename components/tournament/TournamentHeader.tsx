"use client";

import { Tournament, Match } from "@/types/database";
import { LeaderboardRow } from "@/lib/scoring/leaderboard";
import { GameLogo } from "@/components/common/GameLogo";
import {
  Radio,
  Calendar,
  Trophy,
  Gamepad2,
  Maximize2,
  Share2,
  Users,
  Layers,
  Crosshair,
  Flame,
  Crown,
  ChevronRight,
  TrendingUp,
  Zap,
  Cpu,
  Activity,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TournamentHeaderProps {
  tournament: Tournament;
  completedMatchesCount: number;
  totalMatchesCount: number;
  latestMatch?: Match;
  standings?: LeaderboardRow[];
  onOpenExport?: () => void;
}

export function TournamentHeader({
  tournament,
  completedMatchesCount,
  totalMatchesCount,
  latestMatch,
  standings = [],
  onOpenExport,
}: TournamentHeaderProps) {
  const isLive = tournament.status === "LIVE";
  const leaderTeam = standings.length > 0 ? standings[0] : null;
  const totalKills = standings.reduce((acc, curr) => acc + curr.totalKills, 0);

  const topFraggerTeam = standings.reduce(
    (prev, current) => (prev.totalKills > current.totalKills ? prev : current),
    standings[0] || null
  );

  const progressPercent =
    totalMatchesCount > 0 ? Math.min(100, Math.round((completedMatchesCount / totalMatchesCount) * 100)) : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-[#FCEE0A]/40 bg-[#0A0A12] p-5 sm:p-7 shadow-[0_0_30px_rgba(252,238,10,0.08)] cyber-grid space-y-5">
      {/* Top Cyberpunk Hazard Header Strip */}
      <div className="flex items-center justify-between rounded-md border border-[#FCEE0A]/30 bg-[#05050A] px-4 py-2 text-xs">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FCEE0A] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FCEE0A] shadow-[0_0_8px_#FCEE0A]" />
          </span>
          <span className="font-orbitron font-black uppercase tracking-wider text-[#FCEE0A] text-xs shrink-0 flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5" /> [ TELEMETRY // HUD ]
          </span>
          <span className="text-[#252538] hidden sm:inline">|</span>
          <span className="text-slate-300 font-rajdhani font-bold text-xs truncate">
            {latestMatch?.status === "COMPLETED" ? (
              <>
                COMPLETED: <strong className="text-white">{latestMatch.name} [{latestMatch.map_name}]</strong> • CURRENT #1: <span className="text-[#FCEE0A] font-black">{leaderTeam?.team.name}</span> ({leaderTeam?.totalPoints} PTS)
              </>
            ) : isLive ? (
              <>
                <strong className="text-[#FF0055] font-black animate-pulse">WARZONE ENGAGED:</strong> {latestMatch?.name || "Match"} ON {latestMatch?.map_name || "Erangel"}
              </>
            ) : (
              <>
                GRID ONLINE • {standings.length} COMBATANTS LINKED • {totalMatchesCount} DYNAMIC MATCHES
              </>
            )}
          </span>
        </div>

        <Link
          href={`/tournament/${tournament.slug}/projector`}
          className="shrink-0 flex items-center gap-1 font-rajdhani font-bold text-xs uppercase tracking-wider text-[#00F0FF] hover:text-white ml-2 transition-colors"
        >
          <span>STAGE HUD</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Main Tournament Banner Content */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between pt-1">
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative rounded-xl border-2 border-[#FCEE0A] p-1 bg-[#12121E] shadow-[0_0_15px_rgba(252,238,10,0.3)] cyber-cut-tr">
            <GameLogo
              slug={tournament.game?.slug}
              name={tournament.game?.name}
              logoUrl={tournament.logo_url}
              size="lg"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 font-rajdhani font-bold">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 rounded bg-[#FF0055] px-2.5 py-0.5 text-xs font-black uppercase text-white shadow-[0_0_10px_rgba(255,0,85,0.4)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  LIVE NOW
                </span>
              ) : (
                <span className="rounded bg-[#161626] border border-[#252538] px-2.5 py-0.5 text-xs font-bold uppercase text-slate-300">
                  {tournament.status}
                </span>
              )}

              <span className="rounded bg-[#FCEE0A]/15 border border-[#FCEE0A] px-2.5 py-0.5 text-xs font-black uppercase text-[#FCEE0A]">
                {tournament.format || "SQUAD"} PROTOCOL
              </span>

              <span className="text-xs font-bold text-slate-400 font-mono">
                {tournament.game?.name || "Esports Title"}
              </span>
            </div>

            <h1 className="font-orbitron text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-none">
              {tournament.name}
            </h1>

            {tournament.description && (
              <p className="text-xs text-slate-400 max-w-2xl line-clamp-1 font-rajdhani font-medium leading-relaxed">
                {tournament.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 font-rajdhani">
          <Link
            href={`/tournament/${tournament.slug}/projector`}
            className="inline-flex items-center gap-1.5 border border-[#00F0FF] bg-[#00F0FF]/10 px-4 py-2.5 font-bold text-xs uppercase tracking-wider text-[#00F0FF] hover:bg-[#00F0FF] hover:text-slate-950 transition-all cyber-cut-tr shadow-[0_0_12px_rgba(0,240,255,0.2)]"
          >
            <Maximize2 className="h-4 w-4" />
            <span>Projector HUD</span>
          </Link>

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 bg-[#FCEE0A] px-5 py-2.5 font-black text-xs uppercase tracking-wider text-slate-950 shadow-[0_0_15px_rgba(252,238,10,0.4)] hover:brightness-110 active:scale-95 transition-all cyber-cut-tr"
            >
              <Share2 className="h-4 w-4" />
              <span>Export Poster / CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Cyberpunk Telemetry Metrics Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-[#252538] pt-4 text-xs font-rajdhani">
        {/* Tournament Leader */}
        <div className="space-y-1 rounded-xl bg-[#05050A] border border-[#FCEE0A]/30 p-3 cyber-cut-tr">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
            #1 DOMINATOR
          </span>
          <div className="font-orbitron font-black text-white truncate flex items-center gap-1.5 text-sm">
            {leaderTeam ? (
              <>
                <Crown className="h-4 w-4 text-[#FCEE0A] shrink-0" />
                <span className="truncate">{leaderTeam.team.name}</span>
                <span className="font-mono text-[#FCEE0A] text-xs font-bold">({leaderTeam.totalPoints}P)</span>
              </>
            ) : (
              "—"
            )}
          </div>
        </div>

        {/* Matches Completed with High-Voltage Progress Bar */}
        <div className="space-y-1 rounded-xl bg-[#05050A] border border-[#252538] p-3 cyber-cut-tr">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>GRID PROGRESS</span>
            <span className="font-mono text-[#00F0FF]">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded bg-[#12121E] border border-[#252538] overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-[#00F0FF] to-[#FCEE0A] shadow-[0_0_10px_#FCEE0A] transition-all duration-500"
            />
          </div>
          <span className="text-[10px] text-slate-400 font-mono block">
            {completedMatchesCount} OF {totalMatchesCount} MATCHES LOGGED
          </span>
        </div>

        {/* Total Elimination Frags */}
        <div className="space-y-1 rounded-xl bg-[#05050A] border border-[#FF0055]/30 p-3 cyber-cut-tr">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
            TOTAL ELIMINATIONS
          </span>
          <div className="font-orbitron font-black text-[#FF0055] text-sm font-mono flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-[#FF0055]" />
            <span>{totalKills} FRAGS</span>
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            MVP: {topFraggerTeam?.team.short_name || "—"} ({topFraggerTeam?.totalKills || 0})
          </span>
        </div>

        {/* Current Active Map & Stage */}
        <div className="space-y-1 rounded-xl bg-[#05050A] border border-[#252538] p-3 cyber-cut-tr">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
            ACTIVE ARENA
          </span>
          <div className="font-orbitron font-black text-white text-sm truncate">
            {latestMatch ? `${latestMatch.map_name || "Arena"}` : "GRAND FINALS"}
          </div>
          <span className="text-[10px] text-[#00F0FF] font-bold block truncate font-mono">
            {latestMatch?.round_name || "SCHEDULED STAGE"}
          </span>
        </div>
      </div>
    </div>
  );
}
