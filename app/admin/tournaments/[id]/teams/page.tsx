"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Tournament, Team, Player } from "@/types/database";
import {
  Users,
  ArrowLeft,
  PlusCircle,
  Trash2,
  Edit2,
  Shield,
  UserPlus,
  Sparkles,
  Save,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TournamentTeamsAdminPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<(Team & { players?: Player[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTeam, setShowAddTeam] = useState(false);

  // New Team State
  const [teamName, setTeamName] = useState("");
  const [shortName, setShortName] = useState("");
  const [seed, setSeed] = useState(1);
  const [groupName, setGroupName] = useState("Group A");

  // Add Player State (Modal / Inline)
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

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
    if (!confirm(`Are you sure you want to delete team ${name}?`)) return;
    try {
      await supabase.from("teams").delete().eq("id", teamId);
      loadData();
    } catch (err: any) {
      alert("Error deleting team: " + err.message);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
      await supabase.from("players").delete().eq("id", playerId);
      loadData();
    } catch (err: any) {
      alert("Error deleting player: " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
            Teams & Rosters Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddTeam(!showAddTeam)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-esports-orange to-orange-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow hover:brightness-110"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Team</span>
          </button>
        </div>
      </div>

      {/* Add Team Drawer */}
      {showAddTeam && (
        <form
          onSubmit={handleCreateTeam}
          className="rounded-xl border border-esports-orange/40 bg-esports-navy-card p-5 shadow-xl space-y-4 animate-in fade-in"
        >
          <div className="font-display text-sm font-black uppercase text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-esports-orange" />
            <span>Add Competing Team</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-esports-silver mb-1">
                Team Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Predators"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full rounded-md border border-esports-navy-border bg-esports-navy-dark px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-esports-silver mb-1">
                Short Tag (3-5 chars) *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="APEX"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="w-full rounded-md border border-esports-navy-border bg-esports-navy-dark px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-esports-silver mb-1">
                Seed Number
              </label>
              <input
                type="number"
                min={1}
                value={seed}
                onChange={(e) => setSeed(Number(e.target.value))}
                className="w-full rounded-md border border-esports-navy-border bg-esports-navy-dark px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-esports-silver mb-1">
                Group
              </label>
              <select
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full rounded-md border border-esports-navy-border bg-esports-navy-dark px-3 py-1.5 text-xs text-white"
              >
                <option value="Group A">Group A</option>
                <option value="Group B">Group B</option>
                <option value="Overall">Overall</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddTeam(false)}
              className="rounded-md border border-esports-navy-border px-3 py-1.5 text-xs font-bold uppercase text-esports-silver"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-esports-orange px-4 py-1.5 text-xs font-black uppercase text-white shadow"
            >
              Save Team
            </button>
          </div>
        </form>
      )}

      {/* Teams Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div
            key={team.id}
            className="flex flex-col justify-between rounded-xl border border-esports-navy-border bg-esports-navy-card p-5 shadow-lg space-y-4"
          >
            {/* Team Header */}
            <div>
              <div className="flex items-center justify-between border-b border-esports-navy-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-esports-navy-dark border border-esports-navy-border font-display text-xs font-black text-esports-orange">
                    {team.short_name.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-black uppercase text-white">
                      {team.name}
                    </h3>
                    <span className="text-[10px] text-esports-silver font-mono">
                      [{team.short_name}] • {team.group_name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded bg-esports-navy-light px-2 py-0.5 text-[10px] font-bold text-esports-gold">
                    Seed #{team.seed}
                  </span>
                  <button
                    onClick={() => handleDeleteTeam(team.id, team.name)}
                    className="text-esports-silver hover:text-red-400 p-1"
                    title="Delete Team"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Players List */}
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase text-esports-silver">
                  <span>Player Roster ({team.players?.length || 0})</span>
                  <button
                    onClick={() =>
                      setActiveTeamForPlayer(activeTeamForPlayer === team.id ? null : team.id)
                    }
                    className="flex items-center gap-1 text-esports-orange hover:text-white"
                  >
                    <UserPlus className="h-3 w-3" />
                    <span>+ Player</span>
                  </button>
                </div>

                {/* Inline Add Player Input */}
                {activeTeamForPlayer === team.id && (
                  <div className="rounded-lg border border-esports-orange/40 bg-esports-navy-dark p-2.5 space-y-2">
                    <input
                      type="text"
                      placeholder="Player Name (e.g. John Doe)"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full rounded border border-esports-navy-border bg-esports-navy px-2 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="In-Game ID / IGN (e.g. ShadowOP)"
                      value={playerIgn}
                      onChange={(e) => setPlayerIgn(e.target.value)}
                      className="w-full rounded border border-esports-navy-border bg-esports-navy px-2 py-1 text-xs text-white font-mono"
                    />
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveTeamForPlayer(null)}
                        className="text-[10px] text-esports-silver px-2 py-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPlayer(team.id)}
                        className="rounded bg-esports-orange px-2.5 py-1 text-[10px] font-black uppercase text-white"
                      >
                        Save Player
                      </button>
                    </div>
                  </div>
                )}

                {/* List of players */}
                <div className="space-y-1">
                  {(team.players || []).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded bg-esports-navy-dark/70 px-2 py-1 text-xs border border-esports-navy-border/40"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-esports-cream">{p.name}</span>
                        <span className="font-mono text-[10px] text-esports-orange">
                          ({p.player_identifier})
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeletePlayer(p.id)}
                        className="text-zinc-600 hover:text-red-400 p-0.5"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
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
