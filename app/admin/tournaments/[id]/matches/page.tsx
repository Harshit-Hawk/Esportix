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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb Header */}
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
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-display text-2xl font-black uppercase text-slate-900">
              Matches & Dynamic Schedule
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600 border border-blue-200">
              <Gamepad2 className="h-3.5 w-3.5" />
              {tournament?.game?.name || "Esports"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleQuickAddNextMatch}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm"
            title="Instantly schedule the next match for this game"
          >
            <Zap className="h-4 w-4 text-yellow-500" />
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
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:brightness-110"
          >
            <PlusCircle className="h-4 w-4 text-yellow-300" />
            <span>Custom Match</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Match Drawer */}
      {showAddMatch && (
        <form
          onSubmit={handleCreateOrUpdateMatch}
          className="rounded-2xl border border-blue-300 bg-white p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2"
        >
          <div className="font-display text-sm font-black uppercase text-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
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
              className="text-xs text-slate-400 hover:text-slate-900"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Match Number
              </label>
              <input
                type="number"
                min={1}
                value={matchNumber}
                onChange={(e) => setMatchNumber(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Match Name
              </label>
              <input
                type="text"
                value={matchName}
                onChange={(e) => setMatchName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
              />
            </div>

            {/* Game-Filtered Map Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1 flex items-center justify-between">
                <span>Map Name ({tournament?.game?.name?.split(" ")[0] || "Game"})</span>
              </label>
              <select
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 font-bold focus:border-blue-500 focus:outline-none"
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
                  className="mt-2 w-full rounded-lg border border-blue-500 bg-blue-50 px-3 py-1.5 text-xs text-slate-900"
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Round / Stage
              </label>
              <input
                type="text"
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
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
              className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold uppercase text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-black uppercase text-white shadow-sm hover:bg-blue-700"
            >
              {editingMatch ? "Update Match" : "Save Match"}
            </button>
          </div>
        </form>
      )}

      {/* Matches List */}
      {matches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-4 shadow-sm">
          <CalendarPlus className="mx-auto h-12 w-12 text-blue-500 mb-2" />
          <div className="space-y-1">
            <h3 className="font-display text-lg font-black uppercase text-slate-900">
              No Matches Scheduled Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Matches are not pre-decided. You can dynamically create Match 1, Match 2, etc. with {tournament?.game?.name || "game"} maps as your tournament unfolds.
            </p>
          </div>
          <button
            onClick={handleQuickAddNextMatch}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4 text-yellow-300" />
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
                  "flex flex-col justify-between rounded-2xl border p-5 shadow-sm transition-all bg-white",
                  isLive
                    ? "border-red-300 bg-red-50/40"
                    : isCompleted
                    ? "border-slate-200"
                    : "border-slate-200 bg-slate-50/50"
                )}
              >
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-display text-xs font-black text-white shadow-sm">
                        #{m.match_number}
                      </span>
                      <h3 className="font-display text-base font-black uppercase text-slate-900">
                        {m.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(m)}
                        title="Edit Match"
                        className="text-slate-400 hover:text-slate-900 p-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteMatch(m)}
                        title="Delete Match"
                        className="text-slate-400 hover:text-red-500 p-1"
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
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {m.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="py-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-blue-600" />
                        <span>Map:</span>
                      </span>
                      <strong className="text-slate-900 font-mono">{m.map_name || availableMaps[0]}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-yellow-600" />
                        <span>Stage:</span>
                      </span>
                      <span className="text-slate-800 font-semibold">{m.round_name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Scores Recorded:</span>
                      <span className="font-mono text-slate-900 font-bold">{resultsCount} Teams</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleLock(m)}
                    title={m.is_locked ? "Click to unlock scores for editing" : "Click to lock scores"}
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-black uppercase transition-colors",
                      m.is_locked
                        ? "bg-yellow-100 text-amber-900 border border-yellow-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-sm hover:bg-blue-700 active:scale-95"
                  >
                    <Crosshair className="h-3.5 w-3.5 text-yellow-300" />
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
