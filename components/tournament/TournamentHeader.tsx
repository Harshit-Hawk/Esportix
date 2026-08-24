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
  Sparkles,
  ShieldCheck,
  User,
  Users,
  Layers,
  Crosshair,
  Flame,
  Crown,
  TrendingUp,
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

  // Aggregate stats
  const totalKillsAcrossEvent = standings.reduce((acc, curr) => acc + curr.totalKills, 0);
  const mostWinsLeader = [...standings].sort((a, b) => b.wins - a.wins)[0];

  const getFormatBadge = () => {
    switch (tournament.format) {
      case "SOLO":
        return { label: "SOLO FORMAT", icon: User, color: "text-amber-700 border-yellow-300 bg-yellow-50" };
      case "DUO":
        return { label: "DUO PAIRS", icon: Users, color: "text-blue-700 border-blue-200 bg-blue-50" };
      case "TRIO":
        return { label: "TRIO CLASH", icon: Users, color: "text-purple-700 border-purple-200 bg-purple-50" };
      case "5v5":
        return { label: "5v5 TACTICAL", icon: Crosshair, color: "text-emerald-700 border-emerald-200 bg-emerald-50" };
      default:
        return { label: "SQUAD BATTLE ROYALE", icon: Layers, color: "text-blue-700 border-blue-200 bg-blue-50" };
    }
  };

  const fmtBadge = getFormatBadge();
  const FormatIcon = fmtBadge.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      {/* Background Glows & Accent Gradients */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-80 w-80 rounded-full bg-yellow-400/15 blur-3xl" />

      {/* Top Banner Accent Line with Electric Blue & Yellow */}
      <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-yellow-400 to-cyan-500" />

      <div className="p-5 sm:p-8 space-y-6">
        {/* Main Branding Row */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start sm:items-center gap-5">
            {/* Logo / Badge with dynamic metallic frame */}
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-slate-100 p-1.5 shadow-lg shadow-blue-500/15 sm:h-24 sm:w-24">
              {tournament.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tournament.logo_url}
                  alt={tournament.name}
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                <Trophy className="h-10 w-10 text-blue-600" />
              )}
            </div>

            {/* Title & Badges */}
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {/* Live Pill */}
                {isLive ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-0.5 text-[11px] font-black uppercase tracking-widest text-red-600 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                    </span>
                    LIVE BROADCAST
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                    {tournament.status}
                  </span>
                )}

                {/* Format Badge */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] font-black uppercase tracking-wider shadow-sm",
                    fmtBadge.color
                  )}
                >
                  <FormatIcon className="h-3.5 w-3.5" />
                  {fmtBadge.label}
                </span>

                {/* Game Pill */}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-800 shadow-sm">
                  <Gamepad2 className="h-3.5 w-3.5 text-blue-600" />
                  {tournament.game?.name || "BGMI Battle Royale"}
                </span>

                {/* Match Progress Pill */}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 border border-yellow-300 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 shadow-sm">
                  {totalMatchesCount > 0
                    ? `MATCH ${completedMatchesCount} OF ${totalMatchesCount}`
                    : "DYNAMIC MATCH SCHEDULE"}
                </span>
              </div>

              <h1 className="font-display text-2xl font-black uppercase tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {tournament.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1.5 line-clamp-2 leading-relaxed">
                {tournament.description || "Official tournament overall standings, match breakdown, and points scorecard."}
              </p>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-end lg:self-center">
            {/* Projector Mode Link */}
            <Link
              href={`/tournament/${tournament.slug}/projector`}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm active:scale-95"
              title="Fullscreen stage display / OBS stream scoreboard"
            >
              <Maximize2 className="h-4 w-4 text-blue-600" />
              <span>Projector Mode</span>
            </Link>

            {/* Export Button */}
            {onOpenExport && (
              <button
                onClick={onOpenExport}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all"
              >
                <Share2 className="h-4 w-4 text-yellow-300" />
                <span>Export / Share</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Event Stats Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-100 pt-5">
          {/* #1 Leader Card */}
          <div className="rounded-xl border border-yellow-300 bg-gradient-to-r from-yellow-50 via-amber-50 to-white p-3.5 flex items-center gap-3 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-400 border border-yellow-500 text-slate-950 shadow-sm">
              <Crown className="h-5 w-5 animate-bounce" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                CURRENT LEADER (#1)
              </span>
              <span className="font-display text-sm font-black text-slate-900 truncate">
                {leaderTeam ? leaderTeam.team.name : "Awaiting Scores"}
              </span>
              <span className="text-[11px] font-mono text-blue-600 font-black">
                {leaderTeam ? `${leaderTeam.totalPoints} PTS (${leaderTeam.wins} WWCD)` : "-"}
              </span>
            </div>
          </div>

          {/* Total Event Kills */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex items-center gap-3 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
              <Flame className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                TOTAL ELIMINATIONS
              </span>
              <span className="font-display text-lg font-black text-slate-900">
                {totalKillsAcrossEvent} KILLS
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Across all matches</span>
            </div>
          </div>

          {/* Most Wins / WWCD Leader */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex items-center gap-3 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                MOST WWCD / WINS
              </span>
              <span className="font-display text-sm font-black text-slate-900 truncate">
                {mostWinsLeader && mostWinsLeader.wins > 0 ? mostWinsLeader.team.short_name : "Tied"}
              </span>
              <span className="text-[11px] font-mono text-emerald-600 font-bold">
                {mostWinsLeader ? `${mostWinsLeader.wins} Chicken Dinners` : "0 Wins"}
              </span>
            </div>
          </div>

          {/* Stage / Map Indicator */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex items-center gap-3 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                ACTIVE MAP & STAGE
              </span>
              <span className="font-display text-sm font-black text-slate-900 truncate">
                {latestMatch ? latestMatch.map_name || "Erangel" : "Not Started"}
              </span>
              <span className="text-[10px] text-slate-500 font-medium truncate">
                {latestMatch ? latestMatch.round_name : "Stage 1"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
