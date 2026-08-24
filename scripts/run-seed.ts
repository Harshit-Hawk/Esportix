import { createServerClient } from "../lib/supabase/server";
import { seedDatabase } from "../lib/seed-data";

async function main() {
  console.log("Seeding database with BGMI Campus Showdown 2026...");
  const supabase = createServerClient();
  const res = await seedDatabase(supabase);
  console.log("Seed finished successfully:", res);
}

main().catch((err) => {
  console.error("Seed execution failed:", err);
  process.exit(1);
});
