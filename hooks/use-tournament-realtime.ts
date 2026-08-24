"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

interface RealtimeState {
  isConnected: boolean;
  lastUpdated: Date | null;
  updateCount: number;
}

export function useTournamentRealtime(
  tournamentId: string | undefined,
  onUpdate?: () => void
) {
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    lastUpdated: new Date(),
    updateCount: 0,
  });

  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!tournamentId) return;

    // Create Realtime channel
    const channel = supabase
      .channel(`tournament-${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_results",
        },
        () => {
          setState((prev) => ({
            ...prev,
            lastUpdated: new Date(),
            updateCount: prev.updateCount + 1,
          }));
          onUpdateRef.current?.();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          setState((prev) => ({
            ...prev,
            lastUpdated: new Date(),
            updateCount: prev.updateCount + 1,
          }));
          onUpdateRef.current?.();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournaments",
          filter: `id=eq.${tournamentId}`,
        },
        () => {
          setState((prev) => ({
            ...prev,
            lastUpdated: new Date(),
            updateCount: prev.updateCount + 1,
          }));
          onUpdateRef.current?.();
        }
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
