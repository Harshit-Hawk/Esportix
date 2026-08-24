"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Tournament, ScoringRulesConfig, Team, Match } from "@/types/database";
import { calculateLeaderboard, LeaderboardRow } from "@/lib/scoring/leaderboard";
import { useTournamentRealtime } from "@/hooks/use-tournament-realtime";
import { Trophy, Maximize, Minimize, ArrowLeft, Clock } from "lucide-react";
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
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString());
    return () => clearInterval(timer);
  }, []);

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const col1 = standings.slice(0, 8);
  const col2 = standings.slice(8, 16);

  return (
    <div className="flex min-h-screen flex-col bg-slate-900 text-white select-none">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-3.5">
        <div className="flex items-center gap-4">
          <Link
            href={`/tournament/${slug}`}
            className="flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Exit Stage</span>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                {tournament?.name || "Tournament Leaderboard"}
              </h1>
              <span className="rounded bg-blue-900/60 text-blue-300 border border-blue-700 px-2 py-0.2 text-[10px] font-semibold">
                {tournament?.format || "SQUAD"}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {tournament?.game?.name} • Match {completedMatchesCount} of {matches.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-red-950/80 border border-red-800 px-2.5 py-0.5 text-xs font-semibold text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>LIVE</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>{currentTime}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="rounded bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main Dual-Column Stadium Table */}
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top 8 */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-md">
            <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-300">
              Rank 1 – 8
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                  <th className="py-2.5 pl-4 pr-2 text-center w-12">#</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3 text-center">Wins</th>
                  <th className="py-2.5 px-3 text-center">Place</th>
                  <th className="py-2.5 px-3 text-center">Kills</th>
                  <th className="py-2.5 pl-3 pr-4 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {col1.map((row) => (
                  <tr
                    key={row.team.id}
                    className={cn(
                      row.rank === 1 ? "bg-amber-950/20" : "hover:bg-slate-900/40"
                    )}
                  >
                    <td className="py-3 pl-4 pr-2 text-center font-mono font-bold text-slate-400">
                      {row.rank === 1 ? <span className="text-amber-400 font-extrabold">#1</span> : `#${row.rank}`}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-white">
                        {row.team.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono ml-1.5">
                        [{row.team.short_name}]
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-amber-400 font-bold">
                      {row.wins}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-300">
                      {row.placementPoints}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-300">
                      {row.totalKills}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right font-mono font-bold text-sm text-blue-400">
                      {row.totalPoints} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 9 - 16 */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-md">
            <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-300">
              Rank 9 – 16
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                  <th className="py-2.5 pl-4 pr-2 text-center w-12">#</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3 text-center">Wins</th>
                  <th className="py-2.5 px-3 text-center">Place</th>
                  <th className="py-2.5 px-3 text-center">Kills</th>
                  <th className="py-2.5 pl-3 pr-4 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {col2.map((row) => (
                  <tr key={row.team.id} className="hover:bg-slate-900/40">
                    <td className="py-3 pl-4 pr-2 text-center font-mono font-bold text-slate-400">
                      #{row.rank}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-white">
                        {row.team.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono ml-1.5">
                        [{row.team.short_name}]
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {row.wins}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-300">
                      {row.placementPoints}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-300">
                      {row.totalKills}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right font-mono font-bold text-sm text-slate-300">
                      {row.totalPoints} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
