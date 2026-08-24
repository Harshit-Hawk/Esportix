"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Game, TournamentFormat } from "@/types/database";
import { SCORING_PRESETS } from "@/lib/scoring/presets";
import {
  Trophy,
  ArrowLeft,
  Gamepad2,
  Sliders,
  CheckCircle,
  Loader2,
  Sparkles,
  User,
  Users,
  Shield,
  Crosshair,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CreateTournamentPage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [gameId, setGameId] = useState("");
  const [format, setFormat] = useState<TournamentFormat>("SQUAD");
  const [teamSize, setTeamSize] = useState(4);
  const [selectedPresetKey, setSelectedPresetKey] = useState("bgmi_official_10pt");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("UPCOMING");
  const [visibility, setVisibility] = useState("PUBLIC");

  const FORMAT_OPTIONS: {
    id: TournamentFormat;
    label: string;
    description: string;
    teamSize: number;
    icon: any;
    recommendedPreset: string;
  }[] = [
    {
      id: "SOLO",
      label: "Solo (1v1 / 1-Player)",
      description: "Individual combatants (e.g. 50-100 players). Player name directly displayed in scoreboard.",
      teamSize: 1,
      icon: User,
      recommendedPreset: "bgmi_solo_50players",
    },
    {
      id: "DUO",
      label: "Duo (2 Players)",
      description: "2 Players per team (e.g. 25-50 duo pairs).",
      teamSize: 2,
      icon: Users,
      recommendedPreset: "bgmi_duo_clash",
    },
    {
      id: "TRIO",
      label: "Trio (3 Players)",
      description: "3 Players per squad (Apex / Fortnite / Custom Battle Royale).",
      teamSize: 3,
      icon: Shield,
      recommendedPreset: "custom_customizable",
    },
    {
      id: "SQUAD",
      label: "Squad (4 Players)",
      description: "Standard 4-player starting lineup + 1 substitute (BGMI / Free Fire official standard).",
      teamSize: 4,
      icon: Layers,
      recommendedPreset: "bgmi_official_10pt",
    },
    {
      id: "5v5",
      label: "5v5 Tactical FPS",
      description: "5 Players per squad (Valorant / CS:GO / Tactical Multiplayer).",
      teamSize: 5,
      icon: Crosshair,
      recommendedPreset: "valorant_tourney",
    },
  ];

  useEffect(() => {
    async function loadGames() {
      const { data } = await supabase.from("games").select("*");
      if (data && data.length > 0) {
        setGames(data);
        setGameId(data[0].id);
      }
    }
    loadGames();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(autoSlug);
  };

  const handleFormatSelect = (fmtOption: typeof FORMAT_OPTIONS[0]) => {
    setFormat(fmtOption.id);
    setTeamSize(fmtOption.teamSize);
    if (SCORING_PRESETS[fmtOption.recommendedPreset]) {
      setSelectedPresetKey(fmtOption.recommendedPreset);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !gameId) {
      alert("Please fill in the tournament name and select a game.");
      return;
    }

    try {
      setLoading(true);

      const { data: tourney, error: tErr } = await supabase
        .from("tournaments")
        .insert({
          name,
          slug,
          game_id: gameId,
          description,
          status,
          visibility,
          format,
          team_size: teamSize,
          logo_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=256&auto=format&fit=crop&q=80",
          banner_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
          custom_colors: { primary: "#0066FF", accent: "#FFDE00" },
        })
        .select()
        .single();

      if (tErr) throw new Error(tErr.message);

      const preset = SCORING_PRESETS[selectedPresetKey] || SCORING_PRESETS.bgmi_official_10pt;
      await supabase.from("scoring_rules").insert({
        tournament_id: tourney.id,
        placement_rules: preset.rules.placement_rules,
        kill_points: preset.rules.kill_points,
        win_bonus: preset.rules.win_bonus,
        bonus_rules: {},
        penalty_rules: {},
        tie_breaker_priority: preset.rules.tie_breaker_priority,
      });

      await supabase.from("tournament_audit_logs").insert({
        tournament_id: tourney.id,
        user_name: "Super Admin",
        action: "CREATE_TOURNAMENT",
        entity_type: "TOURNAMENT",
        entity_id: tourney.id,
        new_value: { name, slug, format, teamSize, preset: preset.name },
      });

      router.push(`/admin/tournaments/${tourney.id}/teams`);
    } catch (err: any) {
      console.error("Create tournament error:", err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Control Room</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-blue-600" />
            <h1 className="font-display text-2xl font-black uppercase text-slate-900">
              Create New Esports Tournament
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure tournament format (Solo, Duo, Squad, 5v5), game title, and scoring presets.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tournament Format Selection */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>Select Tournament Team Format *</span>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {FORMAT_OPTIONS.map((fmtOption) => {
                const Icon = fmtOption.icon;
                const isSelected = format === fmtOption.id;

                return (
                  <button
                    type="button"
                    key={fmtOption.id}
                    onClick={() => handleFormatSelect(fmtOption)}
                    className={cn(
                      "flex flex-col items-start justify-between rounded-xl border p-3.5 text-left transition-all",
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-slate-900 shadow-md shadow-blue-500/10"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg border",
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {isSelected && <CheckCircle className="h-4 w-4 text-blue-600" />}
                    </div>

                    <div>
                      <span className="font-display text-sm font-black uppercase text-slate-900 block">
                        {fmtOption.label}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1 line-clamp-2 block leading-relaxed">
                        {fmtOption.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tournament Name & Slug */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                Tournament Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Free Fire All-Stars Solo Showdown 2026"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                URL Slug *
              </label>
              <input
                type="text"
                required
                placeholder="free-fire-solo-showdown-2026"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-mono text-blue-600 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              />
            </div>
          </div>

          {/* Game Selection */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <Gamepad2 className="h-4 w-4 text-blue-600" />
              <span>Select Game Title *</span>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {games.map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setGameId(g.id)}
                  className={cn(
                    "flex flex-col items-start rounded-xl border p-3.5 text-left transition-all",
                    gameId === g.id
                      ? "border-blue-600 bg-blue-50 text-slate-900 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <span className="font-display text-sm font-black uppercase text-slate-900">
                    {g.name}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {g.description || g.slug}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scoring Preset Selection */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-yellow-500" />
              <span>Scoring Rule Preset *</span>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Object.entries(SCORING_PRESETS).map(([key, item]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setSelectedPresetKey(key)}
                  className={cn(
                    "flex flex-col items-start rounded-xl border p-3.5 text-left transition-all",
                    selectedPresetKey === key
                      ? "border-yellow-400 bg-yellow-50 text-slate-900 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-display text-sm font-black uppercase text-slate-900">
                      {item.name}
                    </span>
                    {selectedPresetKey === key && (
                      <CheckCircle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1">
                    {item.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
              Tournament Overview / Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide event details, schedule dates, prize pool, or streaming links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>

          {/* Status & Visibility */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-sm"
              >
                <option value="UPCOMING">UPCOMING</option>
                <option value="LIVE">LIVE NOW</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-sm"
              >
                <option value="PUBLIC">PUBLIC (Listed)</option>
                <option value="UNLISTED">UNLISTED (Direct Link Only)</option>
                <option value="PRIVATE">PRIVATE (Admin Only)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Link
              href="/admin"
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:brightness-110 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Tournament...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span>Create & Add Teams</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
