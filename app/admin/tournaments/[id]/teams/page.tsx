"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Tournament, Team, Player, TournamentFormat } from "@/types/database";
import {
  Users,
  User,
  ArrowLeft,
  PlusCircle,
  Trash2,
  Edit2,
  Shield,
  UserPlus,
  Sparkles,
  Save,
  CheckCircle,
  Gamepad2,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TournamentTeamsAdminPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<(Team & { players?: Player[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTeam, setShowAddTeam] = useState(false);

  // Standard Team Form State
  const [teamName, setTeamName] = useState("");
  const [shortName, setShortName] = useState("");
  const [seed, setSeed] = useState(1);
  const [groupName, setGroupName] = useState("Group A");

  // Solo Participant Form State
  const [soloPlayerName, setSoloPlayerName] = useState("");
  const [soloPlayerIgn, setSoloPlayerIgn] = useState("");

  // Duo Form State
  const [duoPlayer1Name, setDuoPlayer1Name] = useState("");
  const [duoPlayer1Ign, setDuoPlayer1Ign] = useState("");
  const [duoPlayer2Name, setDuoPlayer2Name] = useState("");
  const [duoPlayer2Ign, setDuoPlayer2Ign] = useState("");

  // Inline Add Player
  const [activeTeamForPlayer, setActiveTeamForPlayer] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerIgn, setPlayerIgn] = useState("");

  const loadData = useCallback(async () => {
    try {
      const { data: tourney } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournamentId)
        .single();
      setTournament(tourney);

      const { data: teamsData } = await supabase
        .from("teams")
        .select("*, players(*)")
        .eq("tournament_id", tournamentId)
        .order("seed", { ascending: true });

      setTeams(teamsData || []);
      setSeed((teamsData?.length || 0) + 1);
    } catch (err) {
      console.error("Error loading teams:", err);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isSolo = tournament?.format === "SOLO";
  const isDuo = tournament?.format === "DUO";

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSolo) {
        if (!soloPlayerName || !soloPlayerIgn) {
          alert("Please enter both Player In-Game Name (IGN) and In-Game ID.");
          return;
        }

        const tag = soloPlayerIgn.trim();
        const { data: createdTeam, error: tmErr } = await supabase
          .from("teams")
          .insert({
            tournament_id: tournamentId,
            name: soloPlayerName.trim(),
            short_name: tag,
            seed: Number(seed),
            group_name: groupName,
            logo_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=128&auto=format&fit=crop&q=80",
          })
          .select()
          .single();

        if (tmErr) throw new Error(tmErr.message);

        await supabase.from("players").insert({
          team_id: createdTeam.id,
          name: soloPlayerName,
          player_identifier: soloPlayerIgn,
        });

        setSoloPlayerName("");
        setSoloPlayerIgn("");
      } else if (isDuo) {
        const dName = teamName || `${duoPlayer1Ign} & ${duoPlayer2Ign}`;
        const dTag = shortName || dName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase();

        const { data: createdTeam, error: tmErr } = await supabase
          .from("teams")
          .insert({
            tournament_id: tournamentId,
            name: dName,
            short_name: dTag,
            seed: Number(seed),
            group_name: groupName,
          })
          .select()
          .single();

        if (tmErr) throw new Error(tmErr.message);

        if (duoPlayer1Name || duoPlayer1Ign) {
          await supabase.from("players").insert({
            team_id: createdTeam.id,
            name: duoPlayer1Name || duoPlayer1Ign,
            player_identifier: duoPlayer1Ign || duoPlayer1Name,
          });
        }
        if (duoPlayer2Name || duoPlayer2Ign) {
          await supabase.from("players").insert({
            team_id: createdTeam.id,
            name: duoPlayer2Name || duoPlayer2Ign,
            player_identifier: duoPlayer2Ign || duoPlayer2Name,
          });
        }

        setTeamName("");
        setShortName("");
        setDuoPlayer1Name("");
        setDuoPlayer1Ign("");
        setDuoPlayer2Name("");
        setDuoPlayer2Ign("");
      } else {
        const { error } = await supabase.from("teams").insert({
          tournament_id: tournamentId,
          name: teamName,
          short_name: shortName.toUpperCase(),
          seed: Number(seed),
          group_name: groupName,
          logo_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=128&auto=format&fit=crop&q=80",
        });

        if (error) throw new Error(error.message);
        setTeamName("");
        setShortName("");
      }

      setShowAddTeam(false);
      loadData();
    } catch (err: any) {
      alert("Error adding team: " + err.message);
    }
  };

  const handleAddPlayer = async (teamId: string) => {
    if (!playerName) return;
    try {
      await supabase.from("players").insert({
        team_id: teamId,
        name: playerName,
        player_identifier: playerIgn || playerName,
      });

      setPlayerName("");
      setPlayerIgn("");
      setActiveTeamForPlayer(null);
      loadData();
    } catch (err: any) {
      alert("Error adding player: " + err.message);
    }
  };

  const handleDeleteTeam = async (teamId: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await supabase.from("teams").delete().eq("id", teamId);
      loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
      await supabase.from("players").delete().eq("id", playerId);
      loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
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
          <div className="flex items-center gap-2 mt-1">
            <h1 className="font-display text-2xl font-black uppercase text-slate-900">
              {isSolo ? "Solo Participants Roster" : isDuo ? "Duo Teams Roster" : "Teams & Lineup Management"}
            </h1>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-600">
              {tournament?.format || "SQUAD"} FORMAT
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddTeam(!showAddTeam)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:brightness-110"
          >
            <PlusCircle className="h-4 w-4 text-yellow-300" />
            <span>{isSolo ? "Add Solo Player" : isDuo ? "Add Duo Team" : "Add Squad"}</span>
          </button>
        </div>
      </div>

      {/* Add Drawer */}
      {showAddTeam && (
        <form
          onSubmit={handleCreateTeam}
          className="rounded-2xl border border-blue-300 bg-white p-5 shadow-lg space-y-4 animate-in fade-in"
        >
          <div className="font-display text-sm font-black uppercase text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span>
              {isSolo ? "Register Solo Combatant" : isDuo ? "Register Duo Pair" : "Add Competing Squad"}
            </span>
          </div>

          {isSolo ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Player Real Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={soloPlayerName}
                  onChange={(e) => setSoloPlayerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  In-Game ID / IGN *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ShadowViper"
                  value={soloPlayerIgn}
                  onChange={(e) => setSoloPlayerIgn(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Seed Number
                </label>
                <input
                  type="number"
                  min={1}
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Group
                </label>
                <select
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
                >
                  <option value="Group A">Group A</option>
                  <option value="Group B">Group B</option>
                  <option value="Overall">Overall</option>
                </select>
              </div>
            </div>
          ) : isDuo ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Duo Team Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dynamic Duo"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Player 1 (Name / IGN) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Player 1 IGN"
                  value={duoPlayer1Ign}
                  onChange={(e) => setDuoPlayer1Ign(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Player 2 (Name / IGN) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Player 2 IGN"
                  value={duoPlayer2Ign}
                  onChange={(e) => setDuoPlayer2Ign(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Predators"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Short Tag (3-5 chars) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="APEX"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Seed Number
                </label>
                <input
                  type="number"
                  min={1}
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Group
                </label>
                <select
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
                >
                  <option value="Group A">Group A</option>
                  <option value="Group B">Group B</option>
                  <option value="Overall">Overall</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddTeam(false)}
              className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold uppercase text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-black uppercase text-white shadow-sm hover:bg-blue-700"
            >
              Save {isSolo ? "Player" : "Team"}
            </button>
          </div>
        </form>
      )}

      {/* Grid of Teams / Players */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 font-display text-xs font-black text-blue-600">
                    {isSolo ? (
                      <User className="h-4 w-4" />
                    ) : (
                      team.short_name.slice(0, 3)
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-black uppercase text-slate-900">
                      {team.name}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      [{team.short_name}] • {team.group_name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-black text-amber-900 border border-yellow-300">
                    #{team.seed}
                  </span>
                  <button
                    onClick={() => handleDeleteTeam(team.id, team.name)}
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Roster list */}
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-600">
                  <span>{isSolo ? "Player Identifier" : `Roster (${team.players?.length || 0})`}</span>
                  {!isSolo && (
                    <button
                      onClick={() =>
                        setActiveTeamForPlayer(activeTeamForPlayer === team.id ? null : team.id)
                      }
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold"
                    >
                      <UserPlus className="h-3 w-3" />
                      <span>+ Player</span>
                    </button>
                  )}
                </div>

                {/* Inline Player Form */}
                {activeTeamForPlayer === team.id && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-2.5 space-y-2">
                    <input
                      type="text"
                      placeholder="Player Name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="In-Game ID / IGN"
                      value={playerIgn}
                      onChange={(e) => setPlayerIgn(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 font-mono"
                    />
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveTeamForPlayer(null)}
                        className="text-[10px] text-slate-500 px-2 py-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPlayer(team.id)}
                        className="rounded-lg bg-blue-600 px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-sm"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {/* List */}
                <div className="space-y-1">
                  {(team.players || []).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs border border-slate-200"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{p.name}</span>
                        <span className="font-mono text-[10px] text-blue-600 font-bold">
                          ({p.player_identifier})
                        </span>
                      </div>
                      {!isSolo && (
                        <button
                          onClick={() => handleDeletePlayer(p.id)}
                          className="text-slate-400 hover:text-red-500 p-0.5"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
