"use client";

import { useState, useMemo } from "react";
import { Match, MatchResult, Team } from "@/types/database";
import {
  MapPin,
  Trophy,
  Shield,
  Crosshair,
  Flame,
  CheckCircle2,
  Lock,
  CalendarPlus,
  ArrowUpDown,
  User,
  Users,
  Sparkles,
  Layers,
} from "lucide-react";
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
  const [sortBy, setSortBy] = useState<"PLACEMENT" | "POINTS">("PLACEMENT");

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => a.match_number - b.match_number);
  }, [matches]);

  if (sortedMatches.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3 shadow-xs">
        <CalendarPlus className="mx-auto h-12 w-12 text-blue-500 mb-2" />
        <h3 className="font-display text-lg font-black uppercase text-slate-900">
          No Matches Scheduled Yet
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

  const results = useMemo(() => {
    if (!activeMatch?.match_results) return [];
    const list = [...activeMatch.match_results];
    if (sortBy === "POINTS") {
      return list.sort((a, b) => b.total_points - a.total_points || a.placement - b.placement);
    }
    return list.sort((a, b) => {
      if (a.placement > 0 && b.placement > 0) return a.placement - b.placement;
      if (a.placement > 0) return -1;
      if (b.placement > 0) return 1;
      return 0;
    });
  }, [activeMatch, sortBy]);

  // Match MVP (highest kills in this match)
  const matchMvpResult = useMemo(() => {
    if (!results.length) return null;
    return results.reduce(
      (max, curr) => (curr.kills > max.kills ? curr : max),
      results[0]
    );
  }, [results]);

  const winnerResult = results.find((r) => r.placement === 1);
  const winnerTeam = winnerResult ? teamMap.get(winnerResult.team_id) : null;
  const matchTotalFrags = results.reduce((acc, curr) => acc + curr.kills, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Match Selector Strip */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
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
                  Match {m.match_number}
                </span>
                {isLive ? (
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                ) : isCompleted ? (
                  <CheckCircle2 className={cn("h-3.5 w-3.5", isSelected ? "text-yellow-300" : "text-emerald-500")} />
                ) : null}
              </div>
              <span className={cn("text-[10px] font-bold font-mono uppercase mt-0.5", isSelected ? "text-blue-100" : "text-slate-500")}>
                {m.map_name || "Erangel"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Match Card */}
      {activeMatch && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          {/* Match Banner Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-slate-50 to-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20 font-display text-base font-black">
                #{activeMatch.match_number}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-black uppercase text-slate-900">
                    {activeMatch.name}
                  </h3>
                  <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-black text-blue-700">
                    {activeMatch.round_name}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                    Arena: <strong className="text-slate-800">{activeMatch.map_name || "Erangel"}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Status:{" "}
                    <strong
                      className={
                        activeMatch.status === "LIVE"
                          ? "text-red-600 font-black"
                          : activeMatch.status === "COMPLETED"
                          ? "text-emerald-600 font-bold"
                          : "text-slate-500"
                      }
                    >
                      {activeMatch.status}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>Total Match Frags: <strong className="text-slate-900 font-mono">{matchTotalFrags}</strong></span>
                </div>
              </div>
            </div>

            {/* Winner & MVP Callouts */}
            <div className="flex flex-wrap items-center gap-2">
              {winnerTeam && (
                <div className="flex items-center gap-2 rounded-xl border border-yellow-300 bg-yellow-50 px-3.5 py-2 shadow-2xs">
                  <Flame className="h-4 w-4 text-yellow-600" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-800">
                      WWCD Winner
                    </span>
                    <span className="font-display text-xs font-black text-slate-900">
                      {winnerTeam.name}
                    </span>
                  </div>
                </div>
              )}

              {matchMvpResult && matchMvpResult.kills > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 shadow-2xs">
                  <Crosshair className="h-4 w-4 text-rose-600" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-wider text-rose-700">
                      Match MVP Fragger
                    </span>
                    <span className="font-display text-xs font-black text-slate-900">
                      {teamMap.get(matchMvpResult.team_id)?.short_name} ({matchMvpResult.kills} kills)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table Controls */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-2.5 text-xs">
            <span className="font-bold text-slate-700">
              Match Breakdown Matrix ({results.length} Competitors)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy(sortBy === "PLACEMENT" ? "POINTS" : "PLACEMENT")}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold uppercase text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <ArrowUpDown className="h-3 w-3 text-blue-600" />
                <span>Sorted by: {sortBy === "PLACEMENT" ? "Placement" : "Points"}</span>
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  <th className="py-3 pl-5 pr-2 text-center w-16">Placement</th>
                  <th className="py-3 px-4">Squad / Combatant</th>
                  <th className="py-3 px-3 text-center">Elims</th>
                  <th className="py-3 px-3 text-center">Placement Pts</th>
                  <th className="py-3 px-3 text-center">Kill Pts</th>
                  <th className="py-3 px-3 text-center hidden md:table-cell">Score Equation</th>
                  <th className="py-3 pl-3 pr-6 text-right font-black text-slate-900">Match Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No scores entered for this match yet.
                    </td>
                  </tr>
                ) : (
                  results.map((res) => {
                    const team = teamMap.get(res.team_id);
                    const isWin = res.placement === 1;
                    const isMatchTopFragger = res.id === matchMvpResult?.id && res.kills > 0;

                    return (
                      <tr
                        key={res.id}
                        className={cn(
                          "table-row-hover transition-colors",
                          isWin
                            ? "bg-yellow-50/60"
                            : res.placement <= 4
                            ? "bg-slate-50/50"
                            : "bg-white"
                        )}
                      >
                        <td className="py-3 pl-5 pr-2 text-center">
                          <span
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded-lg font-display text-xs font-black",
                              isWin
                                ? "bg-yellow-400 text-slate-950 shadow-2xs border border-yellow-500"
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
                              [{team?.short_name}]
                            </span>
                            {isMatchTopFragger && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-black text-rose-600 border border-rose-200 uppercase">
                                <Crosshair className="h-2.5 w-2.5" />
                                Top Fragger
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-slate-800 font-bold">
                          {res.kills}
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-slate-700">
                          {res.placement_points}
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-slate-700">
                          {res.finish_points}
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-500 hidden md:table-cell">
                          {res.placement_points} pts + {res.finish_points} kills
                        </td>

                        <td className="py-3 pl-3 pr-6 text-right">
                          <span
                            className={cn(
                              "inline-block rounded-xl px-3 py-1 font-display text-xs font-black shadow-2xs",
                              isWin
                                ? "bg-yellow-400 text-slate-950 border border-yellow-500"
                                : "bg-blue-600 text-white"
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
