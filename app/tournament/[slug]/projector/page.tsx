"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Tournament, ScoringRulesConfig, Team, Match } from "@/types/database";
import { calculateLeaderboard, LeaderboardRow } from "@/lib/scoring/leaderboard";
import { useTournamentRealtime } from "@/hooks/use-tournament-realtime";
import { Trophy, Flame, Crown, Maximize, Minimize, ArrowLeft, Radio } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProjectorScoreboardPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [scoringRules, setScoringRules] = useState<ScoringRulesConfig | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchTournamentData = useCallback(async () => {
    if (!slug) return;
    try {
      const { data: tourney } = await supabase
        .from("tournaments")
        .select("*, game:games(*)")
        .eq("slug", slug)
        .single();

      if (!tourney) return;
      setTournament(tourney);

      const { data: rules } = await supabase
        .from("scoring_rules")
        .select("*")
        .eq("tournament_id", tourney.id)
        .single();

      if (rules) {
        setScoringRules({
          placement_rules: rules.placement_rules || {},
          kill_points: Number(rules.kill_points) || 1,
          win_bonus: Number(rules.win_bonus) || 0,
          bonus_rules: rules.bonus_rules || {},
          penalty_rules: rules.penalty_rules || {},
          tie_breaker_priority: rules.tie_breaker_priority || [],
        });
      }

      const { data: teamsData } = await supabase
        .from("teams")
        .select("*")
        .eq("tournament_id", tourney.id);

      setTeams(teamsData || []);

      const { data: matchesData } = await supabase
        .from("matches")
        .select("*, match_results(*)")
        .eq("tournament_id", tourney.id)
        .order("match_number", { ascending: true });

      setMatches(matchesData || []);
    } catch (err) {
      console.error("Projector fetch error:", err);
    }
  }, [slug]);

  useEffect(() => {
    fetchTournamentData();
  }, [fetchTournamentData]);

  // Realtime hook
  useTournamentRealtime(tournament?.id, () => {
    fetchTournamentData();
  });

  const standings = useMemo<LeaderboardRow[]>(() => {
    if (!teams.length || !scoringRules) return [];
    return calculateLeaderboard({
      teams,
      matches,
      scoringRules,
    });
  }, [teams, matches, scoringRules]);

  const completedMatchesCount = matches.filter((m) => m.status === "COMPLETED").length;
  const activeMatch = matches.find((m) => m.status === "LIVE") || matches[matches.length - 1];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070C1E] text-white p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
      {/* Projector Top Broadcast Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b-2 border-esports-orange/60 pb-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/tournament/${slug}`}
            className="flex items-center gap-1.5 rounded-md bg-esports-navy-light px-3 py-1.5 text-xs font-bold uppercase text-esports-silver hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Exit Stage Mode</span>
          </Link>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                {tournament?.name || "ESPORTS SHOWDOWN"}
              </span>
              <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-black uppercase text-white animate-pulse">
                ● LIVE STAGE
              </span>
            </div>
            <span className="font-display text-sm font-bold uppercase tracking-widest text-esports-orange">
              OVERALL STANDINGS • AFTER MATCH {completedMatchesCount} OF {matches.length}
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-esports-navy-border bg-esports-navy px-4 py-2 text-right">
            <span className="text-[10px] font-bold uppercase text-esports-silver block">
              CURRENT MAP
            </span>
            <span className="font-display text-sm font-black text-esports-gold">
              {activeMatch?.map_name || "Erangel"} ({activeMatch?.round_name || "Finals"})
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-esports-navy-border bg-esports-navy-light text-esports-silver hover:text-white"
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Main 2-Column Split Standings for Stage Screens */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Top 1-8 */}
        <div className="overflow-hidden rounded-xl border border-esports-navy-border bg-esports-navy-card/90">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-esports-navy-border bg-esports-navy text-[11px] font-black uppercase tracking-wider text-esports-silver">
                <th className="py-2.5 pl-4 pr-2 text-center w-12">#</th>
                <th className="py-2.5 px-3">TEAM</th>
                <th className="py-2.5 px-3 text-center">WWCD</th>
                <th className="py-2.5 px-3 text-center">PLACE</th>
                <th className="py-2.5 px-3 text-center">KILLS</th>
                <th className="py-2.5 pl-3 pr-5 text-right font-black text-white">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-esports-navy-border/50 text-xs font-bold">
              {standings.slice(0, 8).map((row) => {
                const isChampion = row.rank === 1;
                return (
                  <tr
                    key={row.team.id}
                    className={cn(
                      isChampion
                        ? "bg-amber-500/20 text-white"
                        : row.rank <= 3
                        ? "bg-esports-navy-light/60"
                        : "bg-esports-navy-card"
                    )}
                  >
                    <td className="py-2.5 pl-4 pr-2 text-center">
                      <span
                        className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded font-display text-xs font-black",
                          isChampion
                            ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/40"
                            : row.rank === 2
                            ? "bg-slate-200 text-zinc-950"
                            : row.rank === 3
                            ? "bg-amber-700 text-white"
                            : "text-esports-silver"
                        )}
                      >
                        {isChampion ? <Crown className="h-3.5 w-3.5" /> : `0${row.rank}`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-sm text-white">
                          {row.team.name}
                        </span>
                        <span className="text-[10px] text-esports-silver">
                          [{row.team.short_name}]
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-esports-gold">
                      {row.wins}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-esports-silver">
                      {row.placementPoints}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-esports-silver">
                      {row.finishPoints}
                    </td>
                    <td className="py-2.5 pl-3 pr-5 text-right">
                      <span
                        className={cn(
                          "inline-block rounded px-2.5 py-0.5 font-display text-sm font-black",
                          isChampion
                            ? "bg-amber-400 text-zinc-950"
                            : "bg-esports-orange text-white"
                        )}
                      >
                        {row.totalPoints}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right Column: Ranks 9-16 */}
        <div className="overflow-hidden rounded-xl border border-esports-navy-border bg-esports-navy-card/90">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-esports-navy-border bg-esports-navy text-[11px] font-black uppercase tracking-wider text-esports-silver">
                <th className="py-2.5 pl-4 pr-2 text-center w-12">#</th>
                <th className="py-2.5 px-3">TEAM</th>
                <th className="py-2.5 px-3 text-center">WWCD</th>
                <th className="py-2.5 px-3 text-center">PLACE</th>
                <th className="py-2.5 px-3 text-center">KILLS</th>
                <th className="py-2.5 pl-3 pr-5 text-right font-black text-white">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-esports-navy-border/50 text-xs font-bold">
              {standings.slice(8, 16).map((row) => (
                <tr key={row.team.id} className="bg-esports-navy-card hover:bg-esports-navy-light/40">
                  <td className="py-2.5 pl-4 pr-2 text-center text-esports-silver font-display text-xs">
                    {row.rank < 10 ? `0${row.rank}` : row.rank}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm text-white">
                        {row.team.name}
                      </span>
                      <span className="text-[10px] text-esports-silver">
                        [{row.team.short_name}]
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-esports-silver">
                    {row.wins}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-esports-silver">
                    {row.placementPoints}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-esports-silver">
                    {row.finishPoints}
                  </td>
                  <td className="py-2.5 pl-3 pr-5 text-right">
                    <span className="inline-block rounded bg-esports-navy-light px-2.5 py-0.5 font-display text-sm font-black text-esports-orange border border-esports-navy-border">
                      {row.totalPoints}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Projector Footer Ticker */}
      <footer className="mt-6 flex items-center justify-between border-t border-esports-navy-border/60 pt-3 text-xs text-esports-silver font-mono">
        <div>ESPORTIX BROADCAST ENGINE • OFFICIAL TOURNAMENT DATA</div>
        <div className="flex items-center gap-2 text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>AUTO-SYNC REALTIME ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}
