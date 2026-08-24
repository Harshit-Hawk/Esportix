"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Tournament, Game } from "@/types/database";
import {
  Trophy,
  Search,
  ArrowRight,
  ShieldCheck,
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Minimal Hero */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-4">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            <span>Esports Tournament Scoring Engine</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
            Live Leaderboards & Tournament Management
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            Professional scoring rules, multi-tier tie breakers, dynamic matches, and real-time standings for competitive esports tournaments.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {featuredLive && (
              <Link
                href={`/tournament/${featuredLive.slug}`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                <span>View Live Scorecard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
              <span>Organizer Portal</span>
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
              "rounded-lg px-3 py-1.5 transition-colors",
              selectedGameSlug === "all"
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            All Games
          </button>
          {games.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGameSlug(g.slug)}
              className={cn(
                "rounded-lg px-3 py-1.5 transition-colors",
                selectedGameSlug === g.slug
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tournament..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Tournaments ({filteredTournaments.length})
          </h2>
        </div>

        {filteredTournaments.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 space-y-1 shadow-sm">
            <h3 className="font-semibold text-slate-900 text-sm">No Tournaments Found</h3>
            <p className="text-xs text-slate-500">Try adjusting your filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTournaments.map((tourney) => {
              const isLive = tourney.status === "LIVE";
              const teamCount = (tourney as any).teams?.[0]?.count || 0;
              const matchCount = (tourney as any).matches?.[0]?.count || 0;

              return (
                <Link
                  key={tourney.id}
                  href={`/tournament/${tourney.slug}`}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 hover:shadow transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                            {tourney.name}
                          </h3>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {tourney.game?.name || "Game"} • <span className="text-slate-700 font-semibold">{tourney.format || "SQUAD"}</span>
                        </span>
                      </div>

                      {isLive ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 border border-red-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-600" /> Live
                        </span>
                      ) : (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {tourney.status}
                        </span>
                      )}
                    </div>

                    {tourney.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {tourney.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
                    <div className="font-mono text-[11px]">
                      <span>{teamCount} Teams</span>
                      <span className="mx-1.5">•</span>
                      <span>{matchCount} Matches</span>
                    </div>

                    <span className="font-medium text-blue-600 flex items-center gap-0.5">
                      <span>View</span>
                      <ChevronRight className="h-3.5 w-3.5" />
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
