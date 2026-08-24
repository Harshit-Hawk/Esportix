"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Tournament, Game } from "@/types/database";
import {
  Trophy,
  Flame,
  Radio,
  Gamepad2,
  Calendar,
  Users,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  ChevronRight,
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
          .select("*, game:games(*), teams(count), matches(count)")
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-12 shadow-xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-yellow-400/15 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-blue-600 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
            <span>Collegiate & Pro Esports Scoring Platform</span>
          </div>

          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Tournament Scoring & <span className="text-blue-600">Live Leaderboard</span> Engine
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Broadcast-grade point calculations, customizable tie-breakers, real-time standings, and lightning-fast score entry for BGMI, Free Fire, Valorant, COD, and collegiate esports championships.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {featuredLive && (
              <Link
                href={`/tournament/${featuredLive.slug}`}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all"
              >
                <Radio className="h-4 w-4 animate-pulse text-yellow-300" />
                <span>Watch Live Scorecard ({featuredLive.name.split(" ")[0]})</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            )}

            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
            >
              <ShieldCheck className="h-4 w-4 text-yellow-500" />
              <span>Admin Control Room</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        {/* Game Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedGameSlug("all")}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all",
              selectedGameSlug === "all"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            All Games
          </button>
          {games.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGameSlug(g.slug)}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all",
                selectedGameSlug === g.slug
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tournament..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black uppercase text-slate-900 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Active & Upcoming Tournaments ({filteredTournaments.length})</span>
          </h2>
        </div>

        {filteredTournaments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 space-y-2 shadow-sm">
            <Trophy className="mx-auto h-12 w-12 text-slate-300 mb-2" />
            <h3 className="font-display text-base font-black uppercase text-slate-900">
              No Tournaments Found
            </h3>
            <p className="text-xs text-slate-500">
              Try adjusting your filter or search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTournaments.map((tourney) => {
              const isLive = tourney.status === "LIVE";
              const teamCount = (tourney as any).teams?.[0]?.count || 0;
              const matchCount = (tourney as any).matches?.[0]?.count || 0;

              return (
                <Link
                  key={tourney.id}
                  href={`/tournament/${tourney.slug}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
                          {tourney.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={tourney.logo_url}
                              alt={tourney.name}
                              className="h-full w-full object-cover rounded-xl"
                            />
                          ) : (
                            <Trophy className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-display text-base font-black uppercase text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {tourney.name}
                          </h3>
                          <span className="text-xs font-bold text-slate-500">
                            {tourney.game?.name || "BGMI"} • <span className="text-blue-600 font-mono">{tourney.format || "SQUAD"}</span>
                          </span>
                        </div>
                      </div>

                      {isLive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-black uppercase text-red-600 animate-pulse">
                          <Radio className="h-3 w-3" /> LIVE
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                          {tourney.status}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {tourney.description || "Live official leaderboard, match-by-match standings, and points scorecard."}
                    </p>
                  </div>

                  {/* Footer Metrics */}
                  <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3 font-mono">
                      <span>{teamCount} Teams</span>
                      <span>•</span>
                      <span>{matchCount} Matches</span>
                    </div>

                    <span className="flex items-center gap-1 font-black uppercase text-blue-600 group-hover:translate-x-1 transition-transform">
                      <span>Scorecard</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
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
