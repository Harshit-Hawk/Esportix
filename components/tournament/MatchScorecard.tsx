"use client";

import { useState } from "react";
import { Match, MatchResult, Team } from "@/types/database";
import { MapPin, Trophy, Shield, Crosshair, Flame, CheckCircle2, Lock } from "lucide-react";
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
  const activeMatch =
    sortedMatches.find((m) => m.id === selectedMatchId) ||
    sortedMatches.find((m) => m.status === "LIVE") ||
    sortedMatches.filter((m) => m.status === "COMPLETED").pop() ||
    sortedMatches[0];

  const teamMap = new Map<string, Team>();
  teams.forEach((t) => teamMap.set(t.id, t));

  // Sort match results by placement ascending (1st place first)
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
                "flex shrink-0 flex-col items-start rounded-lg border px-3.5 py-2 text-left transition-all",
                isSelected
                  ? "border-esports-orange bg-esports-orange/20 text-white shadow-md shadow-esports-orange/10"
                  : isLive
                  ? "border-red-500/40 bg-red-500/10 text-red-300 hover:border-red-500"
                  : isCompleted
                  ? "border-esports-navy-border bg-esports-navy-card text-esports-silver hover:bg-esports-navy-light hover:text-white"
                  : "border-esports-navy-border/40 bg-esports-navy-dark/60 text-zinc-600 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-1.5 w-full justify-between">
                <span className="font-display text-xs font-black uppercase">
                  M{m.match_number}
                </span>
                {isLive ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                ) : isCompleted ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                ) : null}
              </div>
              <span className="text-[10px] text-esports-silver/80 font-medium">
                {m.map_name || "Erangel"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Match Card */}
      {activeMatch && (
        <div className="overflow-hidden rounded-xl border border-esports-navy-border bg-esports-navy-card shadow-2xl">
          {/* Match Banner Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-esports-navy-border bg-gradient-to-r from-esports-navy to-esports-navy-light px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-esports-orange/20 text-esports-orange border border-esports-orange/40 font-display text-base font-black">
                #{activeMatch.match_number}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-black uppercase text-white">
                    {activeMatch.name}
                  </h3>
                  <span className="rounded-full bg-esports-navy-dark border border-esports-navy-border px-2.5 py-0.5 text-[10px] font-bold text-esports-gold">
                    {activeMatch.round_name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-esports-silver mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-esports-orange" />
                    Map: <strong className="text-white">{activeMatch.map_name || "Erangel"}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Status:{" "}
                    <strong
                      className={
                        activeMatch.status === "LIVE"
                          ? "text-red-400"
                          : activeMatch.status === "COMPLETED"
                          ? "text-emerald-400"
                          : "text-esports-silver"
                      }
                    >
                      {activeMatch.status}
                    </strong>
                  </span>
                  {activeMatch.is_locked && (
                    <span className="flex items-center gap-1 text-esports-silver">
                      <Lock className="h-3 w-3 text-esports-gold" /> Locked
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Winner Badge if completed */}
            {results.length > 0 && results[0].placement === 1 && (
              <div className="flex items-center gap-2.5 rounded-lg border border-esports-gold/40 bg-gradient-to-r from-esports-gold/20 to-transparent px-4 py-2">
                <Flame className="h-5 w-5 text-esports-gold animate-bounce" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-esports-gold">
                    WWCD / MATCH WINNER
                  </span>
                  <span className="font-display text-sm font-black text-white">
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
                <tr className="border-b border-esports-navy-border bg-esports-navy-dark text-[11px] font-black uppercase tracking-wider text-esports-silver">
                  <th className="py-3 pl-4 pr-2 text-center w-14">Placement</th>
                  <th className="py-3 px-3">Team</th>
                  <th className="py-3 px-3 text-center">Kills</th>
                  <th className="py-3 px-3 text-center">Placement Pts</th>
                  <th className="py-3 px-3 text-center">Finish Pts</th>
                  <th className="py-3 px-3 text-center">Score Equation</th>
                  <th className="py-3 pl-3 pr-6 text-right font-black text-white">Match Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-esports-navy-border/40 text-xs font-semibold">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-esports-silver">
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
                            ? "bg-amber-500/10 hover:bg-amber-500/20"
                            : res.placement <= 4
                            ? "bg-esports-navy-light/40"
                            : "bg-esports-navy-card"
                        )}
                      >
                        <td className="py-2.5 pl-4 pr-2 text-center">
                          <span
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded-md font-display text-xs font-black",
                              isWin
                                ? "bg-esports-gold text-zinc-950 shadow-sm"
                                : res.placement <= 3
                                ? "bg-esports-navy-light text-white"
                                : "text-esports-silver"
                            )}
                          >
                            #{res.placement}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-6 w-6 shrink-0 rounded overflow-hidden bg-esports-navy-dark border border-esports-navy-border">
                              {team?.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={team.logo_url}
                                  alt={team.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-[9px] font-bold text-esports-orange flex items-center justify-center h-full">
                                  {team?.short_name.slice(0, 3)}
                                </span>
                              )}
                            </div>
                            <span className="font-display font-bold text-white">
                              {team?.name || "Team"}
                            </span>
                            <span className="text-[10px] text-esports-silver font-mono">
                              ({team?.short_name})
                            </span>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-center font-mono text-esports-silver">
                          {res.kills}
                        </td>

                        <td className="py-2.5 px-3 text-center font-mono text-esports-cream">
                          {res.placement_points}
                        </td>

                        <td className="py-2.5 px-3 text-center font-mono text-esports-cream">
                          {res.finish_points}
                        </td>

                        <td className="py-2.5 px-3 text-center font-mono text-[11px] text-esports-silver">
                          {res.placement_points} (place) + {res.finish_points} ({res.kills} kills)
                        </td>

                        <td className="py-2.5 pl-3 pr-6 text-right">
                          <span
                            className={cn(
                              "inline-block rounded-md px-2.5 py-0.5 font-display text-xs font-black",
                              isWin
                                ? "bg-esports-gold text-zinc-950"
                                : "bg-esports-navy-light text-esports-orange border border-esports-navy-border"
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
