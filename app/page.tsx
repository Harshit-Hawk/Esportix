"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Tournament, Game } from "@/types/database";
import { GameLogo } from "@/components/common/GameLogo";
import {
  Trophy,
  Search,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Radio,
  Sparkles,
  Flame,
  Zap,
  Layers,
  Users,
  Activity,
  Cpu,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameSlug, setSelectedGameSlug] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: gamesData } = await supabase.from("games").select("*");
        setGames(gamesData || []);

        const { data: tourneyData } = await supabase
          .from("tournaments")
          .select("*, game:games(*), teams(count), matches(*)")
          .order("created_at", { ascending: false });

        setTournaments(tourneyData || []);
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = selectedGameSlug === "all" || t.game?.slug === selectedGameSlug;
    return matchesSearch && matchesGame;
  });

  const featuredLive = tournaments.find((t) => t.status === "LIVE") || tournaments[0];
  const liveCount = tournaments.filter((t) => t.status === "LIVE").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 font-rajdhani">
      {/* Live System Broadcast Strip */}
      <div className="flex items-center justify-between border-2 border-[#FCEE0A]/40 bg-[#0A0A12] px-4 py-2.5 text-xs shadow-[0_0_15px_rgba(252,238,10,0.1)] cyber-cut-tr">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FCEE0A] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FCEE0A] shadow-[0_0_8px_#FCEE0A]" />
          </span>
          <span className="font-orbitron font-black text-[#FCEE0A] uppercase tracking-wider text-xs">
            [ CYBER // QUANTUM TELEMETRY MATRIX ]
          </span>
          <span className="text-[#252538] hidden sm:inline">|</span>
          <span className="text-slate-300 text-xs hidden sm:inline font-bold">
            {liveCount > 0 ? `${liveCount} Championships Active in Night City` : "Real-time Scoring & HUD Protocol Active"}
          </span>
        </div>

        {featuredLive && (
          <Link
            href={`/tournament/${featuredLive.slug}`}
            className="flex items-center gap-1 font-bold text-[#FCEE0A] hover:text-white text-xs uppercase tracking-wider transition-colors"
          >
            <span>Spectate {featuredLive.name.split(" ")[0]}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Cyberpunk 2077 Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-[#FCEE0A] bg-[#0A0A12] p-6 sm:p-12 shadow-[0_0_40px_rgba(252,238,10,0.15)] cyber-grid space-y-6">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#FCEE0A] px-3.5 py-1 text-xs font-orbitron font-black uppercase tracking-wider text-slate-950 shadow-[0_0_15px_rgba(252,238,10,0.4)] cyber-cut-tr">
            <Zap className="h-3.5 w-3.5 text-slate-950" />
            <span>High-Voltage Esports Telemetry Engine</span>
          </div>

          <h1 className="font-orbitron text-3xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
            CYBERPUNK <span className="text-[#FCEE0A] drop-shadow-[0_0_20px_#FCEE0A]">LEADERBOARDS</span>
          </h1>

          <p className="text-base text-slate-300 leading-relaxed max-w-2xl font-medium">
            Broadcast-grade holographic scorecards, real-time tie-breaker calculations, format-adaptive team rosters (Solo 1v1, Duo, Squad, 5v5 Tactical), and live WebSockets for BGMI, Free Fire, Valorant, and COD.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            {featuredLive && (
              <Link
                href={`/tournament/${featuredLive.slug}`}
                className="inline-flex items-center gap-2 bg-[#FCEE0A] px-6 py-3 font-orbitron text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_20px_rgba(252,238,10,0.4)] hover:brightness-110 active:scale-95 transition-all cyber-cut-tr"
              >
                <Radio className="h-4 w-4 text-slate-950 animate-pulse" />
                <span>Open Live Arena</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 border-2 border-[#00F0FF] bg-[#00F0FF]/10 px-5 py-3 font-bold text-xs uppercase tracking-wider text-[#00F0FF] hover:bg-[#00F0FF] hover:text-slate-950 transition-all cyber-cut-tr shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              <Terminal className="h-4 w-4" />
              <span>Organizer Command</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#252538] pb-4">
        {/* Game Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setSelectedGameSlug("all")}
            className={cn(
              "px-4 py-2 uppercase tracking-wider transition-all cyber-cut-tr",
              selectedGameSlug === "all"
                ? "bg-[#FCEE0A] text-slate-950 font-black shadow-[0_0_15px_rgba(252,238,10,0.4)]"
                : "border border-[#252538] bg-[#0E0E1A] text-slate-400 hover:text-white hover:bg-[#161626]"
            )}
          >
            All Arenas ({tournaments.length})
          </button>
          {games.map((g) => {
            const count = tournaments.filter((t) => t.game?.slug === g.slug).length;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGameSlug(g.slug)}
                className={cn(
                  "px-4 py-2 uppercase tracking-wider transition-all cyber-cut-tr",
                  selectedGameSlug === g.slug
                    ? "bg-[#FCEE0A] text-slate-950 font-black shadow-[0_0_15px_rgba(252,238,10,0.4)]"
                    : "border border-[#252538] bg-[#0E0E1A] text-slate-400 hover:text-white hover:bg-[#161626]"
                )}
              >
                <span>{g.name.split("(")[0]}</span>
                {count > 0 && <span className="ml-1 opacity-70 font-mono text-[10px]">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tournament title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-[#252538] bg-[#0E0E1A] py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-[#FCEE0A] focus:outline-none focus:ring-1 focus:ring-[#FCEE0A]/40 shadow-sm"
          />
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-orbitron text-sm font-black uppercase text-white tracking-wider">
            ACTIVE TOURNAMENTS ({filteredTournaments.length})
          </h2>
        </div>

        {filteredTournaments.length === 0 ? (
          <div className="border-2 border-dashed border-[#252538] bg-[#0A0A12] p-12 text-center text-slate-400 space-y-4 shadow-sm cyber-cut-tr">
            <Trophy className="mx-auto h-12 w-12 text-slate-600" />
            <div className="space-y-1">
              <h3 className="font-orbitron font-black text-white text-base uppercase">
                {tournaments.length === 0 ? "No Tournaments Created Yet" : "No Matching Tournaments Found"}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {tournaments.length === 0
                  ? "Launch your first official tournament. Select BGMI, Free Fire, Valorant, or Custom rules to begin recording live telemetry."
                  : "Try adjusting your search query or game title filter."}
              </p>
            </div>
            {tournaments.length === 0 && (
              <Link
                href="/admin/tournaments/new"
                className="inline-flex items-center gap-2 bg-[#FCEE0A] px-6 py-2.5 font-orbitron text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_15px_rgba(252,238,10,0.4)] hover:brightness-110 transition-all cyber-cut-tr"
              >
                <span>+ Launch First Tournament</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTournaments.map((tourney) => {
              const isLive = tourney.status === "LIVE";
              const teamCount = (tourney as any).teams?.[0]?.count || 0;
              const matchesList = (tourney as any).matches || [];
              const matchCount = matchesList.length;
              const completedCount = matchesList.filter((m: any) => m.status === "COMPLETED").length;
              const progressPct = matchCount > 0 ? Math.round((completedCount / matchCount) * 100) : 0;

              return (
                <Link
                  key={tourney.id}
                  href={`/tournament/${tourney.slug}`}
                  className="group flex flex-col justify-between border-2 border-[#252538] bg-[#0A0A12] p-5 shadow-sm hover:border-[#FCEE0A] hover:shadow-[0_0_25px_rgba(252,238,10,0.2)] transition-all space-y-4 cyber-cut-tr"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-[#12121E] border border-[#FCEE0A]/40 group-hover:border-[#FCEE0A] transition-colors cyber-cut-tr">
                          <GameLogo
                            slug={tourney.game?.slug}
                            name={tourney.game?.name}
                            logoUrl={tourney.logo_url}
                            size="md"
                          />
                        </div>

                        <div>
                          <h3 className="font-orbitron font-black uppercase text-white text-sm group-hover:text-[#FCEE0A] transition-colors">
                            {tourney.name}
                          </h3>
                          <span className="text-xs text-slate-400 font-bold">
                            {tourney.game?.name} • <span className="text-[#FCEE0A]">{tourney.format || "SQUAD"}</span>
                          </span>
                        </div>
                      </div>

                      {isLive ? (
                        <span className="inline-flex items-center gap-1 bg-[#FF0055] px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-[0_0_8px_rgba(255,0,85,0.4)] shrink-0 cyber-cut-tr">
                          <span className="h-1.5 w-1.5 bg-white animate-pulse" /> Live
                        </span>
                      ) : (
                        <span className="bg-[#161626] border border-[#252538] px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-300 shrink-0 cyber-cut-tr">
                          {tourney.status}
                        </span>
                      )}
                    </div>

                    {tourney.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-medium">
                        {tourney.description}
                      </p>
                    )}
                  </div>

                  {/* High-Voltage Progress Footer */}
                  <div className="space-y-2 border-t border-[#252538] pt-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400">
                      <span>Schedule: {completedCount}/{matchCount} Matches</span>
                      <span className="font-mono text-[#FCEE0A]">{progressPct}% Done</span>
                    </div>

                    <div className="h-1.5 w-full bg-[#12121E] border border-[#252538] overflow-hidden">
                      <div
                        style={{ width: `${progressPct}%` }}
                        className="h-full bg-gradient-to-r from-[#00F0FF] to-[#FCEE0A] transition-all duration-300"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-bold">
                      <span className="font-mono text-[11px] text-slate-300">
                        {teamCount} {tourney.format === "SOLO" ? "Combatants" : "Squads"}
                      </span>

                      <span className="font-orbitron font-black uppercase text-[#FCEE0A] flex items-center gap-0.5 group-hover:translate-x-1 transition-transform text-xs">
                        <span>Scorecard</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
