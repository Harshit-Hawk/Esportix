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
  Lock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileCheck,
  User,
  ArrowUpDown,
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
      }

      const newStatus = publish ? "COMPLETED" : "LIVE";
      await supabase.from("matches").update({
        status: newStatus,
        is_locked: publish,
        completed_at: publish ? new Date().toISOString() : null,
      }).eq("id", match.id);

      setSaveSuccessMessage(
        publish
          ? `Match ${match.match_number} published successfully.`
          : `Draft saved for Match ${match.match_number}.`
      );

      setTimeout(() => setSaveSuccessMessage(null), 4000);
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
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link
              href={`/admin/tournaments/${tournamentId}/matches`}
              className="hover:text-slate-900 font-medium"
            >
              &larr; Matches
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900">{match?.name}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl mt-1">
            Score Entry — {match?.name} ({match?.map_name})
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSortByPoints(!sortByPoints)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors",
              sortByPoints
                ? "bg-slate-900 text-white border-slate-900"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            <ArrowUpDown className="h-3 w-3 inline mr-1" />
            <span>Sort by Points</span>
          </button>

          <button
            onClick={handleAutoFillPlacements}
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Auto 1-{scoreRows.length}
          </button>

          <button
            onClick={() => handleSaveResults(false)}
            disabled={isSaving}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Save Draft
          </button>

          <button
            onClick={() => handleSaveResults(true)}
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSaving ? "Saving..." : "Publish Scores"}
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccessMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{saveSuccessMessage}</span>
          </div>
          <Link
            href={`/tournament/${tournament?.slug}`}
            target="_blank"
            className="text-emerald-900 underline hover:text-emerald-950 font-semibold"
          >
            View Public Board &rarr;
          </Link>
        </div>
      )}

      {/* Validation Warnings */}
      {validationErrors.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <div>{validationErrors.join(" | ")}</div>
        </div>
      )}

      {/* Score Entry Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                <th className="py-2.5 pl-4 pr-2 text-center w-12">#</th>
                <th className="py-2.5 px-3">{isSolo ? "Player" : "Team"}</th>
                <th className="py-2.5 px-3 text-center w-28">Placement</th>
                <th className="py-2.5 px-3 text-center w-24">Eliminations</th>
                <th className="py-2.5 px-3 text-center hidden md:table-cell">Place Pts</th>
                <th className="py-2.5 px-3 text-center hidden md:table-cell">Kill Pts</th>
                <th className="py-2.5 pl-3 pr-5 text-right font-bold text-slate-900 w-32">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {displayedRows.map((row) => {
                const isWinner = row.placement === 1;

                return (
                  <tr
                    key={row.teamId}
                    className={cn(
                      "hover:bg-slate-50 transition-colors",
                      isWinner ? "bg-amber-50/40" : row.isDirty ? "bg-blue-50/20" : "bg-white"
                    )}
                  >
                    <td className="py-2.5 pl-4 pr-2 text-center font-mono text-slate-500">
                      {row.seed}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {row.teamName}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          [{row.teamShortName}]
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={row.placement === 0 ? "" : row.placement}
                        placeholder="—"
                        onChange={(e) =>
                          handleFieldChange(row.teamId, "placement", Number(e.target.value))
                        }
                        className={cn(
                          "w-20 rounded border py-1 text-center font-mono font-semibold focus:border-blue-600 focus:outline-none",
                          isWinner
                            ? "border-amber-400 bg-amber-50 text-amber-900 font-bold"
                            : "border-slate-200 bg-white text-slate-900"
                        )}
                      />
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={row.kills === 0 ? "" : row.kills}
                        placeholder="0"
                        onChange={(e) =>
                          handleFieldChange(row.teamId, "kills", Number(e.target.value))
                        }
                        className="w-16 rounded border border-slate-200 bg-white py-1 text-center font-mono font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-center hidden md:table-cell font-mono text-slate-600">
                      {row.placementPoints}
                    </td>

                    <td className="py-2.5 px-3 text-center hidden md:table-cell font-mono text-slate-600">
                      {row.finishPoints}
                    </td>

                    <td className="py-2.5 pl-3 pr-5 text-right font-mono">
                      <span
                        className={cn(
                          "inline-block rounded px-2 py-0.5 font-bold tabular-nums text-xs",
                          isWinner
                            ? "bg-amber-100 text-amber-900"
                            : "bg-slate-100 text-slate-900"
                        )}
                      >
                        {row.totalPoints} pts
                      </span>
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
