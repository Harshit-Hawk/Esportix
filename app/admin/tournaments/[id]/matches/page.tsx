"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Tournament, Match } from "@/types/database";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TournamentMatchesAdminPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMatch, setShowAddMatch] = useState(false);

  // New Match Form State
  const [matchNumber, setMatchNumber] = useState(1);
  const [matchName, setMatchName] = useState("");
  const [mapName, setMapName] = useState("Erangel");
  const [roundName, setRoundName] = useState("Grand Finals");

  const loadData = useCallback(async () => {
    try {
      const { data: tourney } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournamentId)
        .single();
      setTournament(tourney);

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

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("matches").insert({
        tournament_id: tournamentId,
        match_number: Number(matchNumber),
        name: matchName || `Match ${matchNumber}`,
        map_name: mapName,
        round_name: roundName,
        status: "SCHEDULED",
        is_locked: false,
      });

      if (error) throw new Error(error.message);
      setShowAddMatch(false);
      loadData();
    } catch (err: any) {
      alert("Error adding match: " + err.message);
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
          <h1 className="font-display text-2xl font-black uppercase text-white mt-1">
            Matches & Live Score Entry
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddMatch(!showAddMatch)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-esports-orange to-orange-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow hover:brightness-110"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Match</span>
          </button>
        </div>
      </div>

      {/* Add Match Drawer */}
      {showAddMatch && (
        <form
          onSubmit={handleCreateMatch}
          className="rounded-xl border border-esports-orange/40 bg-esports-navy-card p-5 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2"
        >
          <div className="font-display text-sm font-black uppercase text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-esports-orange" />
            <span>Schedule New Match</span>
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

            <div>
              <label className="block text-[11px] font-bold uppercase text-esports-silver mb-1">
                Map Name
              </label>
              <select
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                className="w-full rounded-md border border-esports-navy-border bg-esports-navy-dark px-3 py-1.5 text-xs text-white"
              >
                <option value="Erangel">Erangel</option>
                <option value="Miramar">Miramar</option>
                <option value="Sanhok">Sanhok</option>
                <option value="Vikendi">Vikendi</option>
                <option value="Ascent">Ascent</option>
                <option value="Bind">Bind</option>
                <option value="Haven">Haven</option>
                <option value="Bermuda">Bermuda</option>
                <option value="Purgatory">Purgatory</option>
                <option value="Kalahari">Kalahari</option>
              </select>
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
              onClick={() => setShowAddMatch(false)}
              className="rounded-md border border-esports-navy-border px-3 py-1.5 text-xs font-bold uppercase text-esports-silver"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-esports-orange px-4 py-1.5 text-xs font-black uppercase text-white shadow"
            >
              Save Match
            </button>
          </div>
        </form>
      )}

      {/* Matches Grid List */}
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

                  <div className="flex items-center gap-2">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase text-white animate-pulse">
                        <Radio className="h-3 w-3" />
                        LIVE
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
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
                    <strong className="text-white font-mono">{m.map_name || "Erangel"}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-esports-gold" />
                      <span>Stage:</span>
                    </span>
                    <span className="text-esports-cream">{m.round_name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Teams Recorded:</span>
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
    </div>
  );
}
