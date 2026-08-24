"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Tournament, ScoringRulesConfig, TieBreakerCriterion } from "@/types/database";
import { SCORING_PRESETS } from "@/lib/scoring/presets";
import {
  Sliders,
  ArrowLeft,
  Save,
  Trophy,
  Crosshair,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TournamentScoringAdminPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Scoring Rules Form
  const [killPoints, setKillPoints] = useState(1);
  const [winBonus, setWinBonus] = useState(0);
  const [placementRules, setPlacementRules] = useState<Record<string, number>>({
    "1": 10,
    "2": 6,
    "3": 5,
    "4": 4,
    "5": 3,
    "6": 2,
    "7": 1,
    "8": 1,
    "9": 0,
    "10": 0,
    "11": 0,
    "12": 0,
    "13": 0,
    "14": 0,
    "15": 0,
    "16": 0,
  });

  const [tieBreakers, setTieBreakers] = useState<TieBreakerCriterion[]>([
    "total_points",
    "finish_points",
    "placement_points",
    "wins",
    "total_kills",
    "best_placement",
  ]);

  const loadData = useCallback(async () => {
    try {
      const { data: tourney } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournamentId)
        .single();
      setTournament(tourney);

      const { data: rules } = await supabase
        .from("scoring_rules")
        .select("*")
        .eq("tournament_id", tournamentId)
        .single();

      if (rules) {
        setKillPoints(Number(rules.kill_points) || 1);
        setWinBonus(Number(rules.win_bonus) || 0);
        if (rules.placement_rules) {
          setPlacementRules(rules.placement_rules);
        }
        if (rules.tie_breaker_priority && rules.tie_breaker_priority.length > 0) {
          setTieBreakers(rules.tie_breaker_priority);
        }
      }
    } catch (err) {
      console.error("Error loading scoring rules:", err);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApplyPreset = (presetKey: string) => {
    const p = SCORING_PRESETS[presetKey];
    if (!p) return;
    setPlacementRules(p.rules.placement_rules);
    setKillPoints(p.rules.kill_points);
    setWinBonus(p.rules.win_bonus);
    setTieBreakers(p.rules.tie_breaker_priority);
  };

  const handlePlacementChange = (place: string, points: number) => {
    setPlacementRules((prev) => ({
      ...prev,
      [place]: Math.max(0, points),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase.from("scoring_rules").upsert(
        {
          tournament_id: tournamentId,
          placement_rules: placementRules,
          kill_points: Number(killPoints),
          win_bonus: Number(winBonus),
          bonus_rules: {},
          penalty_rules: {},
          tie_breaker_priority: tieBreakers,
        },
        { onConflict: "tournament_id" }
      );

      if (error) throw new Error(error.message);

      await supabase.from("tournament_audit_logs").insert({
        tournament_id: tournamentId,
        user_name: "Admin",
        action: "UPDATE_SCORING_RULES",
        entity_type: "SCORING_RULES",
        entity_id: tournamentId,
        new_value: { killPoints, winBonus, placementRules },
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert("Error saving rules: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-1 text-xs font-bold uppercase text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Control Room</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-900 uppercase">{tournament?.name}</span>
          </div>
          <h1 className="font-display text-2xl font-black uppercase text-slate-900 mt-1">
            Scoring Rules & Tie-Breakers
          </h1>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4 text-yellow-300" />
          )}
          <span>Save Scoring Rules</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>✓ Scoring rules successfully updated and live recalculations applied!</span>
        </div>
      )}

      {/* Presets Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span>Apply Standard Presets</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(SCORING_PRESETS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold uppercase text-slate-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 shadow-sm"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Grids */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Core Points Config */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="font-display text-base font-black uppercase text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-blue-600" />
            <span>Elimination & Victory Points</span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Points Per Kill / Elim
              </label>
              <input
                type="number"
                min={0}
                value={killPoints}
                onChange={(e) => setKillPoints(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                Extra Win / WWCD Bonus
              </label>
              <input
                type="number"
                min={0}
                value={winBonus}
                onChange={(e) => setWinBonus(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
              Tie-Breaker Priority Chain
            </label>
            <div className="space-y-1.5">
              {tieBreakers.map((t, idx) => (
                <div
                  key={t}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2 text-xs border border-slate-200 text-slate-800"
                >
                  <span className="font-bold">
                    {idx + 1}. {t.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Priority #{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Placement Points Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-display text-base font-black uppercase text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span>Placement Points Scale</span>
          </h2>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 max-h-96 overflow-y-auto pr-1">
            {Object.keys(placementRules)
              .sort((a, b) => Number(a) - Number(b))
              .map((place) => (
                <div
                  key={place}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5"
                >
                  <span className="font-display text-xs font-black text-slate-700">
                    #{place}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={placementRules[place]}
                    onChange={(e) => handlePlacementChange(place, Number(e.target.value))}
                    className="w-14 rounded-lg border border-slate-200 bg-white py-1 text-center font-mono text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
