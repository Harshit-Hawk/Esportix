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
  const totalMatchesCount = tournaments.reduce((acc, curr) => acc + ((curr as any).matches?.length || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      {/* Live System Broadcast Strip */}
      <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-2 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
          </span>
          <span className="font-bold text-blue-800 uppercase tracking-wider text-[11px]">
            Live Broadcast Network
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-slate-600 text-[11px] hidden sm:inline">
            {liveCount > 0 ? `${liveCount} Championships Live Now` : "Real-time Leaderboard & Scoring Engine Active"}
          </span>
        </div>

        {featuredLive && (
          <Link
            href={`/tournament/${featuredLive.slug}`}
            className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 text-[11px]"
          >
            <span>Watch {featuredLive.name.split(" ")[0]}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Dynamic Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-4">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Zap className="h-3.5 w-3.5 text-yellow-500" />
            <span>Collegiate & Pro Esports Scoring Engine</span>
          </div>

          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Live Tournaments & <span className="text-blue-600">Leaderboards</span>
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            Broadcast-quality scorecards, dynamic tie-breaker calculations, format-adaptive team rosters (Solo, Duo, Squad, 5v5), and real-time live standings for BGMI, Free Fire, Valorant, and COD.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {featuredLive && (
              <Link
                href={`/tournament/${featuredLive.slug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all"
              >
                <Radio className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
                <span>Open Live Scorecard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <ShieldCheck className="h-4 w-4 text-slate-500" />
              <span>Organizer Control Room</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        {/* Game Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          <button
            onClick={() => setSelectedGameSlug("all")}
            className={cn(
              "rounded-xl px-3.5 py-1.5 font-bold uppercase tracking-wider transition-all",
              selectedGameSlug === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            All Titles ({tournaments.length})
          </button>
          {games.map((g) => {
            const count = tournaments.filter((t) => t.game?.slug === g.slug).length;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGameSlug(g.slug)}
                className={cn(
                  "rounded-xl px-3.5 py-1.5 font-bold uppercase tracking-wider transition-all",
                  selectedGameSlug === g.slug
                    ? "bg-blue-600 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <span>{g.name}</span>
                {count > 0 && <span className="ml-1 opacity-70 font-mono text-[10px]">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tournament..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-black uppercase text-slate-900 tracking-wider">
            Active Tournaments ({filteredTournaments.length})
          </h2>
        </div>

        {filteredTournaments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 space-y-1 shadow-xs">
            <h3 className="font-display font-black text-slate-900 text-sm uppercase">No Tournaments Found</h3>
            <p className="text-xs text-slate-500">Try adjusting your filter or search query.</p>
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
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <GameLogo
                          slug={tourney.game?.slug}
                          name={tourney.game?.name}
                          logoUrl={tourney.logo_url}
                          size="md"
                        />

                        <div>
                          <h3 className="font-display font-black uppercase text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                            {tourney.name}
                          </h3>
                          <span className="text-xs text-slate-500 font-bold">
                            {tourney.game?.name || "Game"} • <span className="text-blue-600 font-black">{tourney.format || "SQUAD"}</span>
                          </span>
                        </div>
                      </div>

                      {isLive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-black uppercase text-red-600 border border-red-200 shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" /> Live
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 shrink-0">
                          {tourney.status}
                        </span>
                      )}
                    </div>

                    {tourney.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {tourney.description}
                      </p>
                    )}
                  </div>

                  {/* Dynamic Progress & Metrics Footer */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500">
                      <span>Schedule: {completedCount}/{matchCount} Matches</span>
                      <span className="font-mono">{progressPct}% Done</span>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${progressPct}%` }}
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span className="font-mono text-[11px] font-semibold text-slate-700">
                        {teamCount} {tourney.format === "SOLO" ? "Combatants" : "Squads"}
                      </span>

                      <span className="font-black uppercase text-blue-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-xs">
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
