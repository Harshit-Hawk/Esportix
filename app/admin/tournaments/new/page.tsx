"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Game, TournamentFormat } from "@/types/database";
import { SCORING_PRESETS } from "@/lib/scoring/presets";
import { GameLogo } from "@/components/common/GameLogo";
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
  Zap,
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
      description: "Individual combatants (e.g. 50-100 players). Player name displayed directly on the scoreboard.",
      teamSize: 1,
      icon: User,
      recommendedPreset: "bgmi_solo_50players",
    },
    {
      id: "DUO",
      label: "Duo (2 Players)",
      description: "2 Players per team (e.g. 25 duo pairs competing).",
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
      description: "Standard 4-player starting lineup (BGMI / Free Fire official esports standard).",
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

  const selectedGame = useMemo(() => {
    return games.find((g) => g.id === gameId);
  }, [games, gameId]);

  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(autoSlug);
  };

  const handleGameSelect = (g: Game) => {
    setGameId(g.id);
    if (g.slug === "bgmi") {
      setSelectedPresetKey(format === "SOLO" ? "bgmi_solo_50players" : format === "DUO" ? "bgmi_duo_clash" : "bgmi_official_10pt");
    } else if (g.slug === "free-fire") {
      setSelectedPresetKey(format === "SOLO" ? "free_fire_solo_48" : "free_fire_official");
    } else if (g.slug === "valorant") {
      setFormat("5v5");
      setTeamSize(5);
      setSelectedPresetKey("valorant_tourney");
    } else if (g.slug === "cod-mobile") {
      setSelectedPresetKey("cod_mobile_br");
    } else {
      setSelectedPresetKey("custom_customizable");
    }
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
      alert("Please enter tournament name and select a game.");
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
          logo_url: selectedGame?.logo_url || null,
          banner_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
          custom_colors: { primary: "#00F0FF", accent: "#FF2A85" },
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
    <div className="mx-auto max-w-4xl space-y-6 pb-12 font-chakra">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-400 hover:text-[#00F0FF] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Command Center</span>
        </Link>
      </div>

      <div className="rounded-3xl border-2 border-[#242945] bg-[#11131F] p-6 sm:p-8 shadow-[0_0_40px_rgba(0,240,255,0.08)] retro-grid space-y-8">
        {/* Header Title */}
        <div className="border-b border-[#242945] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00F0FF] to-[#FF2A85] text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-orbitron text-2xl font-black uppercase text-white tracking-tight">
                Launch New Esports Tournament
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your game title, tournament format, and telemetry scoring preset.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Game Title Selection with Game Logos */}
          <div className="space-y-3">
            <label className="block text-xs font-orbitron font-bold uppercase tracking-wider text-[#00F0FF] flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              <span>Step 1: Select Game Arena *</span>
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {games.map((g) => {
                const isSelected = gameId === g.id;

                return (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => handleGameSelect(g)}
                    className={cn(
                      "flex items-center gap-3.5 rounded-2xl border-2 p-4 text-left transition-all group",
                      isSelected
                        ? "border-[#00F0FF] bg-[#16192B] text-white shadow-[0_0_20px_rgba(0,240,255,0.25)]"
                        : "border-[#242945] bg-[#0E101B] text-slate-400 hover:border-slate-500 hover:bg-[#16192B]"
                    )}
                  >
                    <div className="p-1 rounded-xl bg-[#090A10] border border-[#242945]">
                      <GameLogo
                        slug={g.slug}
                        name={g.name}
                        size="md"
                        className="shrink-0"
                      />
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="font-orbitron text-sm font-black uppercase text-white group-hover:text-[#00F0FF] transition-colors truncate">
                          {g.name.split("(")[0].trim()}
                        </span>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-[#00F0FF] shrink-0 ml-1 drop-shadow-[0_0_5px_#00F0FF]" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                        {g.description || g.slug}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Tournament Team Format */}
          <div className="space-y-3 border-t border-[#242945] pt-6">
            <label className="block text-xs font-orbitron font-bold uppercase tracking-wider text-[#00F0FF] flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>Step 2: Select Tournament Format *</span>
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
                      "flex flex-col items-start justify-between rounded-2xl border-2 p-4 text-left transition-all",
                      isSelected
                        ? "border-[#00F0FF] bg-[#16192B] text-white shadow-[0_0_20px_rgba(0,240,255,0.25)]"
                        : "border-[#242945] bg-[#0E101B] text-slate-400 hover:border-slate-500 hover:bg-[#16192B]"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl border",
                          isSelected
                            ? "bg-[#00F0FF] text-slate-950 border-[#00F0FF] shadow-[0_0_10px_#00F0FF]"
                            : "bg-[#11131F] text-slate-400 border-[#242945]"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {isSelected && <CheckCircle className="h-4 w-4 text-[#00F0FF]" />}
                    </div>

                    <div>
                      <span className="font-orbitron text-sm font-black uppercase text-white block">
                        {fmtOption.label}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed block">
                        {fmtOption.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Tournament Name & Slug */}
          <div className="space-y-4 border-t border-[#242945] pt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-orbitron font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Tournament Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyber Clash Pro Championship 2026"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full rounded-2xl border border-[#242945] bg-[#0E101B] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#00F0FF] focus:outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-orbitron font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  URL Slug (Live Hologram Link) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="cyber-clash-pro-2026"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-2xl border border-[#242945] bg-[#0E101B] px-4 py-2.5 text-sm font-mono text-[#00F0FF] placeholder-slate-500 focus:border-[#00F0FF] focus:outline-none shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-orbitron font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Overview & Protocol Details (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Details on prize pool, dates, streaming channels..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-[#242945] bg-[#0E101B] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#00F0FF] focus:outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Step 4: Scoring Rule Preset */}
          <div className="space-y-3 border-t border-[#242945] pt-6">
            <label className="block text-xs font-orbitron font-bold uppercase tracking-wider text-[#FFE600] flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              <span>Step 4: Scoring Rule Preset *</span>
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Object.entries(SCORING_PRESETS).map(([key, item]) => {
                const isSelected = selectedPresetKey === key;

                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setSelectedPresetKey(key)}
                    className={cn(
                      "flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all",
                      isSelected
                        ? "border-[#FFE600] bg-[#16192B] text-white shadow-[0_0_20px_rgba(255,230,0,0.25)]"
                        : "border-[#242945] bg-[#0E101B] text-slate-400 hover:border-slate-500 hover:bg-[#16192B]"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-orbitron text-sm font-black uppercase text-white">
                        {item.name}
                      </span>
                      {isSelected && (
                        <CheckCircle className="h-4 w-4 text-[#FFE600] shrink-0 drop-shadow-[0_0_5px_#FFE600]" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Submission */}
          <div className="flex items-center justify-end gap-3 border-t border-[#242945] pt-6">
            <Link
              href="/admin"
              className="rounded-2xl border border-[#242945] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00F0FF] via-[#FF2A85] to-[#FFE600] px-7 py-3 font-chakra text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Launching Grid...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-slate-950" />
                  <span>Launch & Link Roster</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
