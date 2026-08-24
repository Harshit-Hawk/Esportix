"use client";

import { useState } from "react";
import { Team, Player } from "@/types/database";
import { Users, Shield, Search, UserCheck } from "lucide-react";

interface TeamRosterGridProps {
  teams: (Team & { players?: Player[] })[];
}

export function TeamRosterGrid({ teams }: TeamRosterGridProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTeams = teams.filter((team) => {
    const term = searchTerm.toLowerCase();
    const teamMatch =
      team.name.toLowerCase().includes(term) ||
      team.short_name.toLowerCase().includes(term);
    const playerMatch = team.players?.some(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.player_identifier?.toLowerCase().includes(term)
    );
    return teamMatch || playerMatch;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search teams or player in-game IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-sm"
          />
        </div>
        <div className="text-xs text-slate-500 font-bold">
          {filteredTeams.length} competing squads
        </div>
      </div>

      {/* Grid of Teams */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  {team.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={team.logo_url}
                      alt={team.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Shield className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex flex-col">
                  <h4 className="font-display text-sm font-black uppercase text-slate-900">
                    {team.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    [{team.short_name}] • {team.group_name || "Overall"}
                  </span>
                </div>
              </div>

              <div className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-black text-amber-900 border border-yellow-300">
                #{team.seed}
              </div>
            </div>

            {/* Players List */}
            <div className="p-4 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                <Users className="h-3 w-3 text-blue-600" />
                <span>Active Roster</span>
              </div>

              {team.players && team.players.length > 0 ? (
                <div className="space-y-1.5">
                  {team.players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-900">
                          {player.name}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-blue-600 shrink-0">
                        {player.player_identifier || "Player"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic py-2">No players assigned</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
