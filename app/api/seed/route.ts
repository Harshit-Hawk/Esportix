import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { seedDatabase } from "@/lib/seed-data";

export async function GET() {
  try {
    const supabase = createServerClient();
    const result = await seedDatabase(supabase);
    return NextResponse.json({ message: "Seed successful", result });
  } catch (err: any) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: err.message || "Seed failed" }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
