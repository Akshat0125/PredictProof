export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month");

    let year: number;
    let month: number;

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const parts = monthParam.split("-");
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      if (month < 1 || month > 12) {
        return NextResponse.json(
          { error: "Invalid month format. Expected YYYY-MM where MM is 01-12." },
          { status: 400 }
        );
      }
    } else {
      const now = new Date();
      year = now.getUTCFullYear();
      month = now.getUTCMonth() + 1;
    }

    const monthFormatted = `${year}-${String(month).padStart(2, "0")}`;
    const startIso = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)).toISOString();
    const endIso = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)).toISOString();

    const { data: predictions, error } = await supabaseAdmin
      .from("predictions")
      .select("wallet_address, points_delta, created_at")
      .not("points_delta", "is", null)
      .gte("created_at", startIso)
      .lt("created_at", endIso);

    if (error) {
      console.error("Error fetching monthly predictions:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const walletMap = new Map<
      string,
      { wallet: string; monthlyPoints: number; predictionsCount: number }
    >();

    for (const pred of predictions || []) {
      const w = pred.wallet_address;
      const delta = typeof pred.points_delta === "number" ? pred.points_delta : 0;
      const entry = walletMap.get(w) || {
        wallet: w,
        monthlyPoints: 0,
        predictionsCount: 0,
      };
      entry.monthlyPoints += delta;
      entry.predictionsCount += 1;
      walletMap.set(w, entry);
    }

    const leaderboard = Array.from(walletMap.values())
      .sort((a, b) => b.monthlyPoints - a.monthlyPoints)
      .slice(0, 20);

    return NextResponse.json({
      month: monthFormatted,
      leaderboard,
    });
  } catch (err) {
    console.error("Monthly leaderboard route error:", err);
    return NextResponse.json(
      { error: "Failed to generate monthly leaderboard" },
      { status: 500 }
    );
  }
}
