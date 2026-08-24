"use client";

import { useState } from "react";
import { LeaderboardRow } from "@/lib/scoring/leaderboard";
import { Tournament } from "@/types/database";
import {
  Trophy,
  Flame,
  Search,
  ChevronUp,
  ChevronDown,
  Minus,
  Crown,
  Medal,
  Sparkles,
  Info,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StandingsTableProps {
  standings: LeaderboardRow[];
  tournament: Tournament;
  completedMatchesCount: number;
  qualifyingCutoff?: number; // e.g. Top 8 qualify for Grand Finals
  tableId?: string;
}

export function StandingsTable({
  standings,
  tournament,
  completedMatchesCount,
  qualifyingCutoff = 8,
  tableId = "overall-scorecard-table",
}: StandingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");

  // Get unique groups
  const groups = ["All", ...Array.from(new Set(standings.map((r) => r.team.group_name).filter(Boolean)))];

  // Filter standings based on search & group
  const filteredStandings = standings.filter((row) => {
    const matchesSearch =
      row.team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.team.short_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === "All" || row.team.group_name === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar: Search & Group Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Group Tabs */}
        {groups.length > 2 && (
          <div className="flex items-center gap-1 rounded-lg border border-esports-navy-border bg-esports-navy p-1">
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all",
                  selectedGroup === grp
                    ? "bg-esports-orange text-white shadow-sm"
                    : "text-esports-silver hover:text-white"
                )}
              >
                {grp === "All" ? "Overall Standings" : grp}
              </button>
            ))}
          </div>
        )}

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-esports-silver" />
          <input
            type="text"
            placeholder="Search team or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-esports-navy-border bg-esports-navy-card py-2 pl-9 pr-4 text-xs text-white placeholder-esports-silver/60 focus:border-esports-orange focus:outline-none focus:ring-1 focus:ring-esports-orange transition-all"
          />
        </div>
      </div>

      {/* Main Scorecard Table Container */}
      <div
        id={tableId}
        className="overflow-hidden rounded-xl border border-esports-navy-border bg-esports-navy-card shadow-2xl"
      >
        {/* Broadcast Table Header Banner */}
        <div className="flex items-center justify-between border-b border-esports-navy-border bg-gradient-to-r from-esports-navy to-esports-navy-light px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-esports-gold" />
            <span className="font-display text-sm font-black uppercase tracking-wider text-white">
              Official Leaderboard Standings
            </span>
            <span className="text-xs text-esports-silver">
              • After Match {completedMatchesCount}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold text-esports-silver">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-esports-gold" /> 1st: Gold
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Qualify Line ({qualifyingCutoff})
            </span>
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-esports-navy-border bg-esports-navy-dark/90 text-[11px] font-black uppercase tracking-wider text-esports-silver">
                <th className="py-3.5 pl-4 pr-2 text-center w-14"># Rank</th>
                <th className="py-3.5 px-3">Team</th>
                <th className="py-3.5 px-3 text-center hidden sm:table-cell">Group</th>
                <th className="py-3.5 px-3 text-center">Matches</th>
                <th className="py-3.5 px-3 text-center text-esports-gold">
                  <span className="flex items-center justify-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-esports-gold inline" />
                    <span>WWCD / Wins</span>
                  </span>
                </th>
                <th className="py-3.5 px-3 text-center hidden md:table-cell">Place Pts</th>
                <th className="py-3.5 px-3 text-center hidden md:table-cell">Finish Pts</th>
                <th className="py-3.5 px-3 text-center hidden lg:table-cell">Kills</th>
                <th className="py-3.5 px-3 text-center hidden lg:table-cell">Pen/Bonus</th>
                <th className="py-3.5 pl-3 pr-6 text-right font-black text-white text-xs">
                  TOTAL PTS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-esports-navy-border/40 text-xs font-semibold">
              {filteredStandings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-esports-silver">
                    No teams found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStandings.map((row, index) => {
                  const isChampion = row.rank === 1;
                  const isSecond = row.rank === 2;
                  const isThird = row.rank === 3;
                  const isCutoff = row.rank === qualifyingCutoff;

                  return (
                    <tr
                      key={row.team.id}
                      className={cn(
                        "table-row-hover transition-colors",
                        isChampion
                          ? "bg-gradient-to-r from-amber-500/15 via-esports-navy-light/60 to-transparent hover:from-amber-500/25"
                          : isSecond
                          ? "bg-gradient-to-r from-slate-300/10 via-esports-navy-light/40 to-transparent"
                          : isThird
                          ? "bg-gradient-to-r from-amber-700/10 via-esports-navy-light/30 to-transparent"
                          : index % 2 === 0
                          ? "bg-esports-navy-card"
                          : "bg-esports-navy/40"
                      )}
                    >
                      {/* Rank Column */}
                      <td className="py-3 pl-4 pr-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isChampion ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-amber-600 font-display text-xs font-black text-zinc-950 shadow-md shadow-amber-500/40">
                              <Crown className="h-4 w-4" />
                            </div>
                          ) : isSecond ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-slate-200 to-slate-400 font-display text-xs font-black text-zinc-950 shadow-sm">
                              02
                            </div>
                          ) : isThird ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-amber-600 to-amber-800 font-display text-xs font-black text-white shadow-sm">
                              03
                            </div>
                          ) : (
                            <span className="font-display text-xs font-bold text-esports-silver">
                              {row.rank < 10 ? `0${row.rank}` : row.rank}
                            </span>
                          )}

                          {/* Rank Delta Icon */}
                          {row.rankDelta !== undefined && (
                            <span
                              className={cn(
                                "flex items-center text-[10px] font-bold",
                                row.rankDelta > 0
                                  ? "text-emerald-400"
                                  : row.rankDelta < 0
                                  ? "text-red-400"
                                  : "text-zinc-600"
                              )}
                              title={
                                row.rankDelta > 0
                                  ? `Climbed ${row.rankDelta} positions`
                                  : row.rankDelta < 0
                                  ? `Dropped ${Math.abs(row.rankDelta)} positions`
                                  : "Rank unchanged"
                              }
                            >
                              {row.rankDelta > 0 ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : row.rankDelta < 0 ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <Minus className="h-2.5 w-2.5 opacity-40" />
                              )}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Team Logo & Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-esports-navy-border bg-esports-navy-dark">
                            {row.team.logo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={row.team.logo_url}
                                alt={row.team.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] font-black text-esports-orange">
                                {row.team.short_name.slice(0, 3)}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-white text-sm hover:text-esports-orange transition-colors">
                                {row.team.name}
                              </span>
                              <span className="rounded bg-esports-navy-light/80 px-1.5 py-0.5 text-[10px] font-bold text-esports-silver border border-esports-navy-border/60">
                                {row.team.short_name}
                              </span>
                            </div>
                            <span className="text-[10px] text-esports-silver/70 hidden sm:block">
                              Seed #{row.team.seed}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Group */}
                      <td className="py-3 px-3 text-center hidden sm:table-cell text-xs text-esports-silver">
                        {row.team.group_name}
                      </td>

                      {/* Matches Played */}
                      <td className="py-3 px-3 text-center font-mono text-xs text-esports-silver">
                        {row.matchesPlayed}
                      </td>

                      {/* Wins (WWCD) */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center rounded-md px-2 py-0.5 font-mono text-xs font-black",
                            row.wins > 0
                              ? "bg-esports-gold/20 text-esports-gold border border-esports-gold/30"
                              : "text-zinc-500"
                          )}
                        >
                          {row.wins}
                        </span>
                      </td>

                      {/* Placement Points */}
                      <td className="py-3 px-3 text-center hidden md:table-cell font-mono text-xs text-esports-cream">
                        {row.placementPoints}
                      </td>

                      {/* Finish Points */}
                      <td className="py-3 px-3 text-center hidden md:table-cell font-mono text-xs text-esports-cream">
                        {row.finishPoints}
                      </td>

                      {/* Total Kills */}
                      <td className="py-3 px-3 text-center hidden lg:table-cell font-mono text-xs text-esports-silver">
                        {row.totalKills}
                      </td>

                      {/* Penalties / Bonuses */}
                      <td className="py-3 px-3 text-center hidden lg:table-cell font-mono text-xs">
                        {row.penaltyPoints > 0 ? (
                          <span className="text-red-400">-{row.penaltyPoints}</span>
                        ) : row.bonusPoints > 0 ? (
                          <span className="text-emerald-400">+{row.bonusPoints}</span>
                        ) : (
                          <span className="text-zinc-600">0</span>
                        )}
                      </td>

                      {/* Total Points (Featured Highlight) */}
                      <td className="py-3 pl-3 pr-6 text-right">
                        <div className="inline-flex items-center justify-end">
                          <span
                            className={cn(
                              "rounded-lg px-3 py-1 font-display text-sm font-black tracking-wider text-right shadow-sm",
                              isChampion
                                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-amber-500/30"
                                : isSecond
                                ? "bg-slate-200 text-zinc-950 font-black"
                                : isThird
                                ? "bg-amber-700 text-white font-black"
                                : "bg-esports-navy-light text-esports-orange border border-esports-navy-border font-black text-sm"
                            )}
                          >
                            {row.totalPoints}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats Summary */}
        <div className="flex flex-wrap items-center justify-between border-t border-esports-navy-border bg-esports-navy-dark/90 px-5 py-3 text-[11px] text-esports-silver">
          <div>
            Showing <span className="font-bold text-white">{filteredStandings.length}</span> of{" "}
            <span className="font-bold text-white">{standings.length}</span> competing teams
          </div>
          <div className="flex items-center gap-4">
            <span>Tie-Breaker: Total Pts &gt; Finish Pts &gt; Place Pts &gt; Wins</span>
            <span className="text-emerald-400 font-bold">● Auto-Ranked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
