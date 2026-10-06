import { supabaseAdmin } from "../lib/supabase-admin";
import { calculatePointsDelta } from "../lib/points-engine";

function truncateWallet(wallet: string): string {
  if (!wallet || wallet.length <= 12) return wallet;
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

async function main() {
  const marketId = process.argv[2];
  const winningSide = process.argv[3];

  if (!marketId || !winningSide) {
    console.error("Usage: npx tsx scripts/resolve-market.ts <marketId> <YES|NO>");
    process.exit(1);
  }

  if (winningSide !== "YES" && winningSide !== "NO") {
    console.error(`Invalid winningSide: "${winningSide}". Must be exactly "YES" or "NO" (case-sensitive).`);
    process.exit(1);
  }

  console.log("==========================================================");
  console.log("          PREDICTPROOF — RESOLVE MARKET SCRIPT             ");
  console.log("==========================================================\n");
  console.log(`Target Market ID: ${marketId}`);
  console.log(`Winning Outcome:  ${winningSide}\n`);

  // 1. Fetch market
  const { data: market, error: fetchMarketError } = await supabaseAdmin
    .from("test_markets")
    .select("*")
    .eq("id", marketId)
    .single();

  if (fetchMarketError || !market) {
    console.error(`Error fetching market: Market "${marketId}" does not exist.`);
    if (fetchMarketError) console.error("Details:", fetchMarketError);
    process.exit(1);
  }

  if (market.resolved) {
    console.error(`Market "${marketId}" (${market.title}) is already resolved with winning side: ${market.winning_side}.`);
    process.exit(1);
  }

  console.log(`Market Found: "${market.title}"`);
  console.log(`Current status: unresolved. Resolving with winning side: ${winningSide}...\n`);

  // 2. Update market to resolved = true, winning_side = winningSide
  const { error: updateMarketError } = await supabaseAdmin
    .from("test_markets")
    .update({
      resolved: true,
      winning_side: winningSide,
    })
    .eq("id", marketId);

  if (updateMarketError) {
    console.error("Failed to update market resolution status:", updateMarketError);
    process.exit(1);
  }

  console.log("✓ Market updated successfully on Supabase.\n");

  // 3. Fetch all predictions where market_id = marketId and points_delta is null
  const { data: predictions, error: fetchPredError } = await supabaseAdmin
    .from("predictions")
    .select("*")
    .eq("market_id", marketId)
    .is("points_delta", null);

  if (fetchPredError) {
    console.error("Failed to fetch predictions for this market:", fetchPredError);
    process.exit(1);
  }

  if (!predictions || predictions.length === 0) {
    console.log("No predictions to resolve for this market.");
    process.exit(0);
  }

  console.log(`Found ${predictions.length} unresolved prediction(s). Processing sequentially...\n`);

  interface SummaryRow {
    "Wallet": string;
    "Side Predicted": "YES" | "NO";
    "Correct": "YES" | "NO";
    "Delta Applied": string;
    "New Balance": number;
  }

  const summary: SummaryRow[] = [];

  for (const pred of predictions) {
    const side = pred.side as "YES" | "NO";
    const delta = calculatePointsDelta(side, winningSide);
    const isCorrect = side === winningSide ? "YES" : "NO";

    // Update prediction row points_delta
    const { error: predUpdateError } = await supabaseAdmin
      .from("predictions")
      .update({ points_delta: delta })
      .eq("id", pred.id);

    if (predUpdateError) {
      console.error(`Error updating prediction ${pred.id} for wallet ${pred.wallet_address}:`, predUpdateError);
      throw predUpdateError;
    }

    // Fetch wallet's current points_balance
    const { data: walletData, error: walletFetchError } = await supabaseAdmin
      .from("wallets")
      .select("points_balance")
      .eq("wallet_address", pred.wallet_address)
      .single();

    if (walletFetchError || !walletData) {
      console.error(`Error fetching wallet row for ${pred.wallet_address}:`, walletFetchError);
      throw walletFetchError;
    }

    const currentBalance = walletData.points_balance ?? 100;
    const newBalance = currentBalance + delta;

    // Update wallet points_balance
    const { error: walletUpdateError } = await supabaseAdmin
      .from("wallets")
      .update({ points_balance: newBalance })
      .eq("wallet_address", pred.wallet_address);

    if (walletUpdateError) {
      console.error(`Error updating balance for wallet ${pred.wallet_address}:`, walletUpdateError);
      throw walletUpdateError;
    }

    summary.push({
      "Wallet": truncateWallet(pred.wallet_address),
      "Side Predicted": side,
      "Correct": isCorrect,
      "Delta Applied": delta > 0 ? `+${delta}` : `${delta}`,
      "New Balance": newBalance,
    });
  }

  console.log("Resolution Summary:");
  console.table(summary);
  console.log("\nAll predictions resolved and wallet balances updated successfully.");
}

main().catch((err) => {
  console.error("Fatal error during market resolution:", err);
  process.exit(1);
});
