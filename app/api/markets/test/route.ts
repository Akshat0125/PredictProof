import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: markets, error } = await supabaseAdmin
      .from("test_markets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching test markets:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ markets: markets || [] }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error in /api/markets/test:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
