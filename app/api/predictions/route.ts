export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet, marketId, side } = body;

    if (!wallet || typeof wallet !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'wallet' parameter" },
        { status: 400 }
      );
    }

    if (!marketId || typeof marketId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'marketId' parameter" },
        { status: 400 }
      );
    }

    if (side !== "YES" && side !== "NO") {
      return NextResponse.json(
        { error: "Invalid 'side' parameter. Must be 'YES' or 'NO'" },
        { status: 400 }
      );
    }

    // 1. Upsert wallet into `wallets` table (default 100 points, ignore if exists)
    const { error: walletError } = await supabaseAdmin.from("wallets").upsert(
      { wallet_address: wallet },
      { onConflict: "wallet_address", ignoreDuplicates: true }
    );

    if (walletError) {
      console.error("Error upserting wallet:", walletError);
      return NextResponse.json({ error: walletError.message }, { status: 500 });
    }

    // 2. Verify target market exists and is unresolved
    const { data: market, error: marketError } = await supabaseAdmin
      .from("test_markets")
      .select("id, resolved")
      .eq("id", marketId)
      .maybeSingle();

    if (marketError) {
      console.error("Error querying market:", marketError);
      return NextResponse.json({ error: marketError.message }, { status: 500 });
    }

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    if (market.resolved) {
      return NextResponse.json(
        { error: "Market already resolved" },
        { status: 400 }
      );
    }

    // 3. Pre-check if already predicted on this market
    const { data: existingPrediction } = await supabaseAdmin
      .from("predictions")
      .select("id")
      .eq("wallet_address", wallet)
      .eq("market_id", marketId)
      .maybeSingle();

    if (existingPrediction) {
      return NextResponse.json(
        { error: "Already predicted on this market" },
        { status: 409 }
      );
    }

    // 4. Insert into predictions table
    const { data: prediction, error: insertError } = await supabaseAdmin
      .from("predictions")
      .insert({
        wallet_address: wallet,
        market_id: marketId,
        side,
      })
      .select()
      .single();

    if (insertError) {
      if (
        insertError.code === "23505" ||
        insertError.message?.toLowerCase().includes("unique") ||
        insertError.message?.toLowerCase().includes("duplicate")
      ) {
        return NextResponse.json(
          { error: "Already predicted on this market" },
          { status: 409 }
        );
      }

      console.error("Error creating prediction:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(prediction, { status: 200 });
  } catch (err) {
    console.error("Unexpected error in predictions API route:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
