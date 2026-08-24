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
  User,
  Users,
  Crosshair,
  TrendingUp,
  X,
  Shield,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StandingsTableProps {
  standings: LeaderboardRow[];
  tournament: Tournament;
  completedMatchesCount: number;
  qualifyingCutoff?: number;
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
  const [selectedTeamModal, setSelectedTeamModal] = useState<LeaderboardRow | null>(null);

  const isSolo = tournament.format === "SOLO";
  const isDuo = tournament.format === "DUO";

  // Top Fraggers (Top 3 Killers)
  const topFraggers = [...standings]
    .sort((a, b) => b.totalKills - a.totalKills)
    .slice(0, 3);

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
    <div className="flex flex-col gap-6">
      {/* Top 3 Elimination MVP / Top Fraggers Showcase */}
      {topFraggers.length > 0 && topFraggers[0].totalKills > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {topFraggers.map((frag, idx) => {
            const isFirst = idx === 0;
            return (
              <div
                key={frag.team.id}
                className={cn(
                  "relative overflow-hidden rounded-xl border p-4 shadow-lg transition-all",
                  isFirst
                    ? "border-amber-500/50 bg-gradient-to-r from-amber-500/15 via-esports-navy-card to-esports-navy-deep shadow-amber-500/10"
                    : "border-esports-navy-border bg-esports-navy-card/90"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border font-display text-sm font-black",
                        isFirst
                          ? "bg-amber-400 text-zinc-950 border-amber-300 shadow-md shadow-amber-400/40"
                          : "bg-esports-navy-light text-white border-esports-navy-border"
                      )}
                    >
                      {isFirst ? <Crown className="h-5 w-5" /> : `0${idx + 1}`}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-esports-silver">
                        {isFirst ? "🔥 ELIMINATION MVP" : `#${idx + 1} TOP FRAGGER`}
                      </span>
                      <span className="font-display text-sm font-black text-white truncate">
                        {frag.team.name}
                      </span>
                      <span className="text-[10px] text-esports-silver font-mono">
                        [{frag.team.short_name}]
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-display text-xl font-black text-esports-orange">
                      {frag.totalKills}
                    </span>
                    <span className="text-[10px] text-esports-silver block uppercase font-semibold">
                      Kills
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Controls Bar: Search & Group Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Group Tabs */}
        {groups.length > 2 ? (
          <div className="flex items-center gap-1 rounded-xl border border-esports-navy-border bg-esports-navy p-1">
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all",
                  selectedGroup === grp
                    ? "bg-gradient-to-r from-esports-orange to-orange-600 text-white shadow-md shadow-esports-orange/20"
                    : "text-esports-silver hover:text-white"
                )}
              >
                {grp === "All" ? "Overall Standings" : grp}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-esports-silver uppercase tracking-wider">
            <Trophy className="h-4 w-4 text-esports-gold" />
            <span>Leaderboard Matrix • {standings.length} {isSolo ? "Combatants" : "Teams"}</span>
          </div>
        )}

        {/* Search Box */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-esports-silver" />
          <input
            type="text"
            placeholder={isSolo ? "Search player or IGN..." : "Search team, tag, or seed..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-esports-navy-border bg-esports-navy-card py-2.5 pl-9 pr-4 text-xs text-white placeholder-esports-silver/60 focus:border-esports-orange focus:outline-none focus:ring-1 focus:ring-esports-orange transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Main Scorecard Table Container */}
      <div
        id={tableId}
        className="overflow-hidden rounded-2xl border border-esports-navy-border bg-esports-navy-card shadow-2xl"
      >
        {/* Broadcast Table Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-esports-navy-border bg-gradient-to-r from-esports-navy via-esports-navy-light to-esports-navy px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-esports-gold/20 text-esports-gold border border-esports-gold/40">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <span className="font-display text-base font-black uppercase tracking-wider text-white">
                {isSolo ? "Official Solo Rankings" : isDuo ? "Official Duo Standings" : "Official Leaderboard Standings"}
              </span>
              <span className="text-xs text-esports-silver block">
                Points calculated after Match {completedMatchesCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-semibold text-esports-silver">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-esports-gold shadow-sm shadow-esports-gold" /> 1st: Gold
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" /> Qualify Line ({qualifyingCutoff})
            </span>
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-esports-navy-border bg-esports-navy-dark/95 text-[11px] font-black uppercase tracking-wider text-esports-silver">
                <th className="py-3.5 pl-5 pr-2 text-center w-16"># Rank</th>
                <th className="py-3.5 px-4">{isSolo ? "Player / IGN" : isDuo ? "Duo Pair" : "Squad / Team"}</th>
                <th className="py-3.5 px-3 text-center hidden sm:table-cell">Group</th>
                <th className="py-3.5 px-3 text-center">Matches</th>
                <th className="py-3.5 px-3 text-center text-esports-gold">
                  <span className="flex items-center justify-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-esports-gold inline" />
                    <span>WWCD</span>
                  </span>
                </th>
                <th className="py-3.5 px-3 text-center hidden md:table-cell">Place Pts</th>
                <th className="py-3.5 px-3 text-center hidden md:table-cell">Finish Pts</th>
                <th className="py-3.5 px-3 text-center hidden lg:table-cell">Elims</th>
                <th className="py-3.5 px-3 text-center hidden xl:table-cell">Recent Form</th>
                <th className="py-3.5 pl-3 pr-6 text-right font-black text-white text-xs w-32">
                  TOTAL PTS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-esports-navy-border/40 text-xs font-semibold">
              {filteredStandings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-esports-silver">
                    <Trophy className="mx-auto h-10 w-10 text-esports-silver/30 mb-2" />
                    <span>No participants found matching &ldquo;{searchTerm}&rdquo;.</span>
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
                      onClick={() => setSelectedTeamModal(row)}
                      className={cn(
                        "table-row-hover cursor-pointer transition-colors",
                        isChampion
                          ? "bg-gradient-to-r from-amber-500/20 via-esports-navy-light/70 to-transparent hover:from-amber-500/30"
                          : isSecond
                          ? "bg-gradient-to-r from-slate-300/15 via-esports-navy-light/50 to-transparent"
                          : isThird
                          ? "bg-gradient-to-r from-amber-700/15 via-esports-navy-light/40 to-transparent"
                          : index % 2 === 0
                          ? "bg-esports-navy-card"
                          : "bg-esports-navy/40"
                      )}
                    >
                      {/* Rank Column */}
                      <td className="py-3.5 pl-5 pr-2 text-center">
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
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : row.rankDelta < 0 ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <Minus className="h-2.5 w-2.5 opacity-40" />
                              )}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Team / Player Logo & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-esports-navy-border bg-esports-navy-dark shadow-sm">
                            {isSolo ? (
                              <User className="h-4 w-4 text-esports-orange" />
                            ) : row.team.logo_url ? (
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
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-black text-white text-sm hover:text-esports-orange transition-colors truncate">
                                {row.team.name}
                              </span>
                              <span className="rounded bg-esports-navy-light/80 px-1.5 py-0.5 text-[10px] font-bold text-esports-silver border border-esports-navy-border/60">
                                {row.team.short_name}
                              </span>
                            </div>
                            <span className="text-[10px] text-esports-silver/70 hidden sm:block">
                              Seed #{row.team.seed} • Click for team breakdown
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Group */}
                      <td className="py-3.5 px-3 text-center hidden sm:table-cell text-xs text-esports-silver">
                        {row.team.group_name}
                      </td>

                      {/* Matches Played */}
                      <td className="py-3.5 px-3 text-center font-mono text-xs text-esports-silver">
                        {row.matchesPlayed}
                      </td>

                      {/* Wins (WWCD) */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center rounded-lg px-2.5 py-0.5 font-mono text-xs font-black",
                            row.wins > 0
                              ? "bg-esports-gold/20 text-esports-gold border border-esports-gold/40 shadow-sm shadow-esports-gold/20"
                              : "text-zinc-500"
                          )}
                        >
                          {row.wins}
                        </span>
                      </td>

                      {/* Placement Points */}
                      <td className="py-3.5 px-3 text-center hidden md:table-cell font-mono text-xs text-esports-cream">
                        {row.placementPoints}
                      </td>

                      {/* Finish Points */}
                      <td className="py-3.5 px-3 text-center hidden md:table-cell font-mono text-xs text-esports-cream">
                        {row.finishPoints}
                      </td>

                      {/* Total Kills */}
                      <td className="py-3.5 px-3 text-center hidden lg:table-cell font-mono text-xs text-esports-silver">
                        {row.totalKills}
                      </td>

                      {/* Recent Form (Last 5 Placements) */}
                      <td className="py-3.5 px-3 text-center hidden xl:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          {row.recentPlacements.slice(-4).map((place, pIdx) => (
                            <span
                              key={pIdx}
                              className={cn(
                                "inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-mono font-bold",
                                place === 1
                                  ? "bg-esports-gold text-zinc-950 font-black"
                                  : place <= 4
                                  ? "bg-esports-navy-light text-white border border-esports-navy-border"
                                  : "bg-esports-navy-dark text-esports-silver/60"
                              )}
                            >
                              {place}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total Points (Featured Highlight) */}
                      <td className="py-3.5 pl-3 pr-6 text-right">
                        <div className="inline-flex items-center justify-end">
                          <span
                            className={cn(
                              "rounded-lg px-3.5 py-1 font-display text-sm font-black tracking-wider text-right shadow-md transition-transform hover:scale-105",
                              isChampion
                                ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 font-black shadow-amber-500/30 text-glow-gold"
                                : isSecond
                                ? "bg-gradient-to-r from-slate-200 to-slate-300 text-zinc-950 font-black"
                                : isThird
                                ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black"
                                : "bg-esports-navy-light text-esports-orange border border-esports-navy-border font-black"
                            )}
                          >
                            {row.totalPoints} PTS
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
        <div className="flex flex-wrap items-center justify-between border-t border-esports-navy-border bg-esports-navy-dark/95 px-6 py-3.5 text-[11px] text-esports-silver">
          <div>
            Showing <span className="font-bold text-white">{filteredStandings.length}</span> of{" "}
            <span className="font-bold text-white">{standings.length}</span> {isSolo ? "players" : "teams"}
          </div>
          <div className="flex items-center gap-4">
            <span>Tie-Breakers: Total Points &gt; Finish Points &gt; Placement Points &gt; Wins</span>
            <span className="text-emerald-400 font-bold">● Live Verified</span>
          </div>
        </div>
      </div>

      {/* Team Details Quick View Modal */}
      {selectedTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-esports-navy-border bg-esports-navy-card p-6 shadow-2xl space-y-5">
            <button
              onClick={() => setSelectedTeamModal(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-esports-silver hover:bg-esports-navy-light hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Team Profile Header */}
            <div className="flex items-center gap-4 border-b border-esports-navy-border pb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-esports-navy-dark border border-esports-navy-border font-display text-base font-black text-esports-orange">
                {selectedTeamModal.team.short_name.slice(0, 3)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl font-black uppercase text-white">
                    {selectedTeamModal.team.name}
                  </h3>
                  <span className="rounded bg-esports-navy-light px-2 py-0.5 text-xs font-bold text-esports-gold border border-esports-navy-border">
                    Rank #{selectedTeamModal.rank}
                  </span>
                </div>
                <div className="text-xs text-esports-silver font-mono mt-0.5">
                  [{selectedTeamModal.team.short_name}] • {selectedTeamModal.team.group_name} • Seed #{selectedTeamModal.team.seed}
                </div>
              </div>
            </div>

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-esports-navy-border bg-esports-navy-dark p-3">
                <span className="text-[10px] uppercase font-bold text-esports-silver block">Total Points</span>
                <span className="font-display text-xl font-black text-esports-orange">
                  {selectedTeamModal.totalPoints}
                </span>
              </div>
              <div className="rounded-xl border border-esports-navy-border bg-esports-navy-dark p-3">
                <span className="text-[10px] uppercase font-bold text-esports-silver block">WWCD / Wins</span>
                <span className="font-display text-xl font-black text-esports-gold">
                  {selectedTeamModal.wins}
                </span>
              </div>
              <div className="rounded-xl border border-esports-navy-border bg-esports-navy-dark p-3">
                <span className="text-[10px] uppercase font-bold text-esports-silver block">Total Kills</span>
                <span className="font-display text-xl font-black text-white">
                  {selectedTeamModal.totalKills}
                </span>
              </div>
            </div>

            {/* Points Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-esports-navy-border/50 text-esports-silver">
                <span>Placement Points:</span>
                <strong className="text-white font-mono">{selectedTeamModal.placementPoints} PTS</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-esports-navy-border/50 text-esports-silver">
                <span>Finish / Elimination Points:</span>
                <strong className="text-white font-mono">{selectedTeamModal.finishPoints} PTS</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-esports-navy-border/50 text-esports-silver">
                <span>Best Single Match Placement:</span>
                <strong className="text-esports-gold font-mono">#{selectedTeamModal.bestPlacement || "-"}</strong>
              </div>
            </div>

            <button
              onClick={() => setSelectedTeamModal(null)}
              className="w-full rounded-xl bg-esports-navy-light py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-esports-navy border border-esports-navy-border"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
