"use client";

import { useState, useMemo } from "react";
import { LeaderboardRow } from "@/lib/scoring/leaderboard";
import { Tournament, Match } from "@/types/database";
import {
  Trophy,
  Flame,
  Search,
  ChevronUp,
  ChevronDown,
  Minus,
  Crown,
  X,
  User,
  Layers,
  Sparkles,
  Download,
  Share2,
  Medal,
  Crosshair,
  Zap,
  Terminal,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StandingsTableProps {
  standings: LeaderboardRow[];
  tournament: Tournament;
  completedMatchesCount: number;
  qualifyingCutoff?: number;
  tableId?: string;
  matches?: Match[];
}

export function StandingsTable({
  standings,
  tournament,
  completedMatchesCount,
  qualifyingCutoff = 8,
  tableId = "overall-scorecard-table",
  matches = [],
}: StandingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [selectedTeamModal, setSelectedTeamModal] = useState<LeaderboardRow | null>(null);

  const isSolo = tournament.format === "SOLO";
  const isDuo = tournament.format === "DUO";

  const groups = ["All", ...Array.from(new Set(standings.map((r) => r.team.group_name).filter(Boolean)))];

  // Top 3 Podium
  const top1 = standings[0] || null;
  const top2 = standings[1] || null;
  const top3 = standings[2] || null;

  // Kill MVP Leader
  const killLeader = useMemo(() => {
    if (!standings.length) return null;
    return standings.reduce((max, curr) => (curr.totalKills > max.totalKills ? curr : max), standings[0]);
  }, [standings]);

  const filteredStandings = useMemo(() => {
    return standings.filter((row) => {
      const matchesSearch =
        row.team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.team.short_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = selectedGroup === "All" || row.team.group_name === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [standings, searchTerm, selectedGroup]);

  return (
    <div className="space-y-6">
      {/* Top 3 Cyberpunk Podium Cards & MVP Showcase */}
      {standings.length >= 3 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {/* #1 Leader Cyberpunk Yellow Card */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-[#FCEE0A] bg-gradient-to-br from-[#1C1A05] via-[#0E0E18] to-[#05050A] p-4 text-white shadow-[0_0_25px_rgba(252,238,10,0.3)] cyber-cut-tr">
            <div className="absolute -right-3 -top-3 h-20 w-20 rounded-full bg-[#FCEE0A]/10 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-orbitron text-xs font-black uppercase tracking-wider text-[#FCEE0A]">
                <Crown className="h-4 w-4 text-[#FCEE0A]" /> #1 DOMINATOR
              </span>
              <span className="bg-[#FCEE0A] text-slate-950 font-orbitron px-2.5 py-0.5 text-[10px] font-black uppercase shadow-[0_0_10px_#FCEE0A]">
                WWCD: {top1?.wins || 0}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#FCEE0A] text-slate-950 font-orbitron text-sm font-black shadow-[0_0_10px_rgba(252,238,10,0.4)] cyber-cut-tr">
                {top1?.team.short_name ? top1.team.short_name.slice(0, 4) : "#1"}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-orbitron text-lg font-black uppercase truncate text-white leading-tight">
                  {top1?.team.name}
                </h4>
                <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300 mt-0.5">
                  <span className="text-[#FCEE0A] font-bold">{top1?.totalPoints} PTS</span>
                  <span>•</span>
                  <span className="text-[#00F0FF]">{top1?.totalKills} Kills</span>
                </div>
              </div>
            </div>
          </div>

          {/* #2 Runner-Up Glitch Cyan Card */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-[#00F0FF]/50 bg-gradient-to-br from-[#051B25] via-[#0E0E18] to-[#05050A] p-4 text-white shadow-[0_0_20px_rgba(0,240,255,0.2)] cyber-cut-tr">
            <div className="flex items-center justify-between">
              <span className="font-orbitron text-xs font-bold uppercase tracking-wider text-[#00F0FF]">
                #2 RUNNER-UP
              </span>
              <span className="font-mono text-xs text-[#00F0FF] font-bold">
                {top2?.totalPoints} PTS
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#00F0FF] text-slate-950 font-orbitron text-sm font-black shadow-[0_0_10px_rgba(0,240,255,0.4)] cyber-cut-tr">
                {top2?.team.short_name ? top2.team.short_name.slice(0, 4) : "#2"}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-orbitron text-base font-black uppercase truncate text-white leading-tight">
                  {top2?.team.name}
                </h4>
                <span className="font-mono text-[11px] text-slate-400">
                  {top2?.totalKills} Kills • {top2?.wins} Wins
                </span>
              </div>
            </div>
          </div>

          {/* #3 2nd Runner-Up Card */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-[#9D4EDD]/50 bg-gradient-to-br from-[#1C0D26] via-[#0E0E18] to-[#05050A] p-4 text-white shadow-[0_0_20px_rgba(157,78,221,0.2)] cyber-cut-tr">
            <div className="flex items-center justify-between">
              <span className="font-orbitron text-xs font-bold uppercase tracking-wider text-[#9D4EDD]">
                #3 PODIUM
              </span>
              <span className="font-mono text-xs text-[#9D4EDD] font-bold">
                {top3?.totalPoints} PTS
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#9D4EDD] text-white font-orbitron text-sm font-bold shadow-[0_0_10px_rgba(157,78,221,0.4)] cyber-cut-tr">
                {top3?.team.short_name ? top3.team.short_name.slice(0, 4) : "#3"}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-orbitron text-base font-black uppercase truncate text-white leading-tight">
                  {top3?.team.name}
                </h4>
                <span className="font-mono text-[11px] text-slate-400">
                  {top3?.totalKills} Kills • {top3?.wins} Wins
                </span>
              </div>
            </div>
          </div>

          {/* Cyber MVP Fragger Card */}
          {killLeader && killLeader.totalKills > 0 && (
            <div className="relative overflow-hidden rounded-2xl border-2 border-[#FF0055]/50 bg-gradient-to-br from-[#2B0515] via-[#0E0E18] to-[#05050A] p-4 text-white shadow-[0_0_25px_rgba(255,0,85,0.25)] cyber-cut-tr">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-orbitron text-xs font-black uppercase tracking-wider text-[#FF0055]">
                  <Flame className="h-4 w-4 text-[#FF0055]" /> CYBER MVP
                </span>
                <span className="bg-[#FF0055] text-white px-2.5 py-0.5 font-orbitron text-[10px] font-black uppercase shadow-[0_0_10px_#FF0055]">
                  {killLeader.totalKills} KILLS
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#FF0055] text-white font-orbitron text-sm font-black shadow-[0_0_10px_#FF0055] cyber-cut-tr">
                  <Crosshair className="h-5 w-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-orbitron text-base font-black uppercase truncate text-white leading-tight">
                    {killLeader.team.name}
                  </h4>
                  <span className="font-mono text-[11px] text-[#FF0055]">
                    {killLeader.team.short_name ? `[${killLeader.team.short_name}] • ` : ""}
                    Avg {(killLeader.totalKills / Math.max(1, killLeader.matchesPlayed)).toFixed(1)} k/m
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between font-rajdhani">
        {/* Groups */}
        {groups.length > 2 ? (
          <div className="inline-flex rounded-xl border border-[#252538] bg-[#0E0E1A] p-1 shadow-sm">
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={cn(
                  "rounded-lg px-3.5 py-1 text-xs font-rajdhani font-bold uppercase tracking-wider transition-all cyber-cut-tr",
                  selectedGroup === grp
                    ? "bg-[#FCEE0A] text-slate-950 font-black shadow-[0_0_10px_rgba(252,238,10,0.4)]"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {grp === "All" ? "All Groups" : grp}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 bg-[#FCEE0A] shadow-[0_0_8px_#FCEE0A] animate-pulse" />
            <span className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">
              CHAMPIONSHIP MATRIX ({standings.length} {isSolo ? "COMBATANTS" : "SQUADS"})
            </span>
          </div>
        )}

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={isSolo ? "Search full IGN or Character ID..." : "Search team name or tag..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-[#252538] bg-[#0E0E1A] py-2 pl-9 pr-4 text-xs font-rajdhani text-white placeholder-slate-500 focus:border-[#FCEE0A] focus:outline-none focus:ring-1 focus:ring-[#FCEE0A]/40 shadow-sm"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* CYBERPUNK 2077 SCOREBOARD MATRIX                          */}
      {/* ========================================================= */}
      <div
        id={tableId}
        className="relative overflow-hidden rounded-2xl border-2 border-[#FCEE0A] bg-[#0A0A12] p-4 sm:p-6 shadow-[0_0_40px_rgba(252,238,10,0.1)] cyber-grid"
      >
        {/* Top Cyberpunk Graphic Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b-2 border-[#252538] mb-4">
          {/* Left Shield Badge & Series Logo */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center bg-[#05050A] border-2 border-[#FCEE0A] text-[#FCEE0A] shadow-[0_0_15px_rgba(252,238,10,0.4)] cyber-cut-tr">
              <div className="flex flex-col items-center justify-center text-center">
                <Trophy className="h-4 w-4 text-[#FCEE0A] mb-0.5" />
                <span className="font-orbitron text-[9px] leading-none tracking-widest text-[#00F0FF]">
                  CYBER
                </span>
                <span className="font-orbitron text-[11px] leading-none font-bold text-[#FCEE0A]">
                  {tournament.game?.slug === "bgmi" ? "BGMI" : tournament.format || "PRO"}
                </span>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-rajdhani font-bold uppercase tracking-widest text-[#00F0FF]">
                {tournament.game?.name || "Official Tournament"}
              </div>
              <h2 className="font-orbitron text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-none">
                {tournament.name}
              </h2>
            </div>
          </div>

          {/* Right Stage & Group Pills */}
          <div className="flex flex-wrap items-center gap-2 sm:self-center font-rajdhani">
            {/* Title Banner */}
            <div className="bg-[#FCEE0A] px-4 py-2 text-slate-950 font-black shadow-[0_0_15px_rgba(252,238,10,0.3)] cyber-cut-tr">
              <span className="font-orbitron text-base sm:text-lg font-black uppercase tracking-wider text-slate-950">
                OVERALL STANDINGS
              </span>
            </div>

            {/* Stage Badges */}
            <div className="flex items-center gap-1.5 font-rajdhani font-bold">
              <span className="bg-[#12121E] border border-[#252538] px-3 py-2 text-xs uppercase tracking-wider text-slate-300 cyber-cut-tr">
                {selectedGroup === "All" ? (tournament.format || "SQUAD") : selectedGroup}
              </span>
              <span className="bg-[#05050A] px-3 py-2 text-xs uppercase tracking-wider text-[#00F0FF] border border-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.3)] cyber-cut-tr">
                MATCH {completedMatchesCount} OF {matches.length || "LIVE"}
              </span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden border-2 border-[#252538] bg-[#05050A] shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse select-none">
              {/* Header Bar */}
              <thead>
                <tr className="bg-[#12121E] text-[#FCEE0A] font-orbitron text-xs uppercase tracking-wider border-b-2 border-[#FCEE0A]">
                  <th className="py-3 pl-3 pr-2 text-center w-14 font-black">#</th>
                  <th className="py-3 px-4 font-black">{isSolo ? "PLAYER / FULL IGN & ID" : "TEAM / SQUAD NAME"}</th>
                  <th className="py-3 px-3 text-center w-16 font-black" title="WWCD / Wins">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-base leading-none">🏆</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center w-24 font-black">MATCHES</th>
                  <th className="py-3 px-3 text-center w-32 font-black text-[#FF0055]">FINISH POINTS</th>
                  <th className="py-3 px-3 text-center w-32 font-black text-[#00F0FF]">POSITION POINTS</th>
                  <th className="py-3 pl-3 pr-5 text-right w-32 font-black text-white">TOTAL POINTS</th>
                </tr>
              </thead>

              {/* Table Rows (Cyber Alternating) */}
              <tbody className="font-rajdhani text-sm font-semibold">
                {filteredStandings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center bg-[#0A0A12] text-slate-500 font-sans text-xs">
                      No participants linked to grid yet.
                    </td>
                  </tr>
                ) : (
                  filteredStandings.map((row, idx) => {
                    const isEven = idx % 2 === 0;
                    const isWinner = row.rank === 1;

                    return (
                      <tr
                        key={row.team.id}
                        onClick={() => setSelectedTeamModal(row)}
                        className={cn(
                          "cursor-pointer transition-colors border-b border-[#252538]/60 hover:bg-[#161626]",
                          isEven ? "bg-[#07070F]" : "bg-[#0E0E1A]",
                          isWinner && "bg-gradient-to-r from-[#FCEE0A]/15 via-[#12121E] to-transparent border-l-4 border-l-[#FCEE0A]"
                        )}
                      >
                        {/* Rank Column */}
                        <td className="py-3 pl-3 pr-2 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Delta */}
                            <span className="w-3 text-center text-xs font-bold">
                              {row.rankDelta !== undefined && row.rankDelta > 0 ? (
                                <span className="text-[#00FF66] font-black drop-shadow-[0_0_5px_#00FF66]">▲</span>
                              ) : row.rankDelta !== undefined && row.rankDelta < 0 ? (
                                <span className="text-[#FF0055] font-black drop-shadow-[0_0_5px_#FF0055]">▼</span>
                              ) : (
                                <span className="text-slate-600 font-black">—</span>
                              )}
                            </span>

                            {/* Number */}
                            <span
                              className={cn(
                                "font-orbitron text-base font-black w-6 text-center",
                                isWinner
                                  ? "text-[#FCEE0A] drop-shadow-[0_0_8px_#FCEE0A]"
                                  : row.rank <= 3
                                  ? "text-[#00F0FF]"
                                  : "text-white"
                              )}
                            >
                              {row.rank}
                            </span>
                          </div>
                        </td>

                        {/* Full Player / IGN / Team Name & ID */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center bg-[#161626] border border-[#252538] overflow-hidden cyber-cut-tr">
                              {isSolo ? (
                                <User className="h-4 w-4 text-[#FCEE0A]" />
                              ) : row.team.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={row.team.logo_url}
                                  alt={row.team.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="font-orbitron font-black text-[10px] text-[#FCEE0A]">
                                  {row.team.short_name ? row.team.short_name.slice(0, 3) : "TM"}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              {/* Full IGN / Team Name */}
                              <span className="font-orbitron font-black text-base text-white tracking-wide">
                                {row.team.name}
                              </span>

                              {/* Character ID / Tag */}
                              {row.team.short_name && (
                                <span className="rounded bg-[#FCEE0A]/15 border border-[#FCEE0A]/40 px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#FCEE0A]">
                                  {isSolo ? `ID: ${row.team.short_name}` : row.team.short_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* WWCD Wins */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={cn(
                              "font-orbitron text-base font-bold",
                              row.wins > 0 ? "text-[#FCEE0A] font-black drop-shadow-[0_0_5px_#FCEE0A]" : "text-slate-600"
                            )}
                          >
                            {row.wins}
                          </span>
                        </td>

                        {/* Matches */}
                        <td className="py-3 px-3 text-center font-rajdhani text-base font-bold text-slate-300">
                          {row.matchesPlayed}
                        </td>

                        {/* FINISH POINTS */}
                        <td className="py-3 px-3 text-center font-rajdhani text-base font-bold text-[#FF0055]">
                          {row.finishPoints}
                        </td>

                        {/* POSITION POINTS */}
                        <td className="py-3 px-3 text-center font-rajdhani text-base font-bold text-[#00F0FF]">
                          {row.placementPoints}
                        </td>

                        {/* TOTAL POINTS */}
                        <td className="py-3 pl-3 pr-5 text-right">
                          <span
                            className={cn(
                              "font-orbitron text-lg font-black tracking-tight",
                              isWinner
                                ? "text-[#FCEE0A] drop-shadow-[0_0_10px_#FCEE0A]"
                                : "text-white"
                            )}
                          >
                            {row.totalPoints}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Graphic Footer Caption */}
        <div className="mt-3 flex items-center justify-between text-[11px] font-rajdhani font-bold uppercase tracking-wider text-slate-500">
          <span>
            {tournament.name} • CYBERPUNK 2077 ESPORTS TELEMETRY
          </span>
          <span className="text-[#FCEE0A] font-mono">[ REALTIME LINK ACTIVE ]</span>
        </div>
      </div>

      {/* Cyber Inspection Modal */}
      {selectedTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in font-rajdhani">
          <div className="relative w-full max-w-md rounded-2xl border-2 border-[#FCEE0A] bg-[#0A0A12] p-6 shadow-[0_0_50px_rgba(252,238,10,0.3)] space-y-4 cyber-cut-tr">
            <button
              onClick={() => setSelectedTeamModal(null)}
              className="absolute right-4 top-4 rounded p-1.5 text-slate-400 hover:bg-[#161626] hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3.5 border-b border-[#252538] pb-4">
              <div className="flex h-12 w-12 items-center justify-center bg-[#FCEE0A] text-slate-950 font-orbitron text-lg font-black shadow-[0_0_10px_#FCEE0A] cyber-cut-tr">
                #{selectedTeamModal.rank}
              </div>
              <div>
                <h3 className="font-orbitron text-xl font-black uppercase text-white">
                  {selectedTeamModal.team.name}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <span className="rounded bg-[#FCEE0A]/20 border border-[#FCEE0A] text-[#FCEE0A] px-1.5 py-0.5 font-mono text-[11px] font-bold">
                    {isSolo ? `IGN / UID: ${selectedTeamModal.team.short_name}` : `TAG: ${selectedTeamModal.team.short_name}`}
                  </span>
                  <span>•</span>
                  <span>Group: {selectedTeamModal.team.group_name || "Overall"}</span>
                  <span>•</span>
                  <span>Seed #{selectedTeamModal.team.seed}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="border border-[#FCEE0A] bg-[#12121E] p-3 shadow-[0_0_10px_rgba(252,238,10,0.15)] cyber-cut-tr">
                <span className="text-[11px] font-bold uppercase text-[#FCEE0A] block">Total Points</span>
                <span className="font-orbitron text-2xl font-black text-white mt-0.5 block">
                  {selectedTeamModal.totalPoints}
                </span>
              </div>
              <div className="border border-[#00F0FF] bg-[#12121E] p-3 shadow-[0_0_10px_rgba(0,240,255,0.15)] cyber-cut-tr">
                <span className="text-[11px] font-bold uppercase text-[#00F0FF] block">WWCD Wins</span>
                <span className="font-orbitron text-2xl font-black text-white mt-0.5 block">
                  {selectedTeamModal.wins}
                </span>
              </div>
              <div className="border border-[#FF0055] bg-[#12121E] p-3 shadow-[0_0_10px_rgba(255,0,85,0.15)] cyber-cut-tr">
                <span className="text-[11px] font-bold uppercase text-[#FF0055] block">Total Kills</span>
                <span className="font-orbitron text-2xl font-black text-white mt-0.5 block">
                  {selectedTeamModal.totalKills}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-[#252538] pt-3 text-slate-300">
              <div className="flex justify-between py-1 border-b border-[#252538]/60 font-semibold">
                <span>Position Points (Placement Points)</span>
                <span className="text-[#00F0FF] font-bold">{selectedTeamModal.placementPoints} pts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#252538]/60 font-semibold">
                <span>Finish Points (Elimination Points)</span>
                <span className="text-[#FF0055] font-bold">{selectedTeamModal.finishPoints} pts</span>
              </div>
              <div className="flex justify-between py-1 font-semibold">
                <span>Matches Contested</span>
                <span className="text-white font-bold">{selectedTeamModal.matchesPlayed} matches</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTeamModal(null)}
              className="w-full bg-[#FCEE0A] py-2.5 font-orbitron text-sm font-black uppercase text-slate-950 hover:brightness-110 transition-all shadow-[0_0_15px_rgba(252,238,10,0.4)] cyber-cut-tr"
            >
              Close Telemetry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
