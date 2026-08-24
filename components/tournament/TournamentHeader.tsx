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
    <div className="overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-sm space-y-4 p-5 sm:p-7">
      {/* Live Match Ticker Banner */}
      <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
          </span>
          <span className="font-oswald font-black uppercase tracking-wider text-blue-900 text-xs shrink-0">
            BROADCAST FEED
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-slate-700 truncate font-medium text-xs">
            {latestMatch?.status === "COMPLETED" ? (
              <>
                Latest: <strong className="text-slate-900 font-bold">{latestMatch.name} ({latestMatch.map_name})</strong> completed • {leaderTeam?.team.name} leading with {leaderTeam?.totalPoints} pts
              </>
            ) : isLive ? (
              <>
                <strong className="text-red-600 font-bold">{latestMatch?.name || "Match"} is LIVE NOW</strong> on {latestMatch?.map_name || "Erangel"}
              </>
            ) : (
              <>
                Tournament Ready • {standings.length} Teams Registered across {totalMatchesCount} Matches
              </>
            )}
          </span>
        </div>

        <Link
          href={`/tournament/${tournament.slug}/projector`}
          className="shrink-0 flex items-center gap-1 font-oswald font-bold text-xs uppercase tracking-wider text-blue-600 hover:text-blue-800 ml-2"
        >
          <span>Stage Mode</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Main Tournament Banner Content */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between pt-1">
        <div className="flex items-start sm:items-center gap-4">
          <GameLogo
            slug={tournament.game?.slug}
            name={tournament.game?.name}
            logoUrl={tournament.logo_url}
            size="lg"
            className="shadow-sm"
          />

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-0.5 text-xs font-black uppercase text-red-600 border border-red-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                  LIVE NOW
                </span>
              ) : (
                <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold uppercase text-slate-700 border border-slate-200">
                  {tournament.status}
                </span>
              )}

              <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-black uppercase text-blue-600 border border-blue-200">
                {tournament.format || "SQUAD"} FORMAT
              </span>

              <span className="text-xs font-bold text-slate-500">
                {tournament.game?.name || "Esports Title"}
              </span>
            </div>

            <h1 className="font-oswald text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-slate-900 leading-none">
              {tournament.name}
            </h1>

            {tournament.description && (
              <p className="text-xs text-slate-500 max-w-2xl line-clamp-1 leading-relaxed">
                {tournament.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Link
            href={`/tournament/${tournament.slug}/projector`}
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 font-oswald text-xs font-bold uppercase tracking-wider text-slate-850 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
          >
            <Maximize2 className="h-3.5 w-3.5 text-blue-600" />
            <span>Projector View</span>
          </Link>

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#141414] border border-[#333] px-5 py-2.5 font-oswald text-xs font-black uppercase tracking-wider text-[#F5C400] shadow-md hover:bg-slate-900 active:scale-95 transition-all"
            >
              <Share2 className="h-3.5 w-3.5 text-[#F5C400]" />
              <span>Export Poster / CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Metrics & Progress Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-100 pt-4 text-xs">
        {/* Tournament Leader */}
        <div className="space-y-1">
          <span className="text-slate-500 font-oswald font-bold uppercase text-xs tracking-wider block">
            #1 Leader
          </span>
          <div className="font-oswald font-black text-slate-900 truncate flex items-center gap-1.5 text-sm">
            {leaderTeam ? (
              <>
                <Crown className="h-4 w-4 text-yellow-500 shrink-0" />
                <span className="truncate">{leaderTeam.team.name}</span>
                <span className="font-mono text-blue-600 text-xs font-black">({leaderTeam.totalPoints} pts)</span>
              </>
            ) : (
              "—"
            )}
          </div>
        </div>

        {/* Matches Completed with Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs font-oswald font-bold uppercase tracking-wider text-slate-500">
            <span>Schedule</span>
            <span className="font-mono">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 rounded-full"
            />
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">
            {completedMatchesCount} of {totalMatchesCount} Matches Completed
          </span>
        </div>

        {/* Total Elimination Frags */}
        <div className="space-y-1">
          <span className="text-slate-500 font-oswald font-bold uppercase text-xs tracking-wider block">
            Total Eliminations
          </span>
          <div className="font-oswald font-black text-slate-900 text-sm font-mono flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-rose-500" />
            <span>{totalKills} frags</span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            Top Fragger: {topFraggerTeam?.team.short_name || "—"} ({topFraggerTeam?.totalKills || 0})
          </span>
        </div>

        {/* Current Active Map & Stage */}
        <div className="space-y-1">
          <span className="text-slate-500 font-oswald font-bold uppercase text-xs tracking-wider block">
            Active Map & Stage
          </span>
          <div className="font-oswald font-black text-slate-900 text-sm truncate">
            {latestMatch ? `${latestMatch.map_name || "Arena"}` : "Grand Finals"}
          </div>
          <span className="text-[10px] text-blue-600 font-bold block truncate">
            {latestMatch?.round_name || "Scheduled Stage"}
          </span>
        </div>
      </div>
    </div>
  );
}
