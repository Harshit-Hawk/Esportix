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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-esports-silver" />
          <input
            type="text"
            placeholder="Search teams or player in-game IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-esports-navy-border bg-esports-navy-card py-2 pl-9 pr-4 text-xs text-white placeholder-esports-silver/60 focus:border-esports-orange focus:outline-none"
          />
        </div>
        <div className="text-xs text-esports-silver font-semibold">
          {filteredTeams.length} competing squads
        </div>
      </div>

      {/* Grid of Teams */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className="flex flex-col justify-between overflow-hidden rounded-xl border border-esports-navy-border bg-esports-navy-card shadow-lg hover:border-esports-orange/60 transition-all"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-esports-navy-border bg-esports-navy/80 p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-esports-navy-border bg-esports-navy-dark">
                  {team.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={team.logo_url}
                      alt={team.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Shield className="h-5 w-5 text-esports-orange" />
                  )}
                </div>
                <div className="flex flex-col">
                  <h4 className="font-display text-sm font-black uppercase text-white truncate max-w-[140px]">
                    {team.name}
                  </h4>
                  <span className="text-[10px] text-esports-silver font-mono">
                    [{team.short_name}] • {team.group_name}
                  </span>
                </div>
              </div>

              <div className="rounded-md bg-esports-navy-light px-2 py-0.5 text-[11px] font-bold text-esports-gold border border-esports-navy-border">
                Seed #{team.seed}
              </div>
            </div>

            {/* Players List */}
            <div className="p-4 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-esports-silver mb-2.5 flex items-center gap-1.5">
                <Users className="h-3 w-3 text-esports-orange" />
                <span>Active Roster</span>
              </div>

              {team.players && team.players.length > 0 ? (
                <div className="space-y-1.5">
                  {team.players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between rounded-md bg-esports-navy-dark/60 px-2.5 py-1.5 text-xs border border-esports-navy-border/40"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-3.5 w-3.5 text-esports-silver/60" />
                        <span className="font-semibold text-esports-cream truncate max-w-[130px]">
                          {player.name}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-esports-orange">
                        {player.player_identifier || "Player"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-zinc-500 italic py-2">No players assigned</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
