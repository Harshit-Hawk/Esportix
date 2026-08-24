"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Tournament, Match } from "@/types/database";
import { getMapsForGame } from "@/lib/game-maps";
import {
  Trophy,
  ArrowLeft,
  Crosshair,
  PlusCircle,
  CheckCircle2,
  Radio,
  Lock,
  Unlock,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Trash2,
  Edit2,
  CalendarPlus,
  Gamepad2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TournamentMatchesAdminPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  // Form State
  const [matchNumber, setMatchNumber] = useState(1);
  const [matchName, setMatchName] = useState("");
  const [mapName, setMapName] = useState("");
  const [customMapInput, setCustomMapInput] = useState("");
  const [roundName, setRoundName] = useState("Grand Finals");

  // Get available maps for the tournament's specific game
  const availableMaps = useMemo(() => {
    return getMapsForGame(tournament?.game?.slug);
  }, [tournament?.game?.slug]);

  const loadData = useCallback(async () => {
    try {
      const { data: tourney } = await supabase
        .from("tournaments")
        .select("*, game:games(*)")
        .eq("id", tournamentId)
        .single();
      setTournament(tourney);

      const defaultGameMap = getMapsForGame(tourney?.game?.slug)[0] || "Default Map";
      setMapName(defaultGameMap);

      const { data: matchesData } = await supabase
        .from("matches")
        .select("*, match_results(*)")
        .eq("tournament_id", tournamentId)
        .order("match_number", { ascending: true });

      if (matchesData) {
        setMatches(matchesData);
        setMatchNumber(matchesData.length + 1);
        setMatchName(`Match ${matchesData.length + 1}`);
      }
    } catch (err) {
      console.error("Error loading matches:", err);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateOrUpdateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalMapName = mapName === "Custom Map" && customMapInput ? customMapInput : mapName;

    try {
      if (editingMatch) {
        const { error } = await supabase
          .from("matches")
          .update({
            match_number: Number(matchNumber),
            name: matchName || `Match ${matchNumber}`,
            map_name: finalMapName,
            round_name: roundName,
          })
          .eq("id", editingMatch.id);

        if (error) throw new Error(error.message);
        setEditingMatch(null);
      } else {
        const { error } = await supabase.from("matches").insert({
          tournament_id: tournamentId,
          match_number: Number(matchNumber),
          name: matchName || `Match ${matchNumber}`,
          map_name: finalMapName,
          round_name: roundName,
          status: "SCHEDULED",
          is_locked: false,
        });

        if (error) throw new Error(error.message);
        setShowAddMatch(false);
      }

      loadData();
    } catch (err: any) {
      alert("Error saving match: " + err.message);
    }
  };

  const handleEditClick = (m: Match) => {
    setEditingMatch(m);
    setMatchNumber(m.match_number);
    setMatchName(m.name);
    setMapName(m.map_name || availableMaps[0]);
    setRoundName(m.round_name || "Round 1");
    setShowAddMatch(true);
  };

  const handleDeleteMatch = async (m: Match) => {
    if (!confirm(`Delete ${m.name}? All recorded scores for this match will be removed.`)) return;
    try {
      const { error } = await supabase.from("matches").delete().eq("id", m.id);
      if (error) throw new Error(error.message);

      await supabase.from("tournament_audit_logs").insert({
        tournament_id: tournamentId,
        user_name: "Admin",
        action: "DELETE_MATCH",
        entity_type: "MATCH",
        entity_id: m.id,
        old_value: { match_number: m.match_number, name: m.name },
      });

      loadData();
    } catch (err: any) {
      alert("Error deleting match: " + err.message);
    }
  };

  const handleToggleLock = async (match: Match) => {
    try {
      const newLockedState = !match.is_locked;
      await supabase
        .from("matches")
        .update({ is_locked: newLockedState })
        .eq("id", match.id);

      await supabase.from("tournament_audit_logs").insert({
        tournament_id: tournamentId,
        match_id: match.id,
        user_name: "Admin",
        action: newLockedState ? "LOCK_MATCH" : "UNLOCK_MATCH",
        entity_type: "MATCH",
        entity_id: match.id,
        new_value: { is_locked: newLockedState, match_number: match.match_number },
      });

      loadData();
    } catch (err: any) {
      alert("Lock toggle error: " + err.message);
    }
  };

  const handleQuickAddNextMatch = async () => {
    try {
      const nextNum = matches.length + 1;
      const defaultMap = availableMaps[(nextNum - 1) % availableMaps.length] || availableMaps[0] || "Arena";

      const { error } = await supabase.from("matches").insert({
        tournament_id: tournamentId,
        match_number: nextNum,
        name: `Match ${nextNum}`,
        map_name: defaultMap,
        round_name: "Grand Finals",
        status: "SCHEDULED",
        is_locked: false,
      });

      if (error) throw new Error(error.message);
      loadData();
    } catch (err: any) {
      alert("Error adding match: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
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
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-display text-2xl font-black uppercase text-white">
              Matches & Dynamic Schedule
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-esports-navy-light px-2.5 py-0.5 text-xs font-bold text-esports-orange border border-esports-navy-border">
              <Gamepad2 className="h-3 w-3" />
              {tournament?.game?.name || "Esports"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleQuickAddNextMatch}
            className="flex items-center gap-1.5 rounded-lg border border-esports-navy-border bg-esports-navy-light px-3.5 py-2 text-xs font-bold uppercase text-esports-cream hover:bg-esports-navy hover:text-white transition-colors"
            title="Instantly schedule the next match for this game"
          >
            <Zap className="h-4 w-4 text-esports-gold" />
            <span>+ Quick Add Match {matches.length + 1}</span>
          </button>

          <button
            onClick={() => {
              setEditingMatch(null);
              setMatchNumber(matches.length + 1);
              setMatchName(`Match ${matches.length + 1}`);
              setMapName(availableMaps[0] || "Map");
              setShowAddMatch(!showAddMatch);
            }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-esports-orange to-orange-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow hover:brightness-110"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Custom Match</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Match Drawer with Game-Filtered Maps */}
      {showAddMatch && (
        <form
          onSubmit={handleCreateOrUpdateMatch}
          className="rounded-xl border border-esports-orange/40 bg-esports-navy-card p-5 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2"
        >
          <div className="font-display text-sm font-black uppercase text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-esports-orange" />
              <span>
                {editingMatch ? `Edit ${editingMatch.name}` : `Schedule Match for ${tournament?.game?.name || "Game"}`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddMatch(false);
                setEditingMatch(null);
              }}
              className="text-xs text-esports-silver hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-esports-silver mb-1">
                Match Number
              </label>
              <input
                type="number"
                min={1}
                value={matchNumber}
                onChange={(e) => setMatchNumber(Number(e.target.value))}
                className="w-full rounded-md border border-esports-navy-border bg-esports-navy-dark px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-esports-silver mb-1">
                Match Name
              </label>
              <input
                type="text"
                value={matchName}
                onChange={(e) => setMatchName(e.target.value)}
                className="w-full rounded-md border border-esports-navy-border bg-esports-navy-dark px-3 py-1.5 text-xs text-white"
              />
            </div>

            {/* Game-Filtered Map Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-esports-silver mb-1 flex items-center justify-between">
                <span>Map Name ({tournament?.game?.name?.split(" ")[0] || "Game"})</span>
              </label>
              <select
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                className="w-full rounded-md border border-esports-navy-border bg-esports-navy-dark px-3 py-1.5 text-xs text-white font-bold focus:border-esports-orange focus:outline-none"
              >
                {availableMaps.map((mapOption) => (
                  <option key={mapOption} value={mapOption}>
                    {mapOption}
                  </option>
                ))}
                <option value="Custom Map">+ Custom Map</option>
              </select>

              {mapName === "Custom Map" && (
                <input
                  type="text"
                  placeholder="Type Custom Map Name..."
                  value={customMapInput}
                  onChange={(e) => setCustomMapInput(e.target.value)}
                  className="mt-2 w-full rounded-md border border-esports-orange bg-esports-navy px-3 py-1 text-xs text-white"
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-esports-silver mb-1">
                Round / Stage
              </label>
              <input
                type="text"
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                className="w-full rounded-md border border-esports-navy-border bg-esports-navy-dark px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowAddMatch(false);
                setEditingMatch(null);
              }}
              className="rounded-md border border-esports-navy-border px-3 py-1.5 text-xs font-bold uppercase text-esports-silver"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-esports-orange px-4 py-1.5 text-xs font-black uppercase text-white shadow"
            >
              {editingMatch ? "Update Match" : "Save Match"}
            </button>
          </div>
        </form>
      )}

      {/* Matches List */}
      {matches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-esports-navy-border bg-esports-navy-card/60 p-12 text-center space-y-4">
          <CalendarPlus className="mx-auto h-12 w-12 text-esports-orange/60" />
          <div className="space-y-1">
            <h3 className="font-display text-lg font-black uppercase text-white">
              No Matches Scheduled Yet
            </h3>
            <p className="text-xs text-esports-silver max-w-md mx-auto">
              Matches are not pre-decided. You can dynamically create Match 1, Match 2, etc. with {tournament?.game?.name || "game"} maps as your tournament unfolds.
            </p>
          </div>
          <button
            onClick={handleQuickAddNextMatch}
            className="inline-flex items-center gap-2 rounded-lg bg-esports-orange px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow hover:brightness-110"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Match 1 ({availableMaps[0] || "Map 1"})</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => {
            const isCompleted = m.status === "COMPLETED";
            const isLive = m.status === "LIVE";
            const resultsCount = m.match_results?.length || 0;

            return (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col justify-between rounded-xl border p-5 shadow-lg transition-all",
                  isLive
                    ? "border-red-500/60 bg-red-500/10 shadow-red-500/10"
                    : isCompleted
                    ? "border-esports-navy-border bg-esports-navy-card"
                    : "border-esports-navy-border/60 bg-esports-navy-card/60"
                )}
              >
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-esports-navy-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-esports-orange font-display text-xs font-black text-white">
                        #{m.match_number}
                      </span>
                      <h3 className="font-display text-base font-black uppercase text-white">
                        {m.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(m)}
                        title="Edit Match"
                        className="text-esports-silver hover:text-white p-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteMatch(m)}
                        title="Delete Match"
                        className="text-esports-silver hover:text-red-400 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      {isLive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase text-white animate-pulse ml-1">
                          <Radio className="h-3 w-3" />
                          LIVE
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ml-1",
                            isCompleted
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-esports-navy-light text-esports-silver"
                          )}
                        >
                          {m.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="py-4 space-y-2 text-xs text-esports-silver">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-esports-orange" />
                        <span>Map:</span>
                      </span>
                      <strong className="text-white font-mono">{m.map_name || availableMaps[0]}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-esports-gold" />
                        <span>Stage:</span>
                      </span>
                      <span className="text-esports-cream">{m.round_name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Scores Recorded:</span>
                      <span className="font-mono text-white font-bold">{resultsCount} Teams</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="border-t border-esports-navy-border/60 pt-3.5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleLock(m)}
                    title={m.is_locked ? "Click to unlock scores for editing" : "Click to lock scores"}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-bold uppercase transition-colors",
                      m.is_locked
                        ? "bg-esports-navy-dark text-esports-gold border border-esports-gold/30 hover:bg-esports-navy-light"
                        : "bg-esports-navy-dark text-esports-silver hover:text-white"
                    )}
                  >
                    {m.is_locked ? (
                      <>
                        <Lock className="h-3.5 w-3.5" />
                        <span>Locked</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-3.5 w-3.5" />
                        <span>Unlocked</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/admin/tournaments/${tournamentId}/matches/${m.id}/score`}
                    className="flex items-center gap-1.5 rounded-md bg-esports-orange px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:brightness-110 active:scale-95"
                  >
                    <Crosshair className="h-3.5 w-3.5" />
                    <span>Enter Scores</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
