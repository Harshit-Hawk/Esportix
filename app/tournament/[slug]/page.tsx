"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Tournament, ScoringRulesConfig, Team, Match, Player } from "@/types/database";
import { calculateLeaderboard, LeaderboardRow } from "@/lib/scoring/leaderboard";
import { TournamentHeader } from "@/components/tournament/TournamentHeader";
import { StandingsTable } from "@/components/tournament/StandingsTable";
import { MatchScorecard } from "@/components/tournament/MatchScorecard";
import { TeamRosterGrid } from "@/components/tournament/TeamRosterGrid";
import { ExportModal } from "@/components/tournament/ExportModal";
import { useTournamentRealtime } from "@/hooks/use-tournament-realtime";
import {
  Trophy,
  Table as TableIcon,
  Crosshair,
  Users,
  ScrollText,
  Radio,
  RefreshCw,
  AlertCircle,
  Loader2,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TournamentPublicPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [scoringRules, setScoringRules] = useState<ScoringRulesConfig | null>(null);
  const [teams, setTeams] = useState<(Team & { players?: Player[] })[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"standings" | "matches" | "teams" | "rules">("standings");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | undefined>(undefined);

  // Fetch full tournament payload
  const fetchTournamentData = useCallback(async () => {
    if (!slug) return;
    try {
      // 1. Fetch tournament
      const { data: tourney, error: tErr } = await supabase
        .from("tournaments")
        .select("*, game:games(*)")
        .eq("slug", slug)
        .single();

      if (tErr || !tourney) {
        setLoading(false);
        return;
      }

      setTournament(tourney);

      // 2. Fetch scoring rules
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

      // 3. Fetch teams with players
      const { data: teamsData } = await supabase
        .from("teams")
        .select("*, players(*)")
        .eq("tournament_id", tourney.id)
        .order("seed", { ascending: true });

      setTeams(teamsData || []);

      // 4. Fetch matches with match results
      const { data: matchesData } = await supabase
        .from("matches")
        .select("*, match_results(*)")
        .eq("tournament_id", tourney.id)
        .order("match_number", { ascending: true });

      setMatches(matchesData || []);
    } catch (err) {
      console.error("Error loading tournament data:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchTournamentData();
  }, [fetchTournamentData]);

  // Hook up realtime subscription
  const realtimeState = useTournamentRealtime(tournament?.id, () => {
    fetchTournamentData();
  });

  // Calculate dynamic leaderboard standings
  const standings = useMemo<LeaderboardRow[]>(() => {
    if (!teams.length || !scoringRules) return [];
    return calculateLeaderboard({
      teams,
      matches,
      scoringRules,
    });
  }, [teams, matches, scoringRules]);

  const completedMatchesCount = matches.filter((m) => m.status === "COMPLETED").length;
  const latestMatch = matches.find((m) => m.status === "LIVE") || matches[matches.length - 1];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-esports-orange" />
        <span className="font-display text-sm font-bold uppercase tracking-wider text-esports-silver">
          Loading Tournament Standings...
        </span>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-esports-orange mb-3" />
        <h2 className="font-display text-2xl font-black uppercase text-white">Tournament Not Found</h2>
        <p className="text-sm text-esports-silver mt-2">
          The tournament with slug &ldquo;{slug}&rdquo; could not be located.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-6 rounded-md bg-esports-orange px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:brightness-110"
        >
          Return to Tournaments
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Realtime Live Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-esports-navy-border/80 bg-esports-navy/90 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                realtimeState.isConnected ? "bg-emerald-400" : "bg-amber-400"
              )}
            />
            <span
              className={cn(
                "relative inline-flex rounded-full h-2.5 w-2.5",
                realtimeState.isConnected ? "bg-emerald-500" : "bg-amber-500"
              )}
            />
          </span>
          <span className="font-bold text-white uppercase tracking-wider">
            {realtimeState.isConnected ? "Realtime Sync Active" : "Connecting Live..."}
          </span>
          <span className="text-esports-silver text-[11px] hidden sm:inline">
            • Live scorecard updates automatically when scores are entered
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-esports-silver">
          {realtimeState.lastUpdated && (
            <span>Updated {realtimeState.lastUpdated.toLocaleTimeString()}</span>
          )}
          <button
            onClick={fetchTournamentData}
            title="Force refresh data"
            className="flex items-center gap-1 text-esports-orange hover:text-white transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Broadcast Header */}
      <TournamentHeader
        tournament={tournament}
        completedMatchesCount={completedMatchesCount}
        totalMatchesCount={matches.length}
        latestMatch={latestMatch}
        standings={standings}
        onOpenExport={() => setExportModalOpen(true)}
      />

      {/* Broadcast Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("standings")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-xs font-black uppercase tracking-wider transition-all",
              activeTab === "standings"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Trophy className="h-4 w-4 text-yellow-300" />
            <span>Overall Standings</span>
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-mono">
              {standings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("matches")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-xs font-black uppercase tracking-wider transition-all",
              activeTab === "matches"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Layers className="h-4 w-4" />
            <span>Match Breakdown</span>
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-mono">
              {matches.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("teams")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-xs font-black uppercase tracking-wider transition-all",
              activeTab === "teams"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Users className="h-4 w-4" />
            <span>Teams & Rosters</span>
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-mono">
              {teams.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("rules")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-xs font-black uppercase tracking-wider transition-all",
              activeTab === "rules"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Sparkles className="h-4 w-4" />
            <span>Scoring Rules</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Sort Order:</span>
          <span className="font-bold text-slate-900 font-mono">OFFICIAL FORMULA</span>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "standings" && (
        <StandingsTable
          standings={standings}
          tournament={tournament}
          completedMatchesCount={completedMatchesCount}
        />
      )}

      {activeTab === "matches" && (
        <MatchScorecard
          matches={matches}
          teams={teams}
          selectedMatchId={selectedMatchId}
          onSelectMatch={setSelectedMatchId}
        />
      )}

      {activeTab === "teams" && <TeamRosterGrid teams={teams} />}

      {activeTab === "rules" && scoringRules && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Placement Points Table */}
          <div className="rounded-xl border border-esports-navy-border bg-esports-navy-card p-6 shadow-xl">
            <h3 className="font-display text-base font-black uppercase text-white mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-esports-gold" />
              <span>Placement Points System</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(scoringRules.placement_rules || {}).map(([place, pts]) => (
                <div
                  key={place}
                  className="flex items-center justify-between rounded-lg bg-esports-navy-dark/70 px-3 py-2 border border-esports-navy-border/40"
                >
                  <span className="font-bold text-esports-silver">Rank #{place}</span>
                  <span className="font-display font-black text-esports-gold">{pts} PTS</span>
                </div>
              ))}
            </div>
          </div>

          {/* Kill Multiplier & Tie-Breakers */}
          <div className="space-y-6">
            <div className="rounded-xl border border-esports-navy-border bg-esports-navy-card p-6 shadow-xl">
              <h3 className="font-display text-base font-black uppercase text-white mb-3 flex items-center gap-2">
                <Crosshair className="h-5 w-5 text-esports-orange" />
                <span>Elimination / Kill Points</span>
              </h3>
              <div className="flex items-center justify-between rounded-lg bg-esports-navy-dark/70 p-4 border border-esports-navy-border/40">
                <span className="text-xs text-esports-silver">Points awarded per confirmed kill</span>
                <span className="font-display text-xl font-black text-esports-orange">
                  {scoringRules.kill_points} PT / KILL
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-esports-navy-border bg-esports-navy-card p-6 shadow-xl">
              <h3 className="font-display text-base font-black uppercase text-white mb-3 flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-esports-silver" />
                <span>Configured Tie-Breaker Order</span>
              </h3>
              <ol className="space-y-2 text-xs">
                {(scoringRules.tie_breaker_priority || []).map((crit, idx) => (
                  <li
                    key={crit}
                    className="flex items-center gap-3 rounded-lg bg-esports-navy-dark/60 px-3 py-2 border border-esports-navy-border/40"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-esports-navy-light text-[10px] font-black text-esports-orange">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white capitalize">
                      {crit.replace("_", " ")}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {tournament && (
        <ExportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          tournament={tournament}
          standings={standings}
          scorecardElementId="overall-scorecard-table"
        />
      )}
    </div>
  );
}
