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
        if (rules.placement_rules) setPlacementRules(rules.placement_rules);
        if (rules.tie_breaker_priority) setTieBreakers(rules.tie_breaker_priority);
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
    const preset = SCORING_PRESETS[presetKey];
    if (preset) {
      setPlacementRules(preset.rules.placement_rules);
      setKillPoints(preset.rules.kill_points);
      setWinBonus(preset.rules.win_bonus);
      setTieBreakers(preset.rules.tie_breaker_priority);
    }
  };

  const handlePlacementChange = (place: string, pts: number) => {
    setPlacementRules((prev) => ({
      ...prev,
      [place]: Math.max(0, pts),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await supabase.from("scoring_rules").upsert(
        {
          tournament_id: tournamentId,
          placement_rules: placementRules,
          kill_points: killPoints,
          win_bonus: winBonus,
          tie_breaker_priority: tieBreakers,
        },
        { onConflict: "tournament_id" }
      );

      await supabase.from("tournament_audit_logs").insert({
        tournament_id: tournamentId,
        user_name: "Admin",
        action: "UPDATE_SCORING_RULES",
        entity_type: "SCORING_RULES",
        new_value: { killPoints, winBonus, tieBreakers },
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
      {/* Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-esports-navy-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-1 text-xs font-bold uppercase text-esports-silver hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Control Room</span>
            </Link>
            <span className="text-esports-navy-border">/</span>
            <span className="text-xs font-bold text-white uppercase">{tournament?.name}</span>
          </div>
          <h1 className="font-display text-2xl font-black uppercase text-white mt-1">
            Tournament Scoring System Config
          </h1>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-esports-orange to-orange-600 px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow hover:brightness-110 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Scoring Rules</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>✓ Scoring rules saved and live leaderboard recalculation updated!</span>
        </div>
      )}

      {/* Preset Quick Loader */}
      <div className="rounded-xl border border-esports-navy-border bg-esports-navy-card p-5 shadow-lg space-y-3">
        <h3 className="font-display text-sm font-black uppercase text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-esports-gold" />
          <span>Load Standard Esports Presets</span>
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(SCORING_PRESETS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              className="rounded-lg border border-esports-navy-border bg-esports-navy-dark px-3 py-2 text-left text-xs font-bold text-esports-silver hover:border-esports-orange hover:text-white transition-all"
            >
              <div className="text-white font-display uppercase">{item.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Placement Points Grid */}
        <div className="rounded-xl border border-esports-navy-border bg-esports-navy-card p-6 shadow-xl space-y-4">
          <h3 className="font-display text-base font-black uppercase text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-esports-gold" />
            <span>Placement Points (Ranks 1 - 16)</span>
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {Array.from({ length: 16 }, (_, i) => (i + 1).toString()).map((place) => (
              <div
                key={place}
                className="flex items-center justify-between rounded-lg bg-esports-navy-dark px-3 py-2 border border-esports-navy-border"
              >
                <span className="font-bold text-esports-silver">Rank #{place}</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    value={placementRules[place] !== undefined ? placementRules[place] : 0}
                    onChange={(e) => handlePlacementChange(place, Number(e.target.value))}
                    className="w-14 rounded border border-esports-navy-border bg-esports-navy py-1 text-center font-display font-black text-esports-gold"
                  />
                  <span className="text-[10px] text-esports-silver">PTS</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multipliers & Tie-Breakers */}
        <div className="space-y-6">
          {/* Kill Points Multiplier */}
          <div className="rounded-xl border border-esports-navy-border bg-esports-navy-card p-6 shadow-xl space-y-4">
            <h3 className="font-display text-base font-black uppercase text-white flex items-center gap-2">
              <Crosshair className="h-5 w-5 text-esports-orange" />
              <span>Kill / Elimination Points Multiplier</span>
            </h3>
            <div className="flex items-center justify-between rounded-lg bg-esports-navy-dark p-4 border border-esports-navy-border">
              <span className="text-xs text-esports-silver">Points per kill confirmed:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={killPoints}
                  onChange={(e) => setKillPoints(Number(e.target.value))}
                  className="w-20 rounded-md border border-esports-navy-border bg-esports-navy px-3 py-1.5 text-center font-display text-lg font-black text-esports-orange"
                />
                <span className="text-xs font-bold text-esports-silver">PT / KILL</span>
              </div>
            </div>
          </div>

          {/* Tie-Breaker Priority */}
          <div className="rounded-xl border border-esports-navy-border bg-esports-navy-card p-6 shadow-xl space-y-4">
            <h3 className="font-display text-base font-black uppercase text-white flex items-center gap-2">
              <Sliders className="h-5 w-5 text-esports-silver" />
              <span>Tie-Breaking Priority Sequence</span>
            </h3>
            <p className="text-xs text-esports-silver">
              When teams have equal overall points, rank is determined using this order:
            </p>
            <ol className="space-y-2 text-xs">
              {tieBreakers.map((crit, idx) => (
                <li
                  key={crit}
                  className="flex items-center gap-3 rounded-lg bg-esports-navy-dark px-3 py-2 border border-esports-navy-border"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-esports-orange text-[10px] font-black text-white">
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
    </div>
  );
}
