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
                  "relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all bg-white",
                  isFirst
                    ? "border-yellow-300 bg-gradient-to-r from-yellow-50 via-amber-50 to-white shadow-yellow-400/15"
                    : "border-slate-200"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-sm font-black shadow-sm",
                        isFirst
                          ? "bg-yellow-400 text-slate-950 border border-yellow-500 shadow-yellow-400/30"
                          : "bg-blue-50 text-blue-600 border border-blue-200"
                      )}
                    >
                      {isFirst ? <Crown className="h-5 w-5" /> : `0${idx + 1}`}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        {isFirst ? "🔥 ELIMINATION MVP" : `#${idx + 1} TOP FRAGGER`}
                      </span>
                      <span className="font-display text-sm font-black text-slate-900 truncate">
                        {frag.team.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        [{frag.team.short_name}]
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-display text-2xl font-black text-blue-600">
                      {frag.totalKills}
                    </span>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
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
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-xs font-black uppercase tracking-wider transition-all",
                  selectedGroup === grp
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {grp === "All" ? "Overall Standings" : grp}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span>Leaderboard Matrix • {standings.length} {isSolo ? "Combatants" : "Teams"}</span>
          </div>
        )}

        {/* Search Box */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isSolo ? "Search player or IGN..." : "Search team, tag, or seed..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Main Scorecard Table Container */}
      <div
        id={tableId}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        {/* Broadcast Table Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 via-slate-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400 text-slate-950 border border-yellow-500 shadow-sm">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-base font-black uppercase tracking-wider text-slate-900">
                {isSolo ? "Official Solo Rankings" : isDuo ? "Official Duo Standings" : "Official Leaderboard Standings"}
              </span>
              <span className="text-xs text-slate-500 block font-medium">
                Points calculated after Match {completedMatchesCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 shadow-sm" /> 1st: Gold Champion
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" /> Qualify Line ({qualifyingCutoff})
            </span>
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-black uppercase tracking-wider text-slate-600">
                <th className="py-3.5 pl-5 pr-2 text-center w-16"># Rank</th>
                <th className="py-3.5 px-4">{isSolo ? "Player / IGN" : isDuo ? "Duo Pair" : "Squad / Team"}</th>
                <th className="py-3.5 px-3 text-center hidden sm:table-cell">Group</th>
                <th className="py-3.5 px-3 text-center">Matches</th>
                <th className="py-3.5 px-3 text-center text-amber-600">
                  <span className="flex items-center justify-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-amber-500 inline" />
                    <span>WWCD</span>
                  </span>
                </th>
                <th className="py-3.5 px-3 text-center hidden md:table-cell">Place Pts</th>
                <th className="py-3.5 px-3 text-center hidden md:table-cell">Finish Pts</th>
                <th className="py-3.5 px-3 text-center hidden lg:table-cell">Elims</th>
                <th className="py-3.5 px-3 text-center hidden xl:table-cell">Recent Form</th>
                <th className="py-3.5 pl-3 pr-6 text-right font-black text-slate-900 text-xs w-36">
                  TOTAL PTS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {filteredStandings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-500">
                    <Trophy className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                    <span>No participants found matching &ldquo;{searchTerm}&rdquo;.</span>
                  </td>
                </tr>
              ) : (
                filteredStandings.map((row, index) => {
                  const isChampion = row.rank === 1;
                  const isSecond = row.rank === 2;
                  const isThird = row.rank === 3;

                  return (
                    <tr
                      key={row.team.id}
                      onClick={() => setSelectedTeamModal(row)}
                      className={cn(
                        "table-row-hover cursor-pointer transition-colors",
                        isChampion
                          ? "bg-yellow-50/70 hover:bg-yellow-100/60"
                          : isSecond
                          ? "bg-slate-50/80 hover:bg-slate-100/80"
                          : isThird
                          ? "bg-amber-50/40 hover:bg-amber-100/50"
                          : index % 2 === 0
                          ? "bg-white"
                          : "bg-slate-50/40"
                      )}
                    >
                      {/* Rank Column */}
                      <td className="py-3.5 pl-5 pr-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isChampion ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-400 font-display text-xs font-black text-slate-950 shadow-md shadow-yellow-400/40 border border-yellow-500">
                              <Crown className="h-4 w-4" />
                            </div>
                          ) : isSecond ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 font-display text-xs font-black text-slate-800 shadow-sm border border-slate-300">
                              02
                            </div>
                          ) : isThird ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 font-display text-xs font-black text-amber-800 shadow-sm border border-amber-200">
                              03
                            </div>
                          ) : (
                            <span className="font-display text-xs font-bold text-slate-500">
                              {row.rank < 10 ? `0${row.rank}` : row.rank}
                            </span>
                          )}

                          {/* Rank Delta Icon */}
                          {row.rankDelta !== undefined && (
                            <span
                              className={cn(
                                "flex items-center text-[10px] font-bold",
                                row.rankDelta > 0
                                  ? "text-emerald-600"
                                  : row.rankDelta < 0
                                  ? "text-red-500"
                                  : "text-slate-300"
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
                          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
                            {isSolo ? (
                              <User className="h-4 w-4 text-blue-600" />
                            ) : row.team.logo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={row.team.logo_url}
                                alt={row.team.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] font-black text-blue-600">
                                {row.team.short_name.slice(0, 3)}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-black text-slate-900 text-sm hover:text-blue-600 transition-colors truncate">
                                {row.team.name}
                              </span>
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                                {row.team.short_name}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 hidden sm:block">
                              Seed #{row.team.seed} • Click for match trajectory
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Group */}
                      <td className="py-3.5 px-3 text-center hidden sm:table-cell text-xs text-slate-600">
                        {row.team.group_name}
                      </td>

                      {/* Matches Played */}
                      <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-700">
                        {row.matchesPlayed}
                      </td>

                      {/* Wins (WWCD) */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center rounded-lg px-2.5 py-0.5 font-mono text-xs font-black",
                            row.wins > 0
                              ? "bg-yellow-100 text-amber-900 border border-yellow-300 shadow-sm"
                              : "text-slate-400"
                          )}
                        >
                          {row.wins}
                        </span>
                      </td>

                      {/* Placement Points */}
                      <td className="py-3.5 px-3 text-center hidden md:table-cell font-mono text-xs text-slate-700">
                        {row.placementPoints}
                      </td>

                      {/* Finish Points */}
                      <td className="py-3.5 px-3 text-center hidden md:table-cell font-mono text-xs text-slate-700">
                        {row.finishPoints}
                      </td>

                      {/* Total Kills */}
                      <td className="py-3.5 px-3 text-center hidden lg:table-cell font-mono text-xs text-slate-600">
                        {row.totalKills}
                      </td>

                      {/* Recent Form (Last 4 Placements) */}
                      <td className="py-3.5 px-3 text-center hidden xl:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          {row.recentPlacements.slice(-4).map((place, pIdx) => (
                            <span
                              key={pIdx}
                              className={cn(
                                "inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-mono font-bold",
                                place === 1
                                  ? "bg-yellow-400 text-slate-950 font-black"
                                  : place <= 4
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : "bg-slate-100 text-slate-500"
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
                              "rounded-xl px-4 py-1.5 font-display text-sm font-black tracking-wider text-right shadow-sm transition-transform hover:scale-105",
                              isChampion
                                ? "bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 font-black shadow-yellow-400/30 border border-yellow-500"
                                : isSecond
                                ? "bg-slate-200 text-slate-900 font-black border border-slate-300"
                                : isThird
                                ? "bg-amber-100 text-amber-900 font-black border border-amber-200"
                                : "bg-blue-600 text-white font-black shadow-md shadow-blue-500/20"
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
        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3.5 text-[11px] text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-900">{filteredStandings.length}</span> of{" "}
            <span className="font-bold text-slate-900">{standings.length}</span> {isSolo ? "players" : "teams"}
          </div>
          <div className="flex items-center gap-4">
            <span>Tie-Breakers: Total Points &gt; Finish Points &gt; Placement Points &gt; Wins</span>
            <span className="text-emerald-600 font-bold">● Live Calculated</span>
          </div>
        </div>
      </div>

      {/* Team Details Quick View Modal */}
      {selectedTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <button
              onClick={() => setSelectedTeamModal(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Team Profile Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 font-display text-base font-black text-blue-600">
                {selectedTeamModal.team.short_name.slice(0, 3)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl font-black uppercase text-slate-900">
                    {selectedTeamModal.team.name}
                  </h3>
                  <span className="rounded-full bg-yellow-400 px-2.5 py-0.5 text-xs font-black text-slate-950 border border-yellow-500">
                    Rank #{selectedTeamModal.rank}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  [{selectedTeamModal.team.short_name}] • {selectedTeamModal.team.group_name} • Seed #{selectedTeamModal.team.seed}
                </div>
              </div>
            </div>

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Points</span>
                <span className="font-display text-xl font-black text-blue-600">
                  {selectedTeamModal.totalPoints}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">WWCD / Wins</span>
                <span className="font-display text-xl font-black text-amber-700">
                  {selectedTeamModal.wins}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Kills</span>
                <span className="font-display text-xl font-black text-slate-900">
                  {selectedTeamModal.totalKills}
                </span>
              </div>
            </div>

            {/* Points Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600">
                <span>Placement Points:</span>
                <strong className="text-slate-900 font-mono">{selectedTeamModal.placementPoints} PTS</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600">
                <span>Finish / Elimination Points:</span>
                <strong className="text-slate-900 font-mono">{selectedTeamModal.finishPoints} PTS</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600">
                <span>Best Single Match Placement:</span>
                <strong className="text-blue-600 font-mono">#{selectedTeamModal.bestPlacement || "-"}</strong>
              </div>
            </div>

            <button
              onClick={() => setSelectedTeamModal(null)}
              className="w-full rounded-xl bg-slate-900 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-slate-800 shadow-md"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
