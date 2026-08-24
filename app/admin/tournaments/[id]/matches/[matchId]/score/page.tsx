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
          ? `✓ Match ${match.match_number} Published & Broadcast to Live Scorecard!`
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-esports-navy-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/tournaments/${tournamentId}/matches`}
              className="flex items-center gap-1 text-xs font-bold uppercase text-esports-silver hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Matches List</span>
            </Link>
            <span className="text-esports-navy-border">/</span>
            <span className="text-xs font-bold text-esports-orange uppercase">
              {match?.name} ({match?.map_name || "Erangel"})
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-display text-2xl font-black uppercase text-white">
              {isSolo ? "Solo Combatant Score Entry" : "Rapid Score Entry Control Room"}
            </h1>
            <span className="rounded-full bg-esports-orange/20 border border-esports-orange/40 px-2.5 py-0.5 text-[10px] font-black uppercase text-esports-orange">
              {tournament?.format || "SQUAD"}
            </span>
            {match?.is_locked && (
              <span className="inline-flex items-center gap-1 rounded-md bg-esports-navy-light px-2.5 py-0.5 text-xs font-black uppercase text-esports-gold border border-esports-gold/30">
                <Lock className="h-3 w-3" /> Locked
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAutoFillPlacements}
            type="button"
            className="rounded-lg border border-esports-navy-border bg-esports-navy-light px-3 py-2 text-xs font-bold uppercase text-esports-cream hover:bg-esports-navy hover:text-white"
            title={`Auto-fill sequential placements 1 to ${scoreRows.length}`}
          >
            Auto-Fill 1-{scoreRows.length}
          </button>

          <button
            onClick={() => handleSaveResults(false)}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg border border-esports-navy-border bg-esports-navy-light px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-esports-navy shadow"
          >
            <Save className="h-4 w-4 text-esports-silver" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSaveResults(true)}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-esports-orange to-orange-600 px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-esports-orange/20 hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileCheck className="h-4 w-4" />
            )}
            <span>Publish & Broadcast Live</span>
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccessMessage && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{saveSuccessMessage}</span>
          </div>
          <Link
            href={`/tournament/${tournament?.slug}`}
            target="_blank"
            className="underline hover:text-white"
          >
            Open Live Scorecard &rarr;
          </Link>
        </div>
      )}

      {/* Validation Warnings Banner */}
      {validationErrors.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs font-bold text-amber-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <div>{validationErrors.join(" | ")}</div>
        </div>
      )}

      {/* Main Dense Score Entry Grid */}
      <div className="overflow-hidden rounded-xl border border-esports-navy-border bg-esports-navy-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-esports-navy-border bg-gradient-to-r from-esports-navy to-esports-navy-light px-5 py-3 text-xs">
          <div className="flex items-center gap-3">
            <Crosshair className="h-4 w-4 text-esports-orange" />
            <span className="font-display font-black uppercase tracking-wider text-white">
              {match?.name} Score Entry ({scoreRows.length} {isSolo ? "Combatants" : "Teams"})
            </span>
            <span className="text-esports-silver font-mono">
              • Rule: {scoringRules?.kill_points} pt/kill
            </span>
          </div>
          <div className="text-esports-silver text-[11px]">
            Tip: Press <kbd className="rounded bg-esports-navy-dark px-1.5 py-0.5 border border-esports-navy-border font-mono text-white">Tab</kbd> to advance rows
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-esports-navy-border bg-esports-navy-dark text-[11px] font-black uppercase tracking-wider text-esports-silver">
                <th className="py-3 pl-4 pr-2 text-center w-12"># Seed</th>
                <th className="py-3 px-3">{isSolo ? "Player" : "Team"}</th>
                <th className="py-3 px-3 text-center w-28">Placement</th>
                <th className="py-3 px-3 text-center w-24">Elims/Kills</th>
                <th className="py-3 px-3 text-center hidden md:table-cell">Place Pts</th>
                <th className="py-3 px-3 text-center hidden md:table-cell">Finish Pts</th>
                <th className="py-3 px-3 text-center w-20 hidden lg:table-cell">Bonus</th>
                <th className="py-3 px-3 text-center w-20 hidden lg:table-cell">Penalty</th>
                <th className="py-3 pl-3 pr-6 text-right font-black text-white w-32">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-esports-navy-border/40 text-xs font-semibold">
              {scoreRows.map((row) => {
                const isWinner = row.placement === 1;

                return (
                  <tr
                    key={row.teamId}
                    className={cn(
                      "transition-colors",
                      isWinner
                        ? "bg-amber-500/10"
                        : row.isDirty
                        ? "bg-esports-orange/5"
                        : "bg-esports-navy-card hover:bg-esports-navy-light/40"
                    )}
                  >
                    <td className="py-2.5 pl-4 pr-2 text-center font-mono text-xs text-esports-silver">
                      #{row.seed}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-esports-navy-dark border border-esports-navy-border font-display text-[10px] font-bold text-esports-orange">
                          {isSolo ? <User className="h-3.5 w-3.5" /> : row.teamShortName.slice(0, 3)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-display font-black text-white text-sm">
                            {row.teamName}
                          </span>
                          <span className="text-[10px] text-esports-silver font-mono">
                            [{row.teamShortName}]
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
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
                          "w-20 rounded-md border py-1.5 text-center font-display text-sm font-black text-white focus:outline-none focus:ring-1 focus:ring-esports-orange",
                          isWinner
                            ? "border-amber-400 bg-amber-500/20 text-amber-300"
                            : "border-esports-navy-border bg-esports-navy-dark"
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
                        className="w-16 rounded-md border border-esports-navy-border bg-esports-navy-dark py-1.5 text-center font-mono text-sm font-bold text-white focus:border-esports-orange focus:outline-none"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-center hidden md:table-cell font-mono text-xs text-esports-cream">
                      {row.placementPoints}
                    </td>

                    <td className="py-2.5 px-3 text-center hidden md:table-cell font-mono text-xs text-esports-cream">
                      {row.finishPoints}
                    </td>

                    <td className="py-2.5 px-3 text-center hidden lg:table-cell">
                      <input
                        type="number"
                        min={0}
                        value={row.bonus === 0 ? "" : row.bonus}
                        placeholder="0"
                        onChange={(e) =>
                          handleFieldChange(row.teamId, "bonus", Number(e.target.value))
                        }
                        className="w-14 rounded-md border border-esports-navy-border bg-esports-navy-dark py-1 text-center font-mono text-xs text-emerald-400 focus:outline-none"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-center hidden lg:table-cell">
                      <input
                        type="number"
                        min={0}
                        value={row.penalty === 0 ? "" : row.penalty}
                        placeholder="0"
                        onChange={(e) =>
                          handleFieldChange(row.teamId, "penalty", Number(e.target.value))
                        }
                        className="w-14 rounded-md border border-esports-navy-border bg-esports-navy-dark py-1 text-center font-mono text-xs text-red-400 focus:outline-none"
                      />
                    </td>

                    <td className="py-2.5 pl-3 pr-6 text-right">
                      <div className="inline-flex items-center justify-end">
                        <span
                          className={cn(
                            "rounded-md px-3 py-1 font-display text-sm font-black tracking-wider",
                            isWinner
                              ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/30"
                              : "bg-esports-navy-light text-esports-orange border border-esports-navy-border"
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
