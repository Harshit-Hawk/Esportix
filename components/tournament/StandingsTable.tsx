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
      {/* Top 3 Podium & MVP Fraggers Showcase */}
      {standings.length >= 3 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {/* #1 Leader Podium Card */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-[#F5C400] bg-gradient-to-br from-[#1C1C1C] to-[#121212] p-4 text-white shadow-md">
            <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-[#F5C400]/10 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-oswald text-xs font-black uppercase tracking-wider text-[#F5C400]">
                <Crown className="h-4 w-4" /> #1 TOURNAMENT LEADER
              </span>
              <span className="rounded-full bg-[#F5C400] px-2 py-0.5 font-oswald text-[10px] font-black uppercase text-[#141414]">
                WWCD: {top1?.wins || 0}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-[#F5C400]/40 font-oswald text-sm font-black text-[#F5C400]">
                {top1?.team.short_name ? top1.team.short_name.slice(0, 4) : "#1"}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-oswald text-lg font-black uppercase truncate text-white leading-tight">
                  {top1?.team.name}
                </h4>
                <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
                  <span className="text-[#F5C400] font-bold">{top1?.totalPoints} PTS</span>
                  <span>•</span>
                  <span>{top1?.totalKills} Kills</span>
                  {top1?.team.short_name && top1.team.short_name !== top1.team.name && (
                    <>
                      <span>•</span>
                      <span className="text-slate-400">[{top1.team.short_name}]</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* #2 Runner-Up Podium Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-[#1C1C1C] p-4 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-oswald text-xs font-bold uppercase tracking-wider text-slate-300">
                #2 RUNNER-UP
              </span>
              <span className="font-mono text-xs text-slate-400">
                {top2?.totalPoints} PTS
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-slate-700 font-oswald text-sm font-bold text-slate-300">
                {top2?.team.short_name ? top2.team.short_name.slice(0, 4) : "#2"}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-oswald text-base font-black uppercase truncate text-white leading-tight">
                  {top2?.team.name}
                </h4>
                <span className="font-mono text-[11px] text-slate-400">
                  {top2?.totalKills} Kills • {top2?.wins} Wins
                </span>
              </div>
            </div>
          </div>

          {/* #3 2nd Runner-Up Podium Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-[#1C1C1C] p-4 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-oswald text-xs font-bold uppercase tracking-wider text-slate-300">
                #3 PODIUM
              </span>
              <span className="font-mono text-xs text-slate-400">
                {top3?.totalPoints} PTS
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-slate-700 font-oswald text-sm font-bold text-slate-300">
                {top3?.team.short_name ? top3.team.short_name.slice(0, 4) : "#3"}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-oswald text-base font-black uppercase truncate text-white leading-tight">
                  {top3?.team.name}
                </h4>
                <span className="font-mono text-[11px] text-slate-400">
                  {top3?.totalKills} Kills • {top3?.wins} Wins
                </span>
              </div>
            </div>
          </div>

          {/* Tournament MVP Fragger Card */}
          {killLeader && killLeader.totalKills > 0 && (
            <div className="relative overflow-hidden rounded-2xl border border-rose-800/80 bg-gradient-to-br from-[#1F1414] to-[#141414] p-4 text-white shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-oswald text-xs font-black uppercase tracking-wider text-rose-400">
                  <Flame className="h-4 w-4 text-rose-500" /> TOURNAMENT MVP
                </span>
                <span className="rounded-full bg-rose-950 border border-rose-700 px-2 py-0.5 font-oswald text-[10px] font-black uppercase text-rose-300">
                  {killLeader.totalKills} KILLS
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-950 border border-rose-700/60 font-oswald text-sm font-black text-rose-400">
                  <Crosshair className="h-5 w-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-oswald text-base font-black uppercase truncate text-white leading-tight">
                    {killLeader.team.name}
                  </h4>
                  <span className="font-mono text-[11px] text-rose-300">
                    {killLeader.team.short_name ? `[${killLeader.team.short_name}] • ` : ""}
                    Avg {(killLeader.totalKills / Math.max(1, killLeader.matchesPlayed)).toFixed(1)} k/m
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Group Selector */}
        {groups.length > 2 ? (
          <div className="inline-flex rounded-xl border border-slate-300 bg-white p-1 shadow-2xs">
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={cn(
                  "rounded-lg px-3.5 py-1 text-xs font-oswald font-bold uppercase tracking-wider transition-all",
                  selectedGroup === grp
                    ? "bg-[#141414] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {grp === "All" ? "All Groups" : grp}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-oswald text-xs font-bold uppercase tracking-wider text-slate-700">
              OFFICIAL CHAMPIONSHIP LEADERBOARD ({standings.length} {isSolo ? "Combatants" : "Squads"})
            </span>
          </div>
        )}

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isSolo ? "Search full IGN or in-game ID..." : "Search team name or tag..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* BGIS / BGMI OFFICIAL BROADCAST SCOREBOARD GRAPHIC         */}
      {/* ========================================================= */}
      <div
        id={tableId}
        className="relative overflow-hidden rounded-2xl border-2 border-[#D8D0B5] bg-[#F4F0E1] p-4 sm:p-6 shadow-xl"
        style={{
          backgroundImage: `
            radial-gradient(#C8C0A5 1px, transparent 1px),
            linear-gradient(135deg, rgba(255, 204, 0, 0.18) 0%, transparent 40%, rgba(255, 204, 0, 0.14) 100%)
          `,
          backgroundSize: "20px 20px, 100% 100%",
        }}
      >
        {/* Top Graphic Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b-2 border-[#D8D0B5]/60 mb-4">
          {/* Left Shield Badge & Series Logo */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#141414] border-2 border-[#F5C400] text-[#F5C400] shadow-md">
              <div className="flex flex-col items-center justify-center text-center">
                <Trophy className="h-4 w-4 text-[#F5C400] mb-0.5" />
                <span className="font-bebas text-[9px] leading-none tracking-widest text-white">
                  SERIES
                </span>
                <span className="font-bebas text-[11px] leading-none font-bold text-[#F5C400]">
                  {tournament.game?.slug === "bgmi" ? "BGMI" : tournament.format || "PRO"}
                </span>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-oswald font-bold uppercase tracking-widest text-[#786E50]">
                {tournament.game?.name || "Official Tournament"}
              </div>
              <h2 className="font-oswald text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#141414] leading-none">
                {tournament.name}
              </h2>
            </div>
          </div>

          {/* Right Stage & Group Pills */}
          <div className="flex flex-wrap items-center gap-2 sm:self-center">
            {/* Title Black Banner */}
            <div className="rounded-lg bg-[#141414] px-4 py-2 text-white border border-[#2D2D2D] shadow-sm">
              <span className="font-oswald text-base sm:text-lg font-black uppercase tracking-wider text-white">
                OVERALL STANDINGS
              </span>
            </div>

            {/* Stage Badges */}
            <div className="flex items-center gap-1.5">
              <span className="rounded-lg bg-[#E5DEC3] border border-[#C8C0A5] px-3 py-2 font-oswald text-xs font-bold uppercase tracking-wider text-[#141414]">
                {selectedGroup === "All" ? (tournament.format || "SQUAD") : selectedGroup}
              </span>
              <span className="rounded-lg bg-[#141414] px-3 py-2 font-oswald text-xs font-bold uppercase tracking-wider text-[#F5C400] border border-[#2D2D2D]">
                MATCH {completedMatchesCount} OF {matches.length || "LIVE"}
              </span>
            </div>
          </div>
        </div>

        {/* Dense Broadcast Data Table */}
        <div className="overflow-hidden rounded-xl border border-[#141414] bg-[#141414] shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse select-none">
              {/* Header Bar */}
              <thead>
                <tr className="bg-[#1C1C1C] text-[#F5C400] font-oswald text-xs uppercase tracking-wider border-b border-[#2B2B2B]">
                  <th className="py-3 pl-3 pr-2 text-center w-14 font-black">#</th>
                  <th className="py-3 px-4 font-black">{isSolo ? "PLAYER / FULL IGN & ID" : "TEAM / SQUAD NAME"}</th>
                  <th className="py-3 px-3 text-center w-16 font-black" title="WWCD / Wins">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-base leading-none">🏆</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center w-20 font-black">MATCHES</th>
                  <th className="py-3 px-3 text-center w-20 font-black">FIN. PTS.</th>
                  <th className="py-3 px-3 text-center w-20 font-black">POS. PTS.</th>
                  <th className="py-3 pl-3 pr-4 text-right w-24 font-black text-white">TOTAL</th>
                </tr>
              </thead>

              {/* Table Rows (Alternating Cream) */}
              <tbody className="font-oswald text-sm">
                {filteredStandings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center bg-[#EDE8D2] text-slate-600 font-sans text-xs">
                      No participants found.
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
                          "cursor-pointer transition-colors border-b border-[#D8D0B5]/60 hover:brightness-95",
                          isEven ? "bg-[#EDE8D2]" : "bg-[#E5DEC3]",
                          isWinner && "bg-[#F5E6AA]"
                        )}
                      >
                        {/* Rank Column */}
                        <td className="py-2.5 pl-3 pr-2 text-center text-[#171717]">
                          <div className="flex items-center justify-center gap-1">
                            {/* Delta */}
                            <span className="w-3 text-center text-xs font-bold">
                              {row.rankDelta !== undefined && row.rankDelta > 0 ? (
                                <span className="text-emerald-700 font-black">▲</span>
                              ) : row.rankDelta !== undefined && row.rankDelta < 0 ? (
                                <span className="text-rose-700 font-black">▼</span>
                              ) : (
                                <span className="text-slate-600 font-black">—</span>
                              )}
                            </span>

                            {/* Number */}
                            <span
                              className={cn(
                                "font-oswald text-base font-black w-5 text-center",
                                isWinner ? "text-[#141414] font-extrabold" : "text-[#171717]"
                              )}
                            >
                              {row.rank}
                            </span>
                          </div>
                        </td>

                        {/* Full Player / IGN / Team Name & ID */}
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded bg-white border border-[#C8C0A5] overflow-hidden shadow-2xs">
                              {isSolo ? (
                                <User className="h-4 w-4 text-slate-700" />
                              ) : row.team.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={row.team.logo_url}
                                  alt={row.team.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="font-oswald font-black text-[10px] text-slate-800">
                                  {row.team.short_name ? row.team.short_name.slice(0, 3) : "TEAM"}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              {/* Full IGN / Team Name displayed prominently */}
                              <span className="font-oswald font-black text-base text-[#141414] tracking-wide">
                                {row.team.name}
                              </span>

                              {/* In-Game ID / Short Tag Tagged in clean pill */}
                              {row.team.short_name && (
                                <span className="rounded bg-[#141414]/10 border border-[#141414]/20 px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#141414]">
                                  {isSolo ? `ID: ${row.team.short_name}` : row.team.short_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* WWCD Wins */}
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={cn(
                              "font-oswald text-base font-bold",
                              row.wins > 0 ? "text-[#141414] font-black" : "text-[#786E50]"
                            )}
                          >
                            {row.wins}
                          </span>
                        </td>

                        {/* Matches */}
                        <td className="py-2.5 px-3 text-center font-oswald text-base font-bold text-[#141414]">
                          {row.matchesPlayed}
                        </td>

                        {/* FIN. PTS (Finish / Kill Points) */}
                        <td className="py-2.5 px-3 text-center font-oswald text-base font-bold text-[#141414]">
                          {row.finishPoints}
                        </td>

                        {/* POS. PTS (Placement Points) */}
                        <td className="py-2.5 px-3 text-center font-oswald text-base font-bold text-[#141414]">
                          {row.placementPoints}
                        </td>

                        {/* TOTAL POINTS */}
                        <td className="py-2.5 pl-3 pr-4 text-right">
                          <span
                            className={cn(
                              "font-oswald text-lg font-black text-[#141414] tracking-tight",
                              isWinner && "text-[#141414] font-extrabold"
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
        <div className="mt-3 flex items-center justify-between text-[11px] font-oswald uppercase tracking-wider text-[#786E50]">
          <span>
            {tournament.name} • OFFICIAL ESPORTS TOURNAMENT SCORECARD
          </span>
          <span>POWERED BY ESPORTIX REALTIME ENGINE</span>
        </div>
      </div>

      {/* Team / Player Details Modal */}
      {selectedTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border-2 border-[#D8D0B5] bg-[#F4F0E1] p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedTeamModal(null)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3.5 border-b border-[#D8D0B5] pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#141414] text-[#F5C400] font-oswald text-lg font-black">
                #{selectedTeamModal.rank}
              </div>
              <div>
                <h3 className="font-oswald text-xl font-black uppercase text-[#141414]">
                  {selectedTeamModal.team.name}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 font-oswald text-xs font-bold text-[#786E50] tracking-wider mt-0.5">
                  <span className="rounded bg-[#141414] text-[#F5C400] px-1.5 py-0.5 font-mono text-[11px]">
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
              <div className="rounded-xl border border-[#C8C0A5] bg-[#EDE8D2] p-3">
                <span className="font-oswald text-[11px] font-black uppercase text-[#786E50] block">Total Points</span>
                <span className="font-oswald text-2xl font-black text-[#141414] mt-0.5 block">
                  {selectedTeamModal.totalPoints}
                </span>
              </div>
              <div className="rounded-xl border border-[#C8C0A5] bg-[#EDE8D2] p-3">
                <span className="font-oswald text-[11px] font-black uppercase text-[#786E50] block">WWCD Wins</span>
                <span className="font-oswald text-2xl font-black text-[#141414] mt-0.5 block">
                  {selectedTeamModal.wins}
                </span>
              </div>
              <div className="rounded-xl border border-[#C8C0A5] bg-[#EDE8D2] p-3">
                <span className="font-oswald text-[11px] font-black uppercase text-[#786E50] block">Total Kills</span>
                <span className="font-oswald text-2xl font-black text-[#141414] mt-0.5 block">
                  {selectedTeamModal.totalKills}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-[#D8D0B5] pt-3 text-[#141414]">
              <div className="flex justify-between py-1 border-b border-[#D8D0B5]/40 font-semibold font-oswald text-sm">
                <span>Placement Points (POS. PTS)</span>
                <span>{selectedTeamModal.placementPoints} pts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#D8D0B5]/40 font-semibold font-oswald text-sm">
                <span>Elimination Points (FIN. PTS)</span>
                <span>{selectedTeamModal.finishPoints} pts</span>
              </div>
              <div className="flex justify-between py-1 font-semibold font-oswald text-sm">
                <span>Matches Contested</span>
                <span>{selectedTeamModal.matchesPlayed} matches</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTeamModal(null)}
              className="w-full rounded-xl bg-[#141414] py-2.5 font-oswald text-sm font-bold uppercase text-white hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
