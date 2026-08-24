"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Tournament, ScoringRulesConfig, Team, Match } from "@/types/database";
import { calculateLeaderboard, LeaderboardRow } from "@/lib/scoring/leaderboard";
import { useTournamentRealtime } from "@/hooks/use-tournament-realtime";
import { Trophy, Flame, Crown, Maximize, Minimize, ArrowLeft, Radio, Clock, Sparkles } from "lucide-react";
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

  const col1 = standings.slice(0, 8);
  const col2 = standings.slice(8, 16);

  return (
    <div className="flex min-h-screen flex-col bg-[#070C1E] text-white select-none">
      {/* Top OBS / Projector Broadcast Bar */}
      <header className="flex items-center justify-between border-b-2 border-esports-orange/60 bg-gradient-to-r from-esports-navy-deep via-esports-navy to-esports-navy-deep px-6 py-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <Link
            href={`/tournament/${slug}`}
            className="flex items-center gap-1.5 rounded-lg bg-esports-navy-light px-3 py-1.5 text-xs font-black uppercase text-esports-silver hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Exit Stage</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-esports-orange/20 border border-esports-orange/40 text-esports-orange font-display text-base font-black">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
                  {tournament?.name || "Esports Championship"}
                </h1>
                <span className="rounded-full bg-esports-orange/20 border border-esports-orange/40 px-2.5 py-0.5 text-[10px] font-black uppercase text-esports-orange">
                  {tournament?.format || "SQUAD"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-esports-silver font-medium">
                <span>{tournament?.game?.name || "Battle Royale"}</span>
                <span>•</span>
                <span className="text-esports-gold font-bold">
                  {matches.length > 0 ? `MATCH ${completedMatchesCount} OF ${matches.length}` : "DYNAMIC MATCHES"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Live Stage Badge */}
          <div className="flex items-center gap-2 rounded-full bg-red-600/20 border border-red-500/50 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-red-400">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span>LIVE STAGE</span>
          </div>

          {/* Clock */}
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs font-bold text-esports-silver bg-esports-navy-dark px-3 py-1.5 rounded-lg border border-esports-navy-border">
            <Clock className="h-3.5 w-3.5 text-esports-orange" />
            <span>{currentTime}</span>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 rounded-lg bg-esports-navy-light px-3.5 py-2 text-xs font-black uppercase text-white hover:bg-esports-navy border border-esports-navy-border shadow"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>
        </div>
      </header>

      {/* Main Dual-Column LED Screen Layout */}
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column (1-8) */}
          <div className="overflow-hidden rounded-2xl border border-esports-navy-border bg-esports-navy-card/95 shadow-2xl">
            <div className="border-b border-esports-navy-border bg-gradient-to-r from-esports-navy to-esports-navy-light px-5 py-3 text-xs font-black uppercase tracking-wider text-white flex items-center justify-between">
              <span>Top Tier (Ranks 1 – 8)</span>
              <span className="text-esports-gold">Grand Finals Zone</span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-esports-navy-border bg-esports-navy-dark text-[11px] font-black uppercase text-esports-silver">
                  <th className="py-3 pl-4 pr-2 text-center w-14"># Rank</th>
                  <th className="py-3 px-3">Team / Squad</th>
                  <th className="py-3 px-3 text-center">WWCD</th>
                  <th className="py-3 px-3 text-center">Place</th>
                  <th className="py-3 px-3 text-center">Kills</th>
                  <th className="py-3 pl-3 pr-5 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-esports-navy-border/40 text-xs font-bold">
                {col1.map((row) => (
                  <tr
                    key={row.team.id}
                    className={cn(
                      "transition-colors",
                      row.rank === 1
                        ? "bg-gradient-to-r from-amber-500/20 via-esports-navy-light to-transparent"
                        : row.rank <= 3
                        ? "bg-esports-navy-light/40"
                        : "bg-esports-navy-card"
                    )}
                  >
                    <td className="py-3 pl-4 pr-2 text-center">
                      {row.rank === 1 ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-400 font-display text-xs font-black text-zinc-950 shadow-md shadow-amber-400/40">
                          <Crown className="h-4 w-4" />
                        </div>
                      ) : (
                        <span className="font-display text-sm text-esports-silver">
                          {row.rank < 10 ? `0${row.rank}` : row.rank}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-white text-sm">
                          {row.team.name}
                        </span>
                        <span className="text-[10px] text-esports-silver font-mono">
                          [{row.team.short_name}]
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={row.wins > 0 ? "text-esports-gold font-black" : "text-zinc-500"}>
                        {row.wins}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-esports-cream">
                      {row.placementPoints}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-esports-silver">
                      {row.totalKills}
                    </td>
                    <td className="py-3 pl-3 pr-5 text-right">
                      <span
                        className={cn(
                          "rounded-lg px-3 py-1 font-display text-base font-black",
                          row.rank === 1
                            ? "bg-amber-400 text-zinc-950 shadow-amber-400/30"
                            : "bg-esports-navy-light text-esports-orange border border-esports-navy-border"
                        )}
                      >
                        {row.totalPoints}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right Column (9-16) */}
          <div className="overflow-hidden rounded-2xl border border-esports-navy-border bg-esports-navy-card/95 shadow-2xl">
            <div className="border-b border-esports-navy-border bg-gradient-to-r from-esports-navy to-esports-navy-light px-5 py-3 text-xs font-black uppercase tracking-wider text-white flex items-center justify-between">
              <span>Challenger Tier (Ranks 9 – 16)</span>
              <span className="text-esports-silver">Elimination Danger</span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-esports-navy-border bg-esports-navy-dark text-[11px] font-black uppercase text-esports-silver">
                  <th className="py-3 pl-4 pr-2 text-center w-14"># Rank</th>
                  <th className="py-3 px-3">Team / Squad</th>
                  <th className="py-3 px-3 text-center">WWCD</th>
                  <th className="py-3 px-3 text-center">Place</th>
                  <th className="py-3 px-3 text-center">Kills</th>
                  <th className="py-3 pl-3 pr-5 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-esports-navy-border/40 text-xs font-bold">
                {col2.map((row) => (
                  <tr key={row.team.id} className="bg-esports-navy-card hover:bg-esports-navy-light/40">
                    <td className="py-3 pl-4 pr-2 text-center font-display text-sm text-esports-silver">
                      {row.rank < 10 ? `0${row.rank}` : row.rank}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-white text-sm">
                          {row.team.name}
                        </span>
                        <span className="text-[10px] text-esports-silver font-mono">
                          [{row.team.short_name}]
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={row.wins > 0 ? "text-esports-gold font-black" : "text-zinc-500"}>
                        {row.wins}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-esports-cream">
                      {row.placementPoints}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-esports-silver">
                      {row.totalKills}
                    </td>
                    <td className="py-3 pl-3 pr-5 text-right">
                      <span className="rounded-lg bg-esports-navy-light px-3 py-1 font-display text-base font-black text-esports-orange border border-esports-navy-border">
                        {row.totalPoints}
                      </span>
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
