import { localClient, LocalSupabaseClient } from "@/lib/local-db/client";

export function createServerClient(): LocalSupabaseClient {
  return localClient;
}

export const supabaseServer = localClient as any;
