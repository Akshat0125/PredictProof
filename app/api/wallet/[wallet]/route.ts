import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  request: Request,
  { params }: { params: { wallet: string } }
) {
  try {
    const { wallet } = params;

    if (!wallet || typeof wallet !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'wallet' parameter" },
        { status: 400 }
      );
    }

    // 1. Fetch the wallet row to get points_balance (defaults to 100 if not yet created)
    const { data: walletRow, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("points_balance")
      .eq("wallet_address", wallet)
      .maybeSingle();

    if (walletError) {
      console.error("Error fetching wallet:", walletError);
      return NextResponse.json({ error: walletError.message }, { status: 500 });
    }

    const pointsBalance = walletRow ? walletRow.points_balance : 100;

    // 2. Fetch all predictions for this wallet joined with test_markets
    const { data: predictions, error: predictionsError } = await supabaseAdmin
      .from("predictions")
      .select(`
        id,
        wallet_address,
        market_id,
        side,
        points_delta,
        created_at,
        test_markets (
          id,
          title,
          category,
          resolved,
          winning_side
        )
      `)
      .eq("wallet_address", wallet)
      .order("created_at", { ascending: true });

    if (predictionsError) {
      console.error("Error fetching predictions:", predictionsError);
      return NextResponse.json(
        { error: predictionsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        pointsBalance,
        predictions: predictions || [],
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected error in wallet API route:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
