"use client";

import { Tournament, Match } from "@/types/database";
import { Radio, Calendar, Trophy, Gamepad2, Maximize2, Share2, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface TournamentHeaderProps {
  tournament: Tournament;
  completedMatchesCount: number;
  totalMatchesCount: number;
  latestMatch?: Match;
  onOpenExport?: () => void;
}

export function TournamentHeader({
  tournament,
  completedMatchesCount,
  totalMatchesCount,
  latestMatch,
  onOpenExport,
}: TournamentHeaderProps) {
  const isLive = tournament.status === "LIVE";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-esports-navy-border bg-gradient-to-b from-esports-navy to-esports-navy-dark shadow-2xl">
      {/* Background Glow & Watermark */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-esports-orange/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-esports-gold/5 blur-3xl" />

      {/* Top Banner Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-esports-orange via-esports-gold to-esports-orange" />

      <div className="p-5 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Tournament Branding */}
          <div className="flex items-start sm:items-center gap-5">
            {/* Logo / Badge */}
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-esports-orange/40 bg-esports-navy-card p-1 shadow-lg shadow-esports-orange/10 sm:h-24 sm:w-24">
              {tournament.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tournament.logo_url}
                  alt={tournament.name}
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <Trophy className="h-10 w-10 text-esports-orange" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>

            {/* Title & Metadata */}
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {/* Live Pill */}
                {isLive ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-widest text-red-400 animate-pulse">
                    <Radio className="h-3 w-3" />
                    LIVE NOW
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                    {tournament.status}
                  </span>
                )}

                {/* Game Pill */}
                <span className="inline-flex items-center gap-1 rounded-full bg-esports-navy-light border border-esports-navy-border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-esports-cream">
                  <Gamepad2 className="h-3 w-3 text-esports-orange" />
                  {tournament.game?.name || "BGMI Battle Royale"}
                </span>

                {/* Match Progress Pill */}
                <span className="inline-flex items-center gap-1 rounded-full bg-esports-navy-light/70 border border-esports-navy-border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-esports-gold">
                  MATCH {completedMatchesCount} OF {totalMatchesCount}
                </span>
              </div>

              <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white sm:text-4xl">
                {tournament.name}
              </h1>

              <p className="text-xs sm:text-sm text-esports-silver max-w-2xl mt-1 line-clamp-2">
                {tournament.description || "Official tournament overall standings, match breakdown, and points scorecard."}
              </p>
            </div>
          </div>

          {/* Quick CTA Actions & Projector Mode */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-end lg:self-center">
            {/* Projector Mode Link */}
            <Link
              href={`/tournament/${tournament.slug}/projector`}
              className="flex items-center gap-2 rounded-lg border border-esports-navy-border bg-esports-navy-light px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-esports-cream hover:border-esports-orange hover:bg-esports-navy-light/80 hover:text-white transition-all shadow-sm"
              title="Fullscreen stage display / OBS stream scoreboard"
            >
              <Maximize2 className="h-4 w-4 text-esports-orange" />
              <span>Projector Mode</span>
            </Link>

            {/* Export Button */}
            {onOpenExport && (
              <button
                onClick={onOpenExport}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-esports-orange to-orange-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-esports-orange/20 hover:brightness-110 active:scale-95 transition-all"
              >
                <Share2 className="h-4 w-4" />
                <span>Export / Share</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Ticker Bar */}
        {latestMatch && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-esports-navy-border/60 pt-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-display font-bold uppercase tracking-wider text-esports-orange">
                CURRENT STAGE:
              </span>
              <span className="font-bold text-white">
                {latestMatch.round_name} • {latestMatch.name} ({latestMatch.map_name || "Erangel"})
              </span>
              <span className="text-esports-silver">
                Status: <span className="text-emerald-400 font-bold uppercase">{latestMatch.status}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-esports-silver text-[11px]">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Leaderboard auto-calculated with verified scoring engine</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
