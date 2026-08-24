import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jmjpeohpgmyfdrxprtdc.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptanBlb2hwZ215ZmRyeHBydGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNzQ2NTcsImV4cCI6MjA5ODY1MDY1N30.8zECeGdZcOCc-nbrTAeHlVKItoqt1-cU73VIPhQHiAI";

export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}
