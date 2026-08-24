"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Tournament, ScoringRulesConfig, Team, Match } from "@/types/database";
import { calculateLeaderboard, LeaderboardRow } from "@/lib/scoring/leaderboard";
import { useTournamentRealtime } from "@/hooks/use-tournament-realtime";
import { GameLogo } from "@/components/common/GameLogo";
import { Trophy, Maximize, Minimize, ArrowLeft, Clock, User } from "lucide-react";
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
    <div className="overflow-hidden rounded-xl border-2 border-[#1C1C1C] bg-[#141414] shadow-xl">
      <div className="bg-[#1C1C1C] px-4 py-2 text-xs font-oswald font-black uppercase tracking-wider text-[#F5C400] flex items-center justify-between border-b border-[#2D2D2D]">
        <span>{title}</span>
        <span className="text-[11px] text-white font-mono">{rows.length} {isSolo ? "Combatants" : "Teams"}</span>
      </div>
      <table className="w-full text-left border-collapse select-none">
        <thead>
          <tr className="bg-[#242424] text-[#F5C400] font-oswald text-xs uppercase tracking-wider border-b border-[#2D2D2D]">
            <th className="py-2.5 pl-3 pr-2 text-center w-12 font-black">#</th>
            <th className="py-2.5 px-3 font-black">{isSolo ? "PLAYER / IGN & ID" : "TEAM"}</th>
            <th className="py-2.5 px-3 text-center w-14 font-black">🏆</th>
            <th className="py-2.5 px-3 text-center w-20 font-black">MATCHES</th>
            <th className="py-2.5 px-3 text-center w-24 font-black">FINISH POINTS</th>
            <th className="py-2.5 px-3 text-center w-24 font-black">POSITION POINTS</th>
            <th className="py-2.5 pl-3 pr-4 text-right w-24 font-black text-white">TOTAL POINTS</th>
          </tr>
        </thead>
        <tbody className="font-oswald text-sm">
          {rows.map((row, idx) => {
            const isEven = idx % 2 === 0;
            const isWinner = row.rank === 1;

            return (
              <tr
                key={row.team.id}
                className={cn(
                  "transition-colors border-b border-[#D8D0B5]/40",
                  isEven ? "bg-[#EDE8D2]" : "bg-[#E5DEC3]",
                  isWinner && "bg-[#F5E6AA]"
                )}
              >
                <td className="py-2.5 pl-3 pr-2 text-center text-[#171717]">
                  <div className="flex items-center justify-center gap-1 font-oswald text-base font-black">
                    <span className="text-xs font-bold w-3 text-center">
                      {row.rankDelta !== undefined && row.rankDelta > 0 ? (
                        <span className="text-emerald-700">▲</span>
                      ) : row.rankDelta !== undefined && row.rankDelta < 0 ? (
                        <span className="text-rose-700">▼</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </span>
                    <span>{row.rank}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white border border-[#C8C0A5] overflow-hidden">
                      {isSolo ? (
                        <User className="h-3.5 w-3.5 text-slate-700" />
                      ) : row.team.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.team.logo_url}
                          alt={row.team.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-oswald font-black text-[9px] text-slate-800">
                          {row.team.short_name ? row.team.short_name.slice(0, 3) : "TM"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="font-oswald font-black text-base text-[#141414] truncate">
                        {row.team.name}
                      </span>
                      {row.team.short_name && row.team.short_name !== row.team.name && (
                        <span className="rounded bg-[#141414]/10 px-1 py-0.2 font-mono text-[10px] font-bold text-[#141414] shrink-0">
                          {isSolo ? `ID:${row.team.short_name}` : row.team.short_name}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center font-oswald text-base font-bold text-[#141414]">
                  {row.wins}
                </td>
                <td className="py-2.5 px-3 text-center font-oswald text-base font-bold text-[#141414]">
                  {row.matchesPlayed}
                </td>
                <td className="py-2.5 px-3 text-center font-oswald text-base font-bold text-[#141414]">
                  {row.finishPoints}
                </td>
                <td className="py-2.5 px-3 text-center font-oswald text-base font-bold text-[#141414]">
                  {row.placementPoints}
                </td>
                <td className="py-2.5 pl-3 pr-4 text-right font-oswald text-lg font-black text-[#141414]">
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
    <div
      className="flex min-h-screen flex-col bg-[#F3EED9] text-[#141414] select-none"
      style={{
        backgroundImage: `
          radial-gradient(#C8C0A5 1px, transparent 1px),
          linear-gradient(135deg, rgba(255, 204, 0, 0.2) 0%, transparent 40%, rgba(255, 204, 0, 0.15) 100%)
        `,
        backgroundSize: "20px 20px, 100% 100%",
      }}
    >
      {/* Stage Broadcast Header */}
      <header className="flex items-center justify-between border-b-2 border-[#141414] bg-[#141414] px-6 py-3 shadow-lg text-white">
        <div className="flex items-center gap-4">
          <Link
            href={`/tournament/${slug}`}
            className="flex items-center gap-1.5 rounded-md bg-[#242424] px-3 py-1.5 text-xs font-bold uppercase text-slate-300 hover:bg-[#333] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Exit Stage</span>
          </Link>

          <div className="flex items-center gap-3">
            <GameLogo
              slug={tournament?.game?.slug}
              name={tournament?.game?.name}
              size="sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-oswald text-xl font-black uppercase text-white tracking-tight">
                  {tournament?.name || "Official Tournament"}
                </h1>
                <span className="rounded bg-[#F5C400] text-[#141414] px-2 py-0.2 font-oswald text-[11px] font-black uppercase">
                  {tournament?.format || "SQUAD"}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-oswald uppercase tracking-wider">
                {tournament?.game?.name} • MATCH {completedMatchesCount} OF {matches.length || "LIVE"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-red-950/80 border border-red-800 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>LIVE BROADCAST</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-[#F5C400] bg-[#242424] px-3 py-1.5 rounded font-bold border border-[#333]">
            <Clock className="h-3.5 w-3.5 text-[#F5C400]" />
            <span>{currentTime}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="rounded bg-[#242424] p-2 text-slate-300 hover:bg-[#333] transition-colors border border-[#333]"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main Broadcast Arena Table */}
      <main className="flex-1 p-6 flex flex-col justify-center">
        {standings.length === 0 ? (
          <div className="rounded-xl border border-[#C8C0A5] bg-[#EDE8D2] p-12 text-center font-oswald text-base text-slate-600 font-bold uppercase">
            No participants registered yet.
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
