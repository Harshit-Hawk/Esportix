import { localClient, LocalSupabaseClient } from "@/lib/local-db/client";

export function createBrowserClient(): LocalSupabaseClient {
  return localClient;
}

export const supabase = localClient as any;
