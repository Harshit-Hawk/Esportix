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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Live System Broadcast Strip */}
      <div className="flex items-center justify-between rounded-2xl border border-[#00F0FF]/30 bg-[#11131F]/90 px-4 py-2.5 text-xs shadow-[0_0_15px_rgba(0,240,255,0.1)]">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
          </span>
          <span className="font-orbitron font-black text-[#00F0FF] uppercase tracking-wider text-xs">
            QUANTUM BROADCAST MATRIX
          </span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-slate-400 font-chakra text-xs hidden sm:inline">
            {liveCount > 0 ? `${liveCount} Championships Live in Orbit` : "Real-time Telemetry & Scoring Protocol Active"}
          </span>
        </div>

        {featuredLive && (
          <Link
            href={`/tournament/${featuredLive.slug}`}
            className="flex items-center gap-1 font-chakra font-bold text-[#00F0FF] hover:text-white text-xs uppercase tracking-wider transition-colors"
          >
            <span>Spectate {featuredLive.name.split(" ")[0]}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Retro-Futurism Hero */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-[#242945] bg-[#11131F] p-6 sm:p-12 shadow-[0_0_40px_rgba(0,240,255,0.08)] retro-grid space-y-6">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00F0FF]/40 bg-[#00F0FF]/10 px-3.5 py-1 text-xs font-chakra font-bold uppercase tracking-wider text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.15)]">
            <Zap className="h-3.5 w-3.5 text-[#FFE600]" />
            <span>Next-Gen Esports Scoring & Telemetry</span>
          </div>

          <h1 className="font-orbitron text-3xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
            CYBER ARENA & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#FF2A85] to-[#FFE600]">LEADERBOARDS</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-chakra leading-relaxed max-w-2xl">
            Broadcast-grade holographic scorecards, real-time tie-breaker calculations, format-adaptive team rosters (Solo 1v1, Duo, Squad, 5v5 Tactical), and live WebSockets for BGMI, Free Fire, Valorant, and COD.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            {featuredLive && (
              <Link
                href={`/tournament/${featuredLive.slug}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00F0FF] to-[#FF2A85] px-6 py-3 font-chakra text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:brightness-110 active:scale-95 transition-all"
              >
                <Radio className="h-4 w-4 text-slate-950 animate-pulse" />
                <span>Open Live Arena</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#242945] bg-[#16192B] px-5 py-3 font-chakra text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:border-[#00F0FF] transition-all shadow-sm"
            >
              <Terminal className="h-4 w-4 text-[#00F0FF]" />
              <span>Organizer Terminal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#242945] pb-4 font-chakra">
        {/* Game Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setSelectedGameSlug("all")}
            className={cn(
              "rounded-xl px-4 py-2 uppercase tracking-wider transition-all",
              selectedGameSlug === "all"
                ? "bg-[#00F0FF] text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                : "border border-[#242945] bg-[#11131F] text-slate-400 hover:text-white hover:bg-[#16192B]"
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
                  "rounded-xl px-4 py-2 uppercase tracking-wider transition-all",
                  selectedGameSlug === g.slug
                    ? "bg-[#00F0FF] text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                    : "border border-[#242945] bg-[#11131F] text-slate-400 hover:text-white hover:bg-[#16192B]"
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
            className="w-full rounded-xl border border-[#242945] bg-[#11131F] py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-[#00F0FF] focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/40 shadow-sm"
          />
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-chakra">
          <h2 className="font-orbitron text-sm font-black uppercase text-white tracking-wider">
            ACTIVE TOURNAMENTS ({filteredTournaments.length})
          </h2>
        </div>

        {filteredTournaments.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-[#242945] bg-[#11131F] p-12 text-center text-slate-400 space-y-4 shadow-sm font-chakra">
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
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00F0FF] to-[#FF2A85] px-6 py-2.5 font-chakra text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:brightness-110 transition-all"
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
                  className="group flex flex-col justify-between rounded-3xl border-2 border-[#242945] bg-[#11131F] p-5 shadow-sm hover:border-[#00F0FF] hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-xl bg-[#16192B] border border-[#00F0FF]/30 group-hover:border-[#00F0FF] transition-colors">
                          <GameLogo
                            slug={tourney.game?.slug}
                            name={tourney.game?.name}
                            logoUrl={tourney.logo_url}
                            size="md"
                          />
                        </div>

                        <div>
                          <h3 className="font-orbitron font-black uppercase text-white text-sm group-hover:text-[#00F0FF] transition-colors">
                            {tourney.name}
                          </h3>
                          <span className="text-xs text-slate-400 font-chakra font-bold">
                            {tourney.game?.name} • <span className="text-[#00F0FF]">{tourney.format || "SQUAD"}</span>
                          </span>
                        </div>
                      </div>

                      {isLive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FF2A85]/20 px-2.5 py-0.5 text-[10px] font-chakra font-black uppercase text-[#FF2A85] border border-[#FF2A85] shadow-[0_0_8px_rgba(255,42,133,0.3)] shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF2A85] animate-pulse" /> Live
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#16192B] border border-[#242945] px-2.5 py-0.5 text-[10px] font-chakra font-bold uppercase text-slate-300 shrink-0">
                          {tourney.status}
                        </span>
                      )}
                    </div>

                    {tourney.description && (
                      <p className="text-xs text-slate-400 font-chakra line-clamp-2 leading-relaxed">
                        {tourney.description}
                      </p>
                    )}
                  </div>

                  {/* Holographic Progress Footer */}
                  <div className="space-y-2 border-t border-[#242945] pt-3 font-chakra">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400">
                      <span>Schedule: {completedCount}/{matchCount} Matches</span>
                      <span className="font-mono text-[#00F0FF]">{progressPct}% Done</span>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-[#16192B] border border-[#242945] overflow-hidden">
                      <div
                        style={{ width: `${progressPct}%` }}
                        className="h-full bg-gradient-to-r from-[#00F0FF] to-[#FF2A85] rounded-full transition-all duration-300"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span className="font-mono text-[11px] text-slate-300">
                        {teamCount} {tourney.format === "SOLO" ? "Combatants" : "Squads"}
                      </span>

                      <span className="font-chakra font-black uppercase text-[#00F0FF] flex items-center gap-0.5 group-hover:translate-x-1 transition-transform text-xs">
                        <span>Holo-Board</span>
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
