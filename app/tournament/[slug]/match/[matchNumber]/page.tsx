"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Tournament, Match, Team, MatchResult } from "@/types/database";
import {
  ArrowLeft,
  MapPin,
  Flame,
  Radio,
  Trophy,
  Shield,
  Crosshair,
  Lock,
  ChevronLeft,
  ChevronRight,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MatchDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const matchNumber = Number(params.matchNumber);

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMatchData = useCallback(async () => {
    try {
      const { data: tourney } = await supabase
        .from("tournaments")
        .select("*, game:games(*)")
        .eq("slug", slug)
        .single();
      setTournament(tourney);

      if (!tourney) return;

      const { data: teamsData } = await supabase
        .from("teams")
        .select("*")
        .eq("tournament_id", tourney.id);
      setTeams(teamsData || []);

      const { data: matchData } = await supabase
        .from("matches")
        .select("*, match_results(*)")
        .eq("tournament_id", tourney.id)
        .eq("match_number", matchNumber)
        .single();

      setMatch(matchData);
    } catch (err) {
      console.error("Error loading match details:", err);
    } finally {
      setLoading(false);
    }
  }, [slug, matchNumber]);

  useEffect(() => {
    loadMatchData();
  }, [loadMatchData]);

  const teamMap = new Map<string, Team>();
  teams.forEach((t) => teamMap.set(t.id, t));

  const sortedResults = match?.match_results
    ? [...match.match_results].sort((a, b) => a.placement - b.placement)
    : [];

  const winnerTeam = sortedResults.length > 0 && sortedResults[0].placement === 1
    ? teamMap.get(sortedResults[0].team_id)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/tournament/${slug}`}
          className="flex items-center gap-2 rounded-lg border border-esports-navy-border bg-esports-navy-card px-3.5 py-2 text-xs font-bold uppercase text-esports-silver hover:bg-esports-navy-light hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Overall Standings</span>
        </Link>

        {/* Prev / Next Match Controls */}
        <div className="flex items-center gap-2">
          {matchNumber > 1 && (
            <Link
              href={`/tournament/${slug}/match/${matchNumber - 1}`}
              className="flex items-center gap-1 rounded-md border border-esports-navy-border bg-esports-navy-card px-3 py-1.5 text-xs font-bold text-esports-silver hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Match {matchNumber - 1}</span>
            </Link>
          )}

          <Link
            href={`/tournament/${slug}/match/${matchNumber + 1}`}
            className="flex items-center gap-1 rounded-md border border-esports-navy-border bg-esports-navy-card px-3 py-1.5 text-xs font-bold text-esports-silver hover:text-white"
          >
            <span>Match {matchNumber + 1}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Match Banner Card */}
      <div className="relative overflow-hidden rounded-2xl border border-esports-navy-border bg-gradient-to-r from-esports-navy via-esports-navy-card to-esports-navy p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-esports-orange to-orange-600 text-white font-display text-2xl sm:text-3xl font-black shadow-lg shadow-esports-orange/20">
              #{matchNumber}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded bg-esports-navy-dark px-2.5 py-0.5 text-[10px] font-black uppercase text-esports-gold border border-esports-navy-border">
                  {match?.round_name || "Grand Finals"}
                </span>
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-black uppercase",
                    match?.status === "LIVE"
                      ? "bg-red-500/20 text-red-400 border border-red-500/40"
                      : "bg-emerald-500/20 text-emerald-300"
                  )}
                >
                  {match?.status}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-4xl font-black uppercase text-white">
                {match?.name || `Match ${matchNumber}`}
              </h1>
              <div className="flex items-center gap-3 text-xs text-esports-silver mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-esports-orange" />
                  Map: <strong className="text-white">{match?.map_name || "Erangel"}</strong>
                </span>
                <span>•</span>
                <span>Tournament: <strong className="text-white">{tournament?.name}</strong></span>
              </div>
            </div>
          </div>

          {/* Winner Showcase */}
          {winnerTeam && (
            <div className="flex items-center gap-4 rounded-xl border border-esports-gold/40 bg-gradient-to-r from-esports-gold/20 via-esports-gold/10 to-transparent p-4">
              <Flame className="h-8 w-8 text-esports-gold animate-bounce" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-esports-gold">
                  MATCH WINNER / WWCD
                </span>
                <h3 className="font-display text-lg font-black uppercase text-white">
                  {winnerTeam.name}
                </h3>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Match Results Table */}
      <div className="overflow-hidden rounded-xl border border-esports-navy-border bg-esports-navy-card shadow-2xl">
        <div className="border-b border-esports-navy-border bg-gradient-to-r from-esports-navy to-esports-navy-light px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-esports-gold" />
            <span className="font-display text-xs font-black uppercase text-white">
              Official Match #{matchNumber} Scorecard
            </span>
          </div>
          <span className="text-xs text-esports-silver font-mono">
            {sortedResults.length} Placements Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-esports-navy-border bg-esports-navy-dark text-[11px] font-black uppercase tracking-wider text-esports-silver">
                <th className="py-3 pl-4 pr-2 text-center w-14">Place</th>
                <th className="py-3 px-3">Team</th>
                <th className="py-3 px-3 text-center">Kills</th>
                <th className="py-3 px-3 text-center">Placement Pts</th>
                <th className="py-3 px-3 text-center">Kill Pts</th>
                <th className="py-3 px-3 text-center">Score Formula</th>
                <th className="py-3 pl-3 pr-6 text-right font-black text-white">Match Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-esports-navy-border/40 text-xs font-semibold">
              {sortedResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-esports-silver">
                    Scores for this match have not been entered yet.
                  </td>
                </tr>
              ) : (
                sortedResults.map((res) => {
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
                      <td className="py-3 pl-4 pr-2 text-center">
                        <span
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded font-display text-xs font-black",
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

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-esports-navy-dark border border-esports-navy-border font-display text-[10px] font-bold text-esports-orange">
                            {team?.short_name.slice(0, 3)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-black text-white text-sm">
                              {team?.name}
                            </span>
                            <span className="text-[10px] text-esports-silver font-mono">
                              ({team?.short_name})
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-esports-silver">
                        {res.kills}
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-esports-cream">
                        {res.placement_points}
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-esports-cream">
                        {res.finish_points}
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-xs text-esports-silver">
                        {res.placement_points} + ({res.kills} × 1) = {res.total_points}
                      </td>

                      <td className="py-3 pl-3 pr-6 text-right">
                        <span
                          className={cn(
                            "inline-block rounded-md px-3 py-1 font-display text-sm font-black",
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
    </div>
  );
}
