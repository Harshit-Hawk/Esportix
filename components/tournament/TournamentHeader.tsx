"use client";

import { Tournament, Match } from "@/types/database";
import { LeaderboardRow } from "@/lib/scoring/leaderboard";
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

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      {/* Header Info */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            {tournament.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tournament.logo_url}
                alt={tournament.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Trophy className="h-8 w-8 text-blue-600" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                  Live
                </span>
              ) : (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 border border-slate-200">
                  {tournament.status}
                </span>
              )}

              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                {tournament.format || "SQUAD"}
              </span>

              <span className="text-xs text-slate-500 font-medium">
                {tournament.game?.name || "Esports"}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">
              {tournament.name}
            </h1>

            {tournament.description && (
              <p className="text-xs text-slate-500 max-w-2xl line-clamp-1">
                {tournament.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Link
            href={`/tournament/${tournament.slug}/projector`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Maximize2 className="h-4 w-4 text-slate-500" />
            <span>Projector View</span>
          </Link>

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Share2 className="h-4 w-4" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-100 pt-4 text-xs">
        <div className="space-y-0.5">
          <span className="text-slate-500 font-medium">Tournament Leader</span>
          <div className="font-semibold text-slate-900 truncate flex items-center gap-1.5">
            {leaderTeam ? (
              <>
                <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{leaderTeam.team.name}</span>
                <span className="font-mono text-blue-600 text-[11px]">({leaderTeam.totalPoints} pts)</span>
              </>
            ) : (
              "—"
            )}
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-slate-500 font-medium">Matches Played</span>
          <div className="font-semibold text-slate-900 font-mono">
            {totalMatchesCount > 0 ? `${completedMatchesCount} of ${totalMatchesCount}` : "Dynamic"}
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-slate-500 font-medium">Total Eliminations</span>
          <div className="font-semibold text-slate-900 font-mono">
            {totalKills} kills
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-slate-500 font-medium">Current Map & Stage</span>
          <div className="font-semibold text-slate-900 truncate">
            {latestMatch ? `${latestMatch.map_name || "Map"} (${latestMatch.round_name})` : "Not Started"}
          </div>
        </div>
      </div>
    </div>
  );
}
