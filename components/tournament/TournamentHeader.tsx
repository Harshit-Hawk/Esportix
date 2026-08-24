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
    <div className="relative overflow-hidden rounded-3xl border-2 border-[#242945] bg-[#11131F] p-5 sm:p-7 shadow-[0_0_30px_rgba(0,240,255,0.06)] retro-grid space-y-5">
      {/* Top Cyber Telemetry Bar */}
      <div className="flex items-center justify-between rounded-xl border border-[#00F0FF]/30 bg-[#090A10]/90 px-4 py-2 text-xs">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
          </span>
          <span className="font-orbitron font-black uppercase tracking-wider text-[#00F0FF] text-xs shrink-0 flex items-center gap-1">
            <Activity className="h-3.5 w-3.5" /> LIVE TELEMETRY
          </span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-slate-300 font-chakra text-xs truncate">
            {latestMatch?.status === "COMPLETED" ? (
              <>
                LAST MATCH: <strong className="text-white">{latestMatch.name} [{latestMatch.map_name}]</strong> • CURRENT #1: <span className="text-[#FFE600] font-bold">{leaderTeam?.team.name}</span> ({leaderTeam?.totalPoints} PTS)
              </>
            ) : isLive ? (
              <>
                <strong className="text-[#FF2A85] font-bold animate-pulse">WAR ZONE ACTIVE:</strong> {latestMatch?.name || "Match"} ON {latestMatch?.map_name || "Erangel"}
              </>
            ) : (
              <>
                GRID ONLINE • {standings.length} COMBATANTS LINKED • {totalMatchesCount} MATCHES SCHEDULED
              </>
            )}
          </span>
        </div>

        <Link
          href={`/tournament/${tournament.slug}/projector`}
          className="shrink-0 flex items-center gap-1 font-chakra font-bold text-xs uppercase tracking-wider text-[#00F0FF] hover:text-white ml-2 transition-colors"
        >
          <span>CYBER STAGE</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Main Tournament Banner Content */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between pt-1">
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative rounded-2xl border-2 border-[#00F0FF]/40 p-1 bg-[#16192B] shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <GameLogo
              slug={tournament.game?.slug}
              name={tournament.game?.name}
              logoUrl={tournament.logo_url}
              size="lg"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 font-chakra">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF2A85]/20 border border-[#FF2A85] px-2.5 py-0.5 text-xs font-black uppercase text-[#FF2A85] shadow-[0_0_10px_rgba(255,42,133,0.3)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF2A85] animate-pulse" />
                  LIVE ARENA
                </span>
              ) : (
                <span className="rounded-lg bg-[#16192B] border border-[#242945] px-2.5 py-0.5 text-xs font-bold uppercase text-slate-300">
                  {tournament.status}
                </span>
              )}

              <span className="rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/40 px-2.5 py-0.5 text-xs font-black uppercase text-[#00F0FF]">
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
              <p className="text-xs text-slate-400 max-w-2xl line-clamp-1 font-chakra leading-relaxed">
                {tournament.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Link
            href={`/tournament/${tournament.slug}/projector`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#00F0FF]/40 bg-[#16192B] px-4 py-2.5 font-chakra text-xs font-bold uppercase tracking-wider text-[#00F0FF] hover:bg-[#00F0FF] hover:text-slate-950 transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)]"
          >
            <Maximize2 className="h-4 w-4" />
            <span>Projector HUD</span>
          </Link>

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FF2A85] to-[#9D4EDD] px-5 py-2.5 font-chakra text-xs font-black uppercase tracking-wider text-white shadow-[0_0_15px_rgba(255,42,133,0.3)] hover:brightness-110 active:scale-95 transition-all"
            >
              <Share2 className="h-4 w-4 text-[#FFE600]" />
              <span>Export Holo-Poster</span>
            </button>
          )}
        </div>
      </div>

      {/* Cyber Metrics & Progress Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-[#242945] pt-4 text-xs font-chakra">
        {/* Tournament Leader */}
        <div className="space-y-1 rounded-xl bg-[#090A10]/60 border border-[#242945] p-3">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
            #1 DOMINATOR
          </span>
          <div className="font-orbitron font-black text-white truncate flex items-center gap-1.5 text-sm">
            {leaderTeam ? (
              <>
                <Crown className="h-4 w-4 text-[#FFE600] shrink-0" />
                <span className="truncate">{leaderTeam.team.name}</span>
                <span className="font-mono text-[#00F0FF] text-xs font-bold">({leaderTeam.totalPoints}P)</span>
              </>
            ) : (
              "—"
            )}
          </div>
        </div>

        {/* Matches Completed with Holographic Progress Bar */}
        <div className="space-y-1 rounded-xl bg-[#090A10]/60 border border-[#242945] p-3">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>GRID PROGRESS</span>
            <span className="font-mono text-[#00F0FF]">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#16192B] border border-[#242945] overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-[#00F0FF] to-[#FF2A85] shadow-[0_0_10px_#00F0FF] transition-all duration-500 rounded-full"
            />
          </div>
          <span className="text-[10px] text-slate-400 font-mono block">
            {completedMatchesCount} OF {totalMatchesCount} MATCHES LOGGED
          </span>
        </div>

        {/* Total Elimination Frags */}
        <div className="space-y-1 rounded-xl bg-[#090A10]/60 border border-[#242945] p-3">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
            TOTAL ELIMINATIONS
          </span>
          <div className="font-orbitron font-black text-[#FF2A85] text-sm font-mono flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-[#FF2A85]" />
            <span>{totalKills} FRAGS</span>
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            MVP: {topFraggerTeam?.team.short_name || "—"} ({topFraggerTeam?.totalKills || 0})
          </span>
        </div>

        {/* Current Active Map & Stage */}
        <div className="space-y-1 rounded-xl bg-[#090A10]/60 border border-[#242945] p-3">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
            ACTIVE ARENA
          </span>
          <div className="font-orbitron font-black text-white text-sm truncate">
            {latestMatch ? `${latestMatch.map_name || "Arena"}` : "GRAND FINALS"}
          </div>
          <span className="text-[10px] text-[#00F0FF] font-bold block truncate">
            {latestMatch?.round_name || "SCHEDULED STAGE"}
          </span>
        </div>
      </div>
    </div>
  );
}
