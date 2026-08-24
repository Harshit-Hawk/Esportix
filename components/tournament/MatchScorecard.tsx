"use client";

import { useState } from "react";
import { Match, MatchResult, Team } from "@/types/database";
import { MapPin, Trophy, Shield, Crosshair, Flame, CheckCircle2, Lock, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchScorecardProps {
  matches: Match[];
  teams: Team[];
  selectedMatchId?: string;
  onSelectMatch?: (matchId: string) => void;
}

export function MatchScorecard({
  matches,
  teams,
  selectedMatchId,
  onSelectMatch,
}: MatchScorecardProps) {
  const sortedMatches = [...matches].sort((a, b) => a.match_number - b.match_number);

  if (sortedMatches.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3 shadow-sm">
        <CalendarPlus className="mx-auto h-12 w-12 text-blue-500 mb-2" />
        <h3 className="font-display text-lg font-black uppercase text-slate-900">
          No Matches Recorded Yet
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Matches are created and broadcast dynamically as the tournament unfolds. Match breakdown scorecards will appear here once Match 1 begins.
        </p>
      </div>
    );
  }

  const activeMatch =
    sortedMatches.find((m) => m.id === selectedMatchId) ||
    sortedMatches.find((m) => m.status === "LIVE") ||
    sortedMatches.filter((m) => m.status === "COMPLETED").pop() ||
    sortedMatches[0];

  const teamMap = new Map<string, Team>();
  teams.forEach((t) => teamMap.set(t.id, t));

  const results = activeMatch?.match_results
    ? [...activeMatch.match_results].sort((a, b) => a.placement - b.placement)
    : [];

  return (
    <div className="flex flex-col gap-5">
      {/* Match Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {sortedMatches.map((m) => {
          const isSelected = activeMatch?.id === m.id;
          const isCompleted = m.status === "COMPLETED";
          const isLive = m.status === "LIVE";

          return (
            <button
              key={m.id}
              onClick={() => onSelectMatch?.(m.id)}
              className={cn(
                "flex shrink-0 flex-col items-start rounded-xl border px-4 py-2.5 text-left transition-all",
                isSelected
                  ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : isLive
                  ? "border-red-300 bg-red-50 text-red-600 hover:border-red-400"
                  : isCompleted
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : "border-slate-200 bg-slate-50 text-slate-400"
              )}
            >
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="font-display text-xs font-black uppercase">
                  M{m.match_number}
                </span>
                {isLive ? (
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                ) : isCompleted ? (
                  <CheckCircle2 className={cn("h-3.5 w-3.5", isSelected ? "text-yellow-300" : "text-emerald-500")} />
                ) : null}
              </div>
              <span className={cn("text-[10px] font-medium", isSelected ? "text-blue-100" : "text-slate-500")}>
                {m.map_name || "Erangel"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Match Card */}
      {activeMatch && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {/* Match Banner Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm font-display text-base font-black">
                #{activeMatch.match_number}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-black uppercase text-slate-900">
                    {activeMatch.name}
                  </h3>
                  <span className="rounded-full bg-yellow-100 border border-yellow-300 px-2.5 py-0.5 text-[10px] font-black text-amber-900">
                    {activeMatch.round_name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                    Map: <strong className="text-slate-800">{activeMatch.map_name || "Erangel"}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Status:{" "}
                    <strong
                      className={
                        activeMatch.status === "LIVE"
                          ? "text-red-600"
                          : activeMatch.status === "COMPLETED"
                          ? "text-emerald-600"
                          : "text-slate-500"
                      }
                    >
                      {activeMatch.status}
                    </strong>
                  </span>
                  {activeMatch.is_locked && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Lock className="h-3 w-3 text-amber-600" /> Locked
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Winner Badge if completed */}
            {results.length > 0 && results[0].placement === 1 && (
              <div className="flex items-center gap-2.5 rounded-xl border border-yellow-300 bg-gradient-to-r from-yellow-100 to-amber-50 px-4 py-2 shadow-sm">
                <Flame className="h-5 w-5 text-amber-600 animate-bounce" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                    WWCD / MATCH WINNER
                  </span>
                  <span className="font-display text-sm font-black text-slate-900">
                    {teamMap.get(results[0].team_id)?.name || "Winner"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  <th className="py-3 pl-5 pr-2 text-center w-16">Placement</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-3 text-center">Kills</th>
                  <th className="py-3 px-3 text-center">Placement Pts</th>
                  <th className="py-3 px-3 text-center">Finish Pts</th>
                  <th className="py-3 px-3 text-center">Score Equation</th>
                  <th className="py-3 pl-3 pr-6 text-right font-black text-slate-900">Match Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No results recorded for this match yet.
                    </td>
                  </tr>
                ) : (
                  results.map((res) => {
                    const team = teamMap.get(res.team_id);
                    const isWin = res.placement === 1;

                    return (
                      <tr
                        key={res.id}
                        className={cn(
                          "table-row-hover",
                          isWin
                            ? "bg-yellow-50/70"
                            : res.placement <= 4
                            ? "bg-blue-50/20"
                            : "bg-white"
                        )}
                      >
                        <td className="py-3 pl-5 pr-2 text-center">
                          <span
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded-lg font-display text-xs font-black",
                              isWin
                                ? "bg-yellow-400 text-slate-950 shadow-sm border border-yellow-500"
                                : res.placement <= 3
                                ? "bg-slate-200 text-slate-800"
                                : "text-slate-500"
                            )}
                          >
                            #{res.placement}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                              {team?.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={team.logo_url}
                                  alt={team.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-blue-600">
                                  {team?.short_name.slice(0, 3)}
                                </span>
                              )}
                            </div>
                            <span className="font-display font-black text-slate-900">
                              {team?.name || "Team"}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              ({team?.short_name})
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-slate-700">
                          {res.kills}
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-slate-700">
                          {res.placement_points}
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-slate-700">
                          {res.finish_points}
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-500">
                          {res.placement_points} (place) + {res.finish_points} ({res.kills} kills)
                        </td>

                        <td className="py-3 pl-3 pr-6 text-right">
                          <span
                            className={cn(
                              "inline-block rounded-xl px-3 py-1 font-display text-xs font-black",
                              isWin
                                ? "bg-yellow-400 text-slate-950 border border-yellow-500 shadow-sm"
                                : "bg-blue-600 text-white shadow-sm"
                            )}
                          >
                            {res.total_points} PTS
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
