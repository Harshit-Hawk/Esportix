"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  Tournament,
  Match,
  Team,
  MatchResult,
  ScoringRulesConfig,
} from "@/types/database";
import { calculateMatchScore, validateMatchResults } from "@/lib/scoring/engine";
import {
  ArrowLeft,
  Save,
  Radio,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Crosshair,
  Sparkles,
  RefreshCw,
  Zap,
  Loader2,
  FileCheck,
  User,
  Users,
  Dices,
  Trash2,
  ArrowUpDown,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableScoreRow {
  teamId: string;
  teamName: string;
  teamShortName: string;
  teamLogo?: string | null;
  seed: number;
  placement: number;
  kills: number;
  bonus: number;
  penalty: number;
  placementPoints: number;
  finishPoints: number;
  totalPoints: number;
  isDirty: boolean;
}

export default function RapidScoreEntryPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const matchId = params.matchId as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [scoringRules, setScoringRules] = useState<ScoringRulesConfig | null>(null);
  const [scoreRows, setScoreRows] = useState<EditableScoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sortByPoints, setSortByPoints] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [originalScores, setOriginalScores] = useState<Record<string, { placement: number; kills: number; total: number }>>({});

  const loadData = useCallback(async () => {
    try {
      const { data: tourney } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournamentId)
        .single();
      setTournament(tourney);

      const { data: matchData } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();
      setMatch(matchData);

      const { data: rules } = await supabase
        .from("scoring_rules")
        .select("*")
        .eq("tournament_id", tournamentId)
        .single();

      const activeRules: ScoringRulesConfig = {
        placement_rules: rules?.placement_rules || {},
        kill_points: Number(rules?.kill_points) || 1,
        win_bonus: Number(rules?.win_bonus) || 0,
        bonus_rules: rules?.bonus_rules || {},
        penalty_rules: rules?.penalty_rules || {},
        tie_breaker_priority: rules?.tie_breaker_priority || [],
      };
      setScoringRules(activeRules);

      const { data: teams } = await supabase
        .from("teams")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("seed", { ascending: true });

      const { data: results } = await supabase
        .from("match_results")
        .select("*")
        .eq("match_id", matchId);

      const resultMap = new Map<string, MatchResult>();
      (results || []).forEach((r) => resultMap.set(r.team_id, r));

      const origMap: Record<string, { placement: number; kills: number; total: number }> = {};

      const rows: EditableScoreRow[] = (teams || []).map((t) => {
        const existing = resultMap.get(t.id);
        const placement = existing ? existing.placement : 0;
        const kills = existing ? existing.kills : 0;
        const bonus = existing ? Number(existing.bonus_points) || 0 : 0;
        const penalty = existing ? Number(existing.penalty_points) || 0 : 0;

        const calc = calculateMatchScore({
          placement,
          kills,
          wins: placement === 1 ? 1 : 0,
          scoringRules: activeRules,
          bonusPoints: bonus,
          penaltyPoints: penalty,
        });

        if (existing) {
          origMap[t.id] = { placement, kills, total: calc.totalPoints };
        }

        return {
          teamId: t.id,
          teamName: t.name,
          teamShortName: t.short_name,
          teamLogo: t.logo_url,
          seed: t.seed,
          placement,
          kills,
          bonus,
          penalty,
          placementPoints: calc.placementPoints,
          finishPoints: calc.finishPoints,
          totalPoints: calc.totalPoints,
          isDirty: false,
        };
      });

      rows.sort((a, b) => {
        if (a.placement > 0 && b.placement > 0) return a.placement - b.placement;
        if (a.placement > 0) return -1;
        if (b.placement > 0) return 1;
        return a.seed - b.seed;
      });

      setScoreRows(rows);
      setOriginalScores(origMap);
    } catch (err) {
      console.error("Score entry loading error:", err);
    } finally {
      setLoading(false);
    }
  }, [tournamentId, matchId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isSolo = tournament?.format === "SOLO";

  const displayedRows = useMemo(() => {
    const list = [...scoreRows];
    if (sortByPoints) {
      return list.sort((a, b) => b.totalPoints - a.totalPoints || a.placement - b.placement);
    }
    return list;
  }, [scoreRows, sortByPoints]);

  const handleFieldChange = (
    teamId: string,
    field: "placement" | "kills" | "bonus" | "penalty",
    value: number
  ) => {
    if (!scoringRules) return;

    setScoreRows((prevRows) => {
      return prevRows.map((row) => {
        if (row.teamId !== teamId) return row;

        const updated = {
          ...row,
          [field]: Math.max(0, value),
          isDirty: true,
        };

        const calc = calculateMatchScore({
          placement: updated.placement,
          kills: updated.kills,
          wins: updated.placement === 1 ? 1 : 0,
          scoringRules,
          bonusPoints: updated.bonus,
          penaltyPoints: updated.penalty,
        });

        updated.placementPoints = calc.placementPoints;
        updated.finishPoints = calc.finishPoints;
        updated.totalPoints = calc.totalPoints;

        return updated;
      });
    });
  };

  const handleAutoFillPlacements = () => {
    if (!scoringRules) return;

    setScoreRows((prev) => {
      const updated = [...prev];
      updated.forEach((row, idx) => {
        const newPlace = idx + 1;
        row.placement = newPlace;
        row.isDirty = true;
        const calc = calculateMatchScore({
          placement: newPlace,
          kills: row.kills,
          wins: newPlace === 1 ? 1 : 0,
          scoringRules,
          bonusPoints: row.bonus,
          penaltyPoints: row.penalty,
        });
        row.placementPoints = calc.placementPoints;
        row.finishPoints = calc.finishPoints;
        row.totalPoints = calc.totalPoints;
      });
      return updated;
    });
  };

  const handleSimulateRandomScores = () => {
    if (!scoringRules) return;

    const n = scoreRows.length;
    const shuffledPlacements = Array.from({ length: n }, (_, i) => i + 1).sort(
      () => Math.random() - 0.5
    );

    setScoreRows((prev) => {
      return prev.map((row, idx) => {
        const place = shuffledPlacements[idx];
        const randomKills = place === 1 ? Math.floor(Math.random() * 8) + 5 : Math.floor(Math.random() * 6);

        const calc = calculateMatchScore({
          placement: place,
          kills: randomKills,
          wins: place === 1 ? 1 : 0,
          scoringRules,
          bonusPoints: 0,
          penaltyPoints: 0,
        });

        return {
          ...row,
          placement: place,
          kills: randomKills,
          placementPoints: calc.placementPoints,
          finishPoints: calc.finishPoints,
          totalPoints: calc.totalPoints,
          isDirty: true,
        };
      });
    });
  };

  const handleClearPlacements = () => {
    if (!scoringRules) return;
    setScoreRows((prev) => {
      return prev.map((row) => ({
        ...row,
        placement: 0,
        kills: 0,
        bonus: 0,
        penalty: 0,
        placementPoints: 0,
        finishPoints: 0,
        totalPoints: 0,
        isDirty: true,
      }));
    });
  };

  const handleSaveResults = async (publish: boolean = false) => {
    if (!scoringRules || !match) return;

    const validation = validateMatchResults(
      scoreRows.map((r) => ({
        team_id: r.teamId,
        placement: r.placement,
        kills: r.kills,
      }))
    );

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      if (!confirm(`Warning: ${validation.errors[0]}. Proceed anyway?`)) {
        return;
      }
    } else {
      setValidationErrors([]);
    }

    try {
      setIsSaving(true);

      for (const row of scoreRows) {
        const { error } = await supabase.from("match_results").upsert(
          {
            match_id: match.id,
            team_id: row.teamId,
            placement: row.placement,
            kills: row.kills,
            wins: row.placement === 1 ? 1 : 0,
            placement_points: row.placementPoints,
            finish_points: row.finishPoints,
            bonus_points: row.bonus,
            penalty_points: row.penalty,
            total_points: row.totalPoints,
          },
          { onConflict: "match_id, team_id" }
        );

        if (error) throw new Error(error.message);

        const orig = originalScores[row.teamId];
        if (!orig || orig.placement !== row.placement || orig.kills !== row.kills) {
          await supabase.from("tournament_audit_logs").insert({
            tournament_id: tournamentId,
            match_id: match.id,
            user_name: "Tournament Admin",
            action: "UPDATE_MATCH_SCORE",
            entity_type: "MATCH_RESULT",
            entity_id: row.teamId,
            old_value: orig ? { placement: orig.placement, kills: orig.kills, total: orig.total } : null,
            new_value: {
              team: row.teamShortName,
              placement: row.placement,
              kills: row.kills,
              total: row.totalPoints,
            },
          });
        }
      }

      const newStatus = publish ? "COMPLETED" : "LIVE";
      await supabase.from("matches").update({
        status: newStatus,
        is_locked: publish,
        completed_at: publish ? new Date().toISOString() : null,
      }).eq("id", match.id);

      setSaveSuccessMessage(
        publish
          ? `🏆 Match ${match.match_number} Published & Broadcast to Live Scorecard!`
          : `✓ Draft scores saved for Match ${match.match_number}`
      );

      setTimeout(() => setSaveSuccessMessage(null), 5000);
      loadData();
    } catch (err: any) {
      console.error("Save scores error:", err);
      alert("Failed to save scores: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Control Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/tournaments/${tournamentId}/matches`}
              className="flex items-center gap-1 text-xs font-bold uppercase text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Matches List</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-black text-blue-600 uppercase">
              {match?.name} ({match?.map_name || "Erangel"})
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-display text-2xl font-black uppercase text-slate-900">
              {isSolo ? "Solo Combatant Score Entry" : "Rapid Score Entry Control Room"}
            </h1>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-600">
              {tournament?.format || "SQUAD"}
            </span>
            {match?.is_locked && (
              <span className="inline-flex items-center gap-1 rounded-md bg-yellow-50 px-2.5 py-0.5 text-xs font-black uppercase text-amber-800 border border-yellow-300">
                <Lock className="h-3 w-3" /> Locked
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setSortByPoints(!sortByPoints)}
            className={cn(
              "flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider transition-all border",
              sortByPoints
                ? "bg-yellow-400 text-slate-950 border-yellow-500 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
            title="Toggle Live Ranking Sort"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>{sortByPoints ? "Sorted by Points" : "Sort by Points"}</span>
          </button>

          <button
            onClick={handleSimulateRandomScores}
            className="flex items-center gap-1.5 rounded-xl border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs font-black uppercase text-amber-800 hover:bg-yellow-100 shadow-sm"
            title="Randomize realistic scores for quick rehearsal testing"
          >
            <Dices className="h-3.5 w-3.5 text-yellow-600" />
            <span>Simulate Rehearsal</span>
          </button>

          <button
            onClick={handleAutoFillPlacements}
            type="button"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-black uppercase text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm"
            title={`Auto-fill sequential placements 1 to ${scoreRows.length}`}
          >
            Auto-Fill 1-{scoreRows.length}
          </button>

          <button
            onClick={handleClearPlacements}
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase text-slate-500 hover:text-red-500 shadow-sm"
            title="Reset all inputs"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => handleSaveResults(false)}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Save className="h-4 w-4 text-slate-500" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSaveResults(true)}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileCheck className="h-4 w-4 text-yellow-300" />
            )}
            <span>Publish & Broadcast Live</span>
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccessMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>{saveSuccessMessage}</span>
          </div>
          <Link
            href={`/tournament/${tournament?.slug}`}
            target="_blank"
            className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs text-emerald-900 underline hover:bg-emerald-200"
          >
            View Live Scorecard &rarr;
          </Link>
        </div>
      )}

      {/* Validation Warnings Banner */}
      {validationErrors.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-800 flex items-center gap-2.5 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>{validationErrors.join(" | ")}</div>
        </div>
      )}

      {/* Main Dense Score Entry Grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-3.5 text-xs">
          <div className="flex items-center gap-3">
            <Crosshair className="h-4 w-4 text-blue-600" />
            <span className="font-display font-black uppercase tracking-wider text-slate-900">
              {match?.name} Score Entry Matrix ({scoreRows.length} {isSolo ? "Combatants" : "Teams"})
            </span>
            <span className="text-slate-500 font-mono">
              • Scoring Rule: {scoringRules?.kill_points} pt/kill
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Keyboard className="h-3.5 w-3.5 text-slate-400" />
            <span>Tip: Press <kbd className="rounded bg-slate-100 px-1.5 py-0.5 border border-slate-300 font-mono text-slate-700">Tab</kbd> to jump rows</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-600">
                <th className="py-3 pl-5 pr-2 text-center w-14"># Seed</th>
                <th className="py-3 px-4">{isSolo ? "Player" : "Team"}</th>
                <th className="py-3 px-3 text-center w-32">Placement</th>
                <th className="py-3 px-3 text-center w-28">Elims/Kills</th>
                <th className="py-3 px-3 text-center hidden md:table-cell">Place Pts</th>
                <th className="py-3 px-3 text-center hidden md:table-cell">Finish Pts</th>
                <th className="py-3 px-3 text-center w-20 hidden lg:table-cell">Bonus</th>
                <th className="py-3 px-3 text-center w-20 hidden lg:table-cell">Penalty</th>
                <th className="py-3 pl-3 pr-6 text-right font-black text-slate-900 w-36">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
              {displayedRows.map((row) => {
                const isWinner = row.placement === 1;

                return (
                  <tr
                    key={row.teamId}
                    className={cn(
                      "transition-colors",
                      isWinner
                        ? "bg-yellow-50/80"
                        : row.isDirty
                        ? "bg-blue-50/40"
                        : "bg-white hover:bg-slate-50"
                    )}
                  >
                    <td className="py-3 pl-5 pr-2 text-center font-mono text-xs text-slate-500">
                      #{row.seed}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 font-display text-xs font-bold text-blue-600">
                          {isSolo ? <User className="h-4 w-4" /> : row.teamShortName.slice(0, 3)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-display font-black text-slate-900 text-sm">
                            {row.teamName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            [{row.teamShortName}]
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={row.placement === 0 ? "" : row.placement}
                        placeholder="Place"
                        onChange={(e) =>
                          handleFieldChange(row.teamId, "placement", Number(e.target.value))
                        }
                        className={cn(
                          "w-24 rounded-lg border py-2 text-center font-display text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm",
                          isWinner
                            ? "border-yellow-400 bg-yellow-100 text-amber-900 font-black shadow-sm"
                            : "border-slate-300 bg-white text-slate-900"
                        )}
                      />
                    </td>

                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={row.kills === 0 ? "" : row.kills}
                        placeholder="0"
                        onChange={(e) =>
                          handleFieldChange(row.teamId, "kills", Number(e.target.value))
                        }
                        className="w-20 rounded-lg border border-slate-300 bg-white py-2 text-center font-mono text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none shadow-sm"
                      />
                    </td>

                    <td className="py-3 px-3 text-center hidden md:table-cell font-mono text-xs text-slate-700">
                      {row.placementPoints}
                    </td>

                    <td className="py-3 px-3 text-center hidden md:table-cell font-mono text-xs text-slate-700">
                      {row.finishPoints}
                    </td>

                    <td className="py-3 px-3 text-center hidden lg:table-cell">
                      <input
                        type="number"
                        min={0}
                        value={row.bonus === 0 ? "" : row.bonus}
                        placeholder="0"
                        onChange={(e) =>
                          handleFieldChange(row.teamId, "bonus", Number(e.target.value))
                        }
                        className="w-16 rounded-lg border border-slate-200 bg-white py-1.5 text-center font-mono text-xs text-emerald-600 focus:outline-none shadow-sm"
                      />
                    </td>

                    <td className="py-3 px-3 text-center hidden lg:table-cell">
                      <input
                        type="number"
                        min={0}
                        value={row.penalty === 0 ? "" : row.penalty}
                        placeholder="0"
                        onChange={(e) =>
                          handleFieldChange(row.teamId, "penalty", Number(e.target.value))
                        }
                        className="w-16 rounded-lg border border-slate-200 bg-white py-1.5 text-center font-mono text-xs text-red-600 focus:outline-none shadow-sm"
                      />
                    </td>

                    <td className="py-3 pl-3 pr-6 text-right">
                      <div className="inline-flex items-center justify-end">
                        <span
                          className={cn(
                            "rounded-xl px-4 py-1.5 font-display text-sm font-black tracking-wider shadow-sm",
                            isWinner
                              ? "bg-yellow-400 text-slate-950 border border-yellow-500 shadow-yellow-400/30"
                              : "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          )}
                        >
                          {row.totalPoints} PTS
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
