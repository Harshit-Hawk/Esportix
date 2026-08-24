"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

interface RealtimeState {
  isConnected: boolean;
  lastUpdated: Date | null;
  updateCount: number;
  lastTableUpdated: string | null;
}

export function useTournamentRealtime(
  tournamentId: string | undefined,
  onUpdate?: () => void
) {
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    lastUpdated: new Date(),
    updateCount: 0,
    lastTableUpdated: null,
  });

  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!tournamentId) return;

    const handlePayload = (tableName: string) => {
      setState((prev) => ({
        ...prev,
        lastUpdated: new Date(),
        updateCount: prev.updateCount + 1,
        lastTableUpdated: tableName,
      }));
      onUpdateRef.current?.();
    };

    // Create Realtime channel for all tournament entities
    const channel = supabase
      .channel(`tournament-realtime-${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_results",
        },
        () => handlePayload("match_results")
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => handlePayload("matches")
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournaments",
          filter: `id=eq.${tournamentId}`,
        },
        () => handlePayload("tournaments")
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teams",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => handlePayload("teams")
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scoring_rules",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => handlePayload("scoring_rules")
      )
      .subscribe((status) => {
        setState((prev) => ({
          ...prev,
          isConnected: status === "SUBSCRIBED",
        }));
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId]);

  return state;
}
