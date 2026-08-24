"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Tournament, ScoringRulesConfig, Team, Match } from "@/types/database";
import { calculateLeaderboard, LeaderboardRow } from "@/lib/scoring/leaderboard";
import { useTournamentRealtime } from "@/hooks/use-tournament-realtime";
import { GameLogo } from "@/components/common/GameLogo";
import { Trophy, Maximize, Minimize, ArrowLeft, Clock, User, Activity, Zap } from "lucide-react";
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
  const isSolo = tournament?.format === "SOLO";

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const shouldSplitColumns = standings.length > 8;
  const splitIndex = shouldSplitColumns ? Math.ceil(standings.length / 2) : standings.length;
  const col1 = standings.slice(0, splitIndex);
  const col2 = shouldSplitColumns ? standings.slice(splitIndex) : [];

  const renderTableSection = (rows: LeaderboardRow[], title: string) => (
    <div className="overflow-hidden rounded-2xl border-2 border-[#242945] bg-[#090A10] shadow-[0_0_30px_rgba(0,240,255,0.1)]">
      <div className="bg-[#11131F] px-4 py-2.5 text-xs font-orbitron font-black uppercase tracking-wider text-[#00F0FF] flex items-center justify-between border-b border-[#242945]">
        <span>{title}</span>
        <span className="text-[11px] text-slate-400 font-mono">{rows.length} {isSolo ? "Combatants" : "Teams"}</span>
      </div>
      <table className="w-full text-left border-collapse select-none">
        <thead>
          <tr className="bg-[#16192B] text-[#00F0FF] font-orbitron text-xs uppercase tracking-wider border-b border-[#242945]">
            <th className="py-2.5 pl-3 pr-2 text-center w-12 font-black">#</th>
            <th className="py-2.5 px-3 font-black">{isSolo ? "PLAYER / IGN & ID" : "TEAM"}</th>
            <th className="py-2.5 px-3 text-center w-14 font-black">🏆</th>
            <th className="py-2.5 px-3 text-center w-20 font-black">MATCHES</th>
            <th className="py-2.5 px-3 text-center w-24 font-black">FINISH POINTS</th>
            <th className="py-2.5 px-3 text-center w-24 font-black">POSITION POINTS</th>
            <th className="py-2.5 pl-3 pr-4 text-right w-24 font-black text-white">TOTAL POINTS</th>
          </tr>
        </thead>
        <tbody className="font-chakra text-sm">
          {rows.map((row, idx) => {
            const isEven = idx % 2 === 0;
            const isWinner = row.rank === 1;

            return (
              <tr
                key={row.team.id}
                className={cn(
                  "transition-colors border-b border-[#242945]/40",
                  isEven ? "bg-[#0D0E18]" : "bg-[#11131F]",
                  isWinner && "bg-gradient-to-r from-[#FFE600]/10 via-[#11131F] to-transparent border-l-4 border-l-[#FFE600]"
                )}
              >
                <td className="py-2.5 pl-3 pr-2 text-center">
                  <div className="flex items-center justify-center gap-1 font-orbitron text-base font-black">
                    <span className="text-xs font-bold w-3 text-center">
                      {row.rankDelta !== undefined && row.rankDelta > 0 ? (
                        <span className="text-[#00FF66] drop-shadow-[0_0_5px_#00FF66]">▲</span>
                      ) : row.rankDelta !== undefined && row.rankDelta < 0 ? (
                        <span className="text-[#FF2A85] drop-shadow-[0_0_5px_#FF2A85]">▼</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </span>
                    <span
                      className={
                        isWinner
                          ? "text-[#FFE600] drop-shadow-[0_0_8px_#FFE600]"
                          : row.rank <= 3
                          ? "text-[#00F0FF]"
                          : "text-white"
                      }
                    >
                      {row.rank}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#16192B] border border-[#242945] overflow-hidden">
                      {isSolo ? (
                        <User className="h-3.5 w-3.5 text-[#00F0FF]" />
                      ) : row.team.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.team.logo_url}
                          alt={row.team.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-orbitron font-black text-[9px] text-[#00F0FF]">
                          {row.team.short_name ? row.team.short_name.slice(0, 3) : "TM"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="font-orbitron font-black text-base text-white truncate">
                        {row.team.name}
                      </span>
                      {row.team.short_name && row.team.short_name !== row.team.name && (
                        <span className="rounded bg-[#00F0FF]/15 border border-[#00F0FF]/30 px-1.5 py-0.2 font-mono text-[10px] font-bold text-[#00F0FF] shrink-0">
                          {isSolo ? `ID:${row.team.short_name}` : row.team.short_name}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center font-orbitron text-base font-bold text-[#FFE600]">
                  {row.wins}
                </td>
                <td className="py-2.5 px-3 text-center font-chakra text-base font-bold text-slate-300">
                  {row.matchesPlayed}
                </td>
                <td className="py-2.5 px-3 text-center font-chakra text-base font-bold text-[#FF2A85]">
                  {row.finishPoints}
                </td>
                <td className="py-2.5 px-3 text-center font-chakra text-base font-bold text-[#00F0FF]">
                  {row.placementPoints}
                </td>
                <td className="py-2.5 pl-3 pr-4 text-right font-orbitron text-lg font-black text-white">
                  {row.totalPoints}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#090A10] text-white select-none retro-grid">
      {/* Cyber Stage Broadcast Header */}
      <header className="flex items-center justify-between border-b-2 border-[#242945] bg-[#0E101B]/95 backdrop-blur px-6 py-3 shadow-[0_0_20px_rgba(0,240,255,0.15)] text-white">
        <div className="flex items-center gap-4">
          <Link
            href={`/tournament/${slug}`}
            className="flex items-center gap-1.5 rounded-xl border border-[#242945] bg-[#16192B] px-3 py-1.5 font-chakra text-xs font-bold uppercase text-[#00F0FF] hover:bg-[#00F0FF] hover:text-slate-950 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Exit HUD</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-[#16192B] border border-[#00F0FF]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              <GameLogo
                slug={tournament?.game?.slug}
                name={tournament?.game?.name}
                size="sm"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-orbitron text-xl font-black uppercase text-white tracking-tight">
                  {tournament?.name || "Official Tournament"}
                </h1>
                <span className="rounded-md bg-[#00F0FF] text-slate-950 px-2 py-0.2 font-orbitron text-[11px] font-black uppercase shadow-[0_0_8px_#00F0FF]">
                  {tournament?.format || "SQUAD"}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-chakra uppercase tracking-wider">
                {tournament?.game?.name} • MATCH {completedMatchesCount} OF {matches.length || "LIVE"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-[#FF2A85]/20 border border-[#FF2A85] px-3 py-1 text-xs font-chakra font-bold uppercase tracking-wider text-[#FF2A85] shadow-[0_0_10px_rgba(255,42,133,0.3)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF2A85] animate-pulse" />
            <span>BROADCAST LIVE</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-[#00F0FF] bg-[#16192B] px-3 py-1.5 rounded-xl font-bold border border-[#242945]">
            <Clock className="h-3.5 w-3.5 text-[#00F0FF]" />
            <span>{currentTime}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="rounded-xl bg-[#16192B] p-2 text-slate-300 hover:text-white hover:border-[#00F0FF] transition-all border border-[#242945]"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main Broadcast Arena Table */}
      <main className="flex-1 p-6 flex flex-col justify-center">
        {standings.length === 0 ? (
          <div className="rounded-2xl border border-[#242945] bg-[#11131F] p-12 text-center font-orbitron text-base text-slate-400 font-bold uppercase">
            No participants linked to grid yet.
          </div>
        ) : shouldSplitColumns ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {renderTableSection(col1, `RANK 1 – ${splitIndex}`)}
            {renderTableSection(col2, `RANK ${splitIndex + 1} – ${standings.length}`)}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full">
            {renderTableSection(col1, `OVERALL STANDINGS (RANK 1 – ${standings.length})`)}
          </div>
        )}
      </main>
    </div>
  );
}
