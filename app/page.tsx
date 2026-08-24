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
      <div className="relative overflow-hidden rounded-2xl border border-esports-navy-border bg-gradient-to-br from-esports-navy-dark via-esports-navy to-esports-navy-deep p-6 sm:p-10 shadow-2xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-esports-orange/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-esports-gold/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-esports-orange/40 bg-esports-orange/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-esports-orange">
            <Sparkles className="h-3.5 w-3.5 text-esports-gold" />
            <span>Collegiate & Pro Esports Scoring Platform</span>
          </div>

          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
            Tournament Scoring & <span className="text-esports-orange text-glow-orange">Live Leaderboard</span> Engine
          </h1>

          <p className="text-sm sm:text-base text-esports-silver max-w-2xl leading-relaxed">
            Broadcast-grade point calculations, customizable tie-breakers, real-time standings, and lightning-fast score entry for BGMI, Free Fire, Valorant, COD, and collegiate esports championships.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {featuredLive && (
              <Link
                href={`/tournament/${featuredLive.slug}`}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-esports-orange to-orange-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-esports-orange/25 hover:brightness-110 active:scale-95 transition-all"
              >
                <Radio className="h-4 w-4 animate-pulse" />
                <span>Watch Live Scorecard ({featuredLive.name.split(" ")[0]})</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            )}

            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-lg border border-esports-navy-border bg-esports-navy-light px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:border-esports-orange hover:bg-esports-navy-light/80 transition-all"
            >
              <ShieldCheck className="h-4 w-4 text-esports-gold" />
              <span>Admin Control Room</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-esports-navy-border bg-esports-navy-card p-5 shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-esports-orange/10 text-esports-orange mb-3 border border-esports-orange/20">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="font-display text-sm font-black uppercase text-white">Multi-Game Engine</h3>
          <p className="text-xs text-esports-silver mt-1">
            Presets & custom rules for BGMI (10pt/15pt), Free Fire, Valorant, and custom games.
          </p>
        </div>

        <div className="rounded-xl border border-esports-navy-border bg-esports-navy-card p-5 shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 mb-3 border border-emerald-500/20">
            <Radio className="h-5 w-5" />
          </div>
          <h3 className="font-display text-sm font-black uppercase text-white">Realtime Sync</h3>
          <p className="text-xs text-esports-silver mt-1">
            Scores entered by admins reflect instantly on spectator displays without page refresh.
          </p>
        </div>

        <div className="rounded-xl border border-esports-navy-border bg-esports-navy-card p-5 shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-esports-gold/10 text-esports-gold mb-3 border border-esports-gold/20">
            <Trophy className="h-5 w-5" />
          </div>
          <h3 className="font-display text-sm font-black uppercase text-white">Auto Tie-Breaker</h3>
          <p className="text-xs text-esports-silver mt-1">
            Configurable multi-tier priority rules: Total Pts &gt; Kills &gt; Place Pts &gt; WWCD &gt; Seed.
          </p>
        </div>

        <div className="rounded-xl border border-esports-navy-border bg-esports-navy-card p-5 shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 mb-3 border border-blue-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="font-display text-sm font-black uppercase text-white">Audit Logging</h3>
          <p className="text-xs text-esports-silver mt-1">
            Every point modification is logged with timestamps and admin user tracking for fairness.
          </p>
        </div>
      </div>

      {/* Tournaments Explorer */}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-esports-navy-border pb-4">
          <div>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
              Active & Upcoming Tournaments
            </h2>
            <p className="text-xs text-esports-silver mt-0.5">
              Select a tournament to view live leaderboard standings and match stats.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-esports-silver" />
            <input
              type="text"
              placeholder="Search tournaments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-esports-navy-border bg-esports-navy-card py-2 pl-9 pr-4 text-xs text-white placeholder-esports-silver/60 focus:border-esports-orange focus:outline-none"
            />
          </div>
        </div>

        {/* Game Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedGameSlug("all")}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all shrink-0",
              selectedGameSlug === "all"
                ? "bg-esports-orange text-white"
                : "bg-esports-navy-card text-esports-silver border border-esports-navy-border hover:text-white"
            )}
          >
            All Games
          </button>
          {games.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGameSlug(g.slug)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5",
                selectedGameSlug === g.slug
                  ? "bg-esports-orange text-white"
                  : "bg-esports-navy-card text-esports-silver border border-esports-navy-border hover:text-white"
              )}
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              <span>{g.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Tournaments Grid */}
        {filteredTournaments.length === 0 ? (
          <div className="rounded-xl border border-esports-navy-border bg-esports-navy-card p-12 text-center">
            <Trophy className="mx-auto h-12 w-12 text-esports-silver/40 mb-3" />
            <h3 className="font-display text-lg font-black uppercase text-white">No Tournaments Found</h3>
            <p className="text-xs text-esports-silver mt-1">
              Click &ldquo;Quick Seed Demo&rdquo; in the top bar to generate demo tournaments with 18 matches!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTournaments.map((tourney) => {
              const isLive = tourney.status === "LIVE";

              return (
                <Link
                  key={tourney.id}
                  href={`/tournament/${tourney.slug}`}
                  className="group flex flex-col justify-between overflow-hidden rounded-xl border border-esports-navy-border bg-esports-navy-card shadow-lg hover:border-esports-orange hover:shadow-esports-orange/10 transition-all"
                >
                  <div>
                    {/* Banner Image / Header */}
                    <div className="relative h-40 w-full overflow-hidden bg-esports-navy-dark">
                      {tourney.banner_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={tourney.banner_url}
                          alt={tourney.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-esports-navy-light/40">
                          <Trophy className="h-12 w-12 text-esports-orange/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-esports-navy-card via-black/40 to-transparent" />

                      {/* Status Badge */}
                      <div className="absolute left-3 top-3">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-600/90 px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-md animate-pulse">
                            <Radio className="h-3 w-3" />
                            LIVE NOW
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-esports-navy-dark/90 px-2.5 py-0.5 text-[10px] font-bold uppercase text-esports-silver border border-esports-navy-border">
                            {tourney.status}
                          </span>
                        )}
                      </div>

                      {/* Game Pill */}
                      <div className="absolute right-3 top-3">
                        <span className="rounded-md bg-esports-navy-dark/90 px-2 py-0.5 text-[10px] font-bold uppercase text-esports-cream border border-esports-navy-border">
                          {tourney.game?.name || "Esports"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2.5">
                      <h3 className="font-display text-lg font-black uppercase text-white group-hover:text-esports-orange transition-colors">
                        {tourney.name}
                      </h3>
                      <p className="text-xs text-esports-silver line-clamp-2">
                        {tourney.description || "Official tournament overall standings and points scorecard."}
                      </p>
                    </div>
                  </div>

                  {/* Footer Stats & CTA */}
                  <div className="border-t border-esports-navy-border/60 bg-esports-navy/60 p-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-esports-silver font-semibold">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-esports-orange" />
                        16 Teams
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-esports-gold" />
                        18 Matches
                      </span>
                    </div>

                    <span className="flex items-center gap-1 font-bold text-esports-orange group-hover:translate-x-1 transition-transform">
                      <span>View Board</span>
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
