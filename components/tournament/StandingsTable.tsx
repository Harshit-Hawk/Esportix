"use client";

import { useState, useMemo } from "react";
import { LeaderboardRow } from "@/lib/scoring/leaderboard";
import { Tournament, Match } from "@/types/database";
import {
  Trophy,
  Flame,
  Search,
  ChevronUp,
  ChevronDown,
  Minus,
  Crown,
  X,
  User,
  ChevronRight,
  Sparkles,
  BarChart3,
  Layers,
  CheckCircle2,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StandingsTableProps {
  standings: LeaderboardRow[];
  tournament: Tournament;
  completedMatchesCount: number;
  qualifyingCutoff?: number;
  tableId?: string;
  matches?: Match[];
}

export function StandingsTable({
  standings,
  tournament,
  completedMatchesCount,
  qualifyingCutoff = 8,
  tableId = "overall-scorecard-table",
  matches = [],
}: StandingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [filterTier, setFilterTier] = useState<"ALL" | "TOP_TIER" | "DANGER_TIER">("ALL");
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [selectedTeamModal, setSelectedTeamModal] = useState<LeaderboardRow | null>(null);

  const isSolo = tournament.format === "SOLO";
  const isDuo = tournament.format === "DUO";

  const groups = ["All", ...Array.from(new Set(standings.map((r) => r.team.group_name).filter(Boolean)))];

  // Highest scorer for kill MVP badge
  const maxKills = useMemo(() => {
    return Math.max(...standings.map((r) => r.totalKills), 0);
  }, [standings]);

  // Max points for proportional progress bar
  const maxPoints = useMemo(() => {
    return Math.max(...standings.map((r) => r.totalPoints), 1);
  }, [standings]);

  const filteredStandings = useMemo(() => {
    return standings.filter((row) => {
      const matchesSearch =
        row.team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.team.short_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = selectedGroup === "All" || row.team.group_name === selectedGroup;

      let matchesTier = true;
      if (filterTier === "TOP_TIER") {
        matchesTier = row.rank <= qualifyingCutoff;
      } else if (filterTier === "DANGER_TIER") {
        matchesTier = row.rank > qualifyingCutoff;
      }

      return matchesSearch && matchesGroup && matchesTier;
    });
  }, [standings, searchTerm, selectedGroup, filterTier, qualifyingCutoff]);

  const toggleExpand = (teamId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  return (
    <div className="space-y-4">
      {/* Dynamic Controls Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Tier & Group Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tier Tabs */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
            <button
              onClick={() => setFilterTier("ALL")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all",
                filterTier === "ALL"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              All {isSolo ? "Combatants" : "Teams"} ({standings.length})
            </button>
            {standings.length > qualifyingCutoff && (
              <>
                <button
                  onClick={() => setFilterTier("TOP_TIER")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all",
                    filterTier === "TOP_TIER"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Finals Zone (1–{qualifyingCutoff})
                </button>
                <button
                  onClick={() => setFilterTier("DANGER_TIER")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all",
                    filterTier === "DANGER_TIER"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Danger Zone ({qualifyingCutoff + 1}+)
                </button>
              </>
            )}
          </div>

          {/* Group Tabs if multi-group */}
          {groups.length > 2 && (
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
              {groups.map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all",
                    selectedGroup === grp
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {grp}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search & Info */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isSolo ? "Filter player name or in-game ID..." : "Filter team name or tag..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/10 shadow-xs transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Scorecard Table */}
      <div
        id={tableId}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-600">
                <th className="py-3.5 pl-4 pr-2 text-center w-14"># Rank</th>
                <th className="py-3.5 px-3">{isSolo ? "Combatant / Player" : "Team / Squad"}</th>
                <th className="py-3.5 px-3 text-center w-20">Matches</th>
                <th className="py-3.5 px-3 text-center w-20">WWCD</th>
                <th className="py-3.5 px-3 text-center hidden md:table-cell w-24">Place Pts</th>
                <th className="py-3.5 px-3 text-center hidden md:table-cell w-24">Kill Pts</th>
                <th className="py-3.5 px-4 hidden lg:table-cell w-44">Points Split</th>
                <th className="py-3.5 pl-3 pr-6 text-right font-black text-slate-900 w-36">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStandings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-700">No participants match your filter</p>
                      <p className="text-xs text-slate-400">Try clearing your search query or tier selection</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStandings.map((row) => {
                  const isWinner = row.rank === 1;
                  const isTop3 = row.rank <= 3;
                  const isExpanded = expandedTeamId === row.team.id;
                  const isKillLeader = maxKills > 0 && row.totalKills === maxKills;

                  // Percentage of placement vs kill points
                  const placePct = row.totalPoints > 0 ? (row.placementPoints / row.totalPoints) * 100 : 0;
                  const killPct = row.totalPoints > 0 ? (row.finishPoints / row.totalPoints) * 100 : 0;

                  return (
                    <tr
                      key={row.team.id}
                      onClick={() => setSelectedTeamModal(row)}
                      className={cn(
                        "table-row-hover cursor-pointer transition-colors group",
                        isWinner
                          ? "bg-yellow-50/50 hover:bg-yellow-50/80"
                          : isTop3
                          ? "bg-slate-50/40 hover:bg-slate-100/50"
                          : "bg-white hover:bg-slate-50"
                      )}
                    >
                      {/* Rank Column */}
                      <td className="py-3.5 pl-4 pr-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isWinner ? (
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-400 font-display text-xs font-black text-slate-950 shadow-xs border border-yellow-500">
                              <Crown className="h-4 w-4" />
                            </span>
                          ) : (
                            <span
                              className={cn(
                                "flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-bold transition-all",
                                isTop3
                                  ? "bg-slate-200 text-slate-800"
                                  : "text-slate-600 group-hover:bg-slate-100"
                              )}
                            >
                              {row.rank}
                            </span>
                          )}

                          {/* Delta */}
                          {row.rankDelta !== undefined && row.rankDelta !== 0 && (
                            <span
                              className={cn(
                                "inline-flex items-center text-[10px] font-bold font-mono",
                                row.rankDelta > 0 ? "text-emerald-600" : "text-rose-500"
                              )}
                              title={`${row.rankDelta > 0 ? `+${row.rankDelta}` : row.rankDelta} positions since last match`}
                            >
                              {row.rankDelta > 0 ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                              <span>{Math.abs(row.rankDelta)}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Team / Combatant */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shadow-2xs">
                            {isSolo ? (
                              <User className="h-4 w-4 text-slate-600" />
                            ) : row.team.logo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={row.team.logo_url}
                                alt={row.team.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="font-bold text-[10px] text-blue-600">
                                {row.team.short_name.slice(0, 3)}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                                {row.team.name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                [{row.team.short_name}]
                              </span>
                              {isKillLeader && (
                                <span className="inline-flex items-center gap-0.5 rounded-md bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-rose-600 border border-rose-200">
                                  <Flame className="h-2.5 w-2.5 text-rose-500" />
                                  MVP Fragger
                                </span>
                              )}
                            </div>

                            {row.team.group_name && (
                              <span className="text-[10px] text-slate-400">
                                {row.team.group_name} • Seed #{row.team.seed}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Matches Played */}
                      <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-700">
                        {row.matchesPlayed}
                      </td>

                      {/* WWCD / Wins */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center font-mono text-xs font-bold px-2 py-0.5 rounded-md",
                            row.wins > 0
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
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

                      {/* Kill / Finish Points */}
                      <td className="py-3.5 px-3 text-center hidden md:table-cell font-mono text-xs text-slate-700">
                        {row.finishPoints}
                      </td>

                      {/* Visual Points Distribution Bar */}
                      <td className="py-3.5 px-4 hidden lg:table-cell">
                        <div className="w-full space-y-1">
                          <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/60">
                            <div
                              style={{ width: `${placePct}%` }}
                              className="bg-blue-600 transition-all duration-300"
                              title={`Placement: ${row.placementPoints} pts (${Math.round(placePct)}%)`}
                            />
                            <div
                              style={{ width: `${killPct}%` }}
                              className="bg-yellow-400 transition-all duration-300"
                              title={`Kills: ${row.finishPoints} pts (${Math.round(killPct)}%)`}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] font-mono text-slate-400">
                            <span>{row.placementPoints} place</span>
                            <span>{row.finishPoints} kills</span>
                          </div>
                        </div>
                      </td>

                      {/* Total Points */}
                      <td className="py-3.5 pl-3 pr-6 text-right">
                        <span
                          className={cn(
                            "inline-block rounded-xl px-3.5 py-1.5 font-display text-sm font-black tabular-nums transition-all shadow-xs",
                            isWinner
                              ? "bg-yellow-400 text-slate-950 border border-yellow-500 shadow-yellow-400/20"
                              : "bg-blue-600 text-white shadow-blue-500/10"
                          )}
                        >
                          {row.totalPoints} PTS
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Scorecard Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 bg-slate-50/80 px-5 py-3 text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700">
              Showing {filteredStandings.length} of {standings.length} {isSolo ? "Combatants" : "Squads"}
            </span>
            <div className="hidden sm:flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <span>Placement Points</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                <span>Kill Points</span>
              </span>
            </div>
          </div>

          <span className="text-[11px] font-medium text-slate-500">
            Official Realtime Scoring Engine • Auto-Synced
          </span>
        </div>
      </div>

      {/* Interactive Team Quick-Inspection Modal */}
      {selectedTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <button
              onClick={() => setSelectedTeamModal(null)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-display text-base font-black shadow-md shadow-blue-500/20">
                #{selectedTeamModal.rank}
              </div>
              <div>
                <h3 className="font-display text-lg font-black uppercase text-slate-900">
                  {selectedTeamModal.team.name}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  [{selectedTeamModal.team.short_name}] • {selectedTeamModal.team.group_name || "Overall"} • Seed #{selectedTeamModal.team.seed}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">Total Points</span>
                <span className="font-display text-2xl font-black text-blue-900 font-mono mt-0.5 block">
                  {selectedTeamModal.totalPoints}
                </span>
              </div>
              <div className="rounded-xl border border-yellow-200 bg-yellow-50/60 p-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">WWCD Wins</span>
                <span className="font-display text-2xl font-black text-amber-900 font-mono mt-0.5 block">
                  {selectedTeamModal.wins}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">Total Kills</span>
                <span className="font-display text-2xl font-black text-slate-900 font-mono mt-0.5 block">
                  {selectedTeamModal.totalKills}
                </span>
              </div>
            </div>

            {/* Detail Rows */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between py-1.5 border-b border-slate-50 font-medium">
                <span className="text-slate-600">Placement Points</span>
                <span className="font-mono font-bold text-slate-900">{selectedTeamModal.placementPoints} pts</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50 font-medium">
                <span className="text-slate-600">Elimination Points</span>
                <span className="font-mono font-bold text-slate-900">{selectedTeamModal.finishPoints} pts</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50 font-medium">
                <span className="text-slate-600">Matches Contested</span>
                <span className="font-mono font-bold text-slate-900">{selectedTeamModal.matchesPlayed} matches</span>
              </div>
              <div className="flex justify-between py-1.5 font-medium">
                <span className="text-slate-600">Avg Points Per Match</span>
                <span className="font-mono font-bold text-blue-600">
                  {selectedTeamModal.matchesPlayed > 0
                    ? (selectedTeamModal.totalPoints / selectedTeamModal.matchesPlayed).toFixed(1)
                    : "0.0"} pts/m
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTeamModal(null)}
              className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
