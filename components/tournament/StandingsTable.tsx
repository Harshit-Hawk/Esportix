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
  X,
  User,
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

  const groups = ["All", ...Array.from(new Set(standings.map((r) => r.team.group_name).filter(Boolean)))];

  const filteredStandings = standings.filter((row) => {
    const matchesSearch =
      row.team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.team.short_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === "All" || row.team.group_name === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Groups */}
        {groups.length > 2 ? (
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  selectedGroup === grp
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {grp === "All" ? "All Groups" : grp}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs font-semibold text-slate-700">
            Official Standings ({standings.length} {isSolo ? "Participants" : "Teams"})
          </div>
        )}

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isSolo ? "Search player or IGN..." : "Search team or tag..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Main Scorecard Table */}
      <div
        id={tableId}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 pl-4 pr-2 text-center w-12">#</th>
                <th className="py-3 px-3">{isSolo ? "Player" : "Team"}</th>
                <th className="py-3 px-3 text-center hidden sm:table-cell">Group</th>
                <th className="py-3 px-3 text-center">Matches</th>
                <th className="py-3 px-3 text-center">Wins</th>
                <th className="py-3 px-3 text-center hidden md:table-cell">Placement Pts</th>
                <th className="py-3 px-3 text-center hidden md:table-cell">Kill Pts</th>
                <th className="py-3 px-3 text-center hidden lg:table-cell">Total Kills</th>
                <th className="py-3 pl-3 pr-5 text-right font-bold text-slate-900">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStandings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No teams found.
                  </td>
                </tr>
              ) : (
                filteredStandings.map((row) => {
                  const isFirst = row.rank === 1;

                  return (
                    <tr
                      key={row.team.id}
                      onClick={() => setSelectedTeamModal(row)}
                      className={cn(
                        "table-row-hover cursor-pointer",
                        isFirst ? "bg-amber-50/40" : "bg-white"
                      )}
                    >
                      {/* Rank */}
                      <td className="py-3 pl-4 pr-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span
                            className={cn(
                              "font-mono font-semibold",
                              isFirst ? "text-amber-700 font-bold" : "text-slate-600"
                            )}
                          >
                            {row.rank}
                          </span>
                          {row.rankDelta !== undefined && (
                            <span className="text-[10px]">
                              {row.rankDelta > 0 ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600 inline" />
                              ) : row.rankDelta < 0 ? (
                                <ChevronDown className="h-3 w-3 text-red-500 inline" />
                              ) : null}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Team / Player */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-6 w-6 shrink-0 rounded border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden">
                            {isSolo ? (
                              <User className="h-3.5 w-3.5 text-slate-600" />
                            ) : row.team.logo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={row.team.logo_url}
                                alt={row.team.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-[9px] font-bold text-slate-600">
                                {row.team.short_name.slice(0, 3)}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                              {row.team.name}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px] ml-1.5">
                              [{row.team.short_name}]
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Group */}
                      <td className="py-3 px-3 text-center hidden sm:table-cell text-slate-500">
                        {row.team.group_name || "—"}
                      </td>

                      {/* Matches */}
                      <td className="py-3 px-3 text-center font-mono text-slate-700">
                        {row.matchesPlayed}
                      </td>

                      {/* Wins */}
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                        {row.wins}
                      </td>

                      {/* Placement Points */}
                      <td className="py-3 px-3 text-center hidden md:table-cell font-mono text-slate-700">
                        {row.placementPoints}
                      </td>

                      {/* Kill / Finish Points */}
                      <td className="py-3 px-3 text-center hidden md:table-cell font-mono text-slate-700">
                        {row.finishPoints}
                      </td>

                      {/* Total Kills */}
                      <td className="py-3 px-3 text-center hidden lg:table-cell font-mono text-slate-500">
                        {row.totalKills}
                      </td>

                      {/* Total Points */}
                      <td className="py-3 pl-3 pr-5 text-right font-mono">
                        <span
                          className={cn(
                            "inline-block rounded px-2.5 py-0.5 font-bold tabular-nums text-xs",
                            isFirst
                              ? "bg-amber-100 text-amber-900 font-extrabold"
                              : "bg-slate-100 text-slate-900"
                          )}
                        >
                          {row.totalPoints} pts
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-[11px] text-slate-500">
          <span>
            Showing {filteredStandings.length} of {standings.length} teams
          </span>
          <span>Ranked by Official Scoring Engine</span>
        </div>
      </div>

      {/* Team Details Modal */}
      {selectedTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <button
              onClick={() => setSelectedTeamModal(null)}
              className="absolute right-4 top-4 rounded p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-800 text-sm">
                #{selectedTeamModal.rank}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {selectedTeamModal.team.name}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  [{selectedTeamModal.team.short_name}] • Seed #{selectedTeamModal.team.seed}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-medium">Total Points</span>
                <span className="font-bold text-slate-900 text-base font-mono">
                  {selectedTeamModal.totalPoints}
                </span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-medium">Wins (WWCD)</span>
                <span className="font-bold text-slate-900 text-base font-mono">
                  {selectedTeamModal.wins}
                </span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-medium">Total Kills</span>
                <span className="font-bold text-slate-900 text-base font-mono">
                  {selectedTeamModal.totalKills}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>Placement Points</span>
                <span className="font-mono font-semibold text-slate-900">{selectedTeamModal.placementPoints} pts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>Elimination Points</span>
                <span className="font-mono font-semibold text-slate-900">{selectedTeamModal.finishPoints} pts</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Matches Played</span>
                <span className="font-mono font-semibold text-slate-900">{selectedTeamModal.matchesPlayed} matches</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTeamModal(null)}
              className="w-full rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
