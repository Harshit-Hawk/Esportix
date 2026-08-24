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

  const fetchTournamentData = useCallback(async () => {
    if (!slug) return;
    try {
      const { data: tourney, error: tErr } = await supabase
        .from("tournaments")
        .select("*, game:games(*)")
        .eq("slug", slug)
        .single();

      if (tErr || !tourney) {
        console.error("Tournament not found:", tErr);
        setLoading(false);
        return;
      }

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
        .select("*, players(*)")
        .eq("tournament_id", tourney.id)
        .order("seed", { ascending: true });

      setTeams(teamsData || []);

      const { data: matchesData } = await supabase
        .from("matches")
        .select("*, match_results(*)")
        .eq("tournament_id", tourney.id)
        .order("match_number", { ascending: true });

      setMatches(matchesData || []);
    } catch (err) {
      console.error("Error fetching tournament:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchTournamentData();
  }, [fetchTournamentData]);

  const realtimeState = useTournamentRealtime(tournament?.id, () => {
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
  const latestMatch = matches.find((m) => m.status === "LIVE") || matches[matches.length - 1];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-xs font-medium">Loading Standings...</span>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-3">
        <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
        <h2 className="text-lg font-bold text-slate-900">Tournament Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested tournament &ldquo;{slug}&rdquo; could not be found.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
        >
          Back to Tournaments
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Realtime Status Indicator */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {realtimeState.isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                realtimeState.isConnected ? "bg-emerald-500" : "bg-amber-500"
              )}
            />
          </span>
          <span className="font-medium text-slate-700">
            {realtimeState.isConnected ? "Live Sync Active" : "Connecting..."}
          </span>
          <span className="text-slate-400 hidden sm:inline">• Standings update automatically</span>
        </div>

        <button
          onClick={fetchTournamentData}
          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tournament Header */}
      <TournamentHeader
        tournament={tournament}
        completedMatchesCount={completedMatchesCount}
        totalMatchesCount={matches.length}
        latestMatch={latestMatch}
        standings={standings}
        onOpenExport={() => setExportModalOpen(true)}
      />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
        <div className="flex items-center gap-1 -mb-px">
          <button
            onClick={() => setActiveTab("standings")}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors",
              activeTab === "standings"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            )}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Standings</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono text-slate-600 ml-1">
              {standings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("matches")}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors",
              activeTab === "matches"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Matches</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono text-slate-600 ml-1">
              {matches.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("teams")}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors",
              activeTab === "teams"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Teams & Rosters</span>
          </button>

          <button
            onClick={() => setActiveTab("rules")}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors",
              activeTab === "rules"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            )}
          >
            <ScrollText className="h-3.5 w-3.5" />
            <span>Rules</span>
          </button>
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
          onSelectMatch={(mId) => setSelectedMatchId(mId)}
        />
      )}

      {activeTab === "teams" && (
        <TeamRosterGrid teams={teams} />
      )}

      {activeTab === "rules" && scoringRules && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Scoring System Configuration
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>Points Per Kill</span>
                <span className="font-mono font-semibold text-slate-900">{scoringRules.kill_points} pt</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>Winner Bonus</span>
                <span className="font-mono font-semibold text-slate-900">{scoringRules.win_bonus} pts</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Placement Points Scale
            </h3>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 text-xs font-mono">
              {Object.keys(scoringRules.placement_rules || {})
                .sort((a, b) => Number(a) - Number(b))
                .map((p) => (
                  <div key={p} className="flex justify-between rounded bg-slate-50 px-2 py-1 border border-slate-100">
                    <span className="text-slate-500">#{p}</span>
                    <span className="font-bold text-slate-900">{scoringRules.placement_rules[p]} pts</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        tournament={tournament}
        standings={standings}
        completedMatchesCount={completedMatchesCount}
      />
    </div>
  );
}
