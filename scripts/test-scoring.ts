import resolvedMarketsData from "../lib/mock-data/resolved-markets.json";
import {
  groupPositionsByWallet,
  scoreWallet,
  rankWallets,
  getBadgeTier,
  ResolvedMarket,
} from "../lib/scoring";

const resolvedMarkets = resolvedMarketsData as ResolvedMarket[];

console.log("=================================================");
console.log("       PREDICTPROOF SCORING ENGINE TEST          ");
console.log("=================================================\n");

// Test 1: groupPositionsByWallet
console.log("--- TEST 1: groupPositionsByWallet ---");
const grouped = groupPositionsByWallet(resolvedMarkets);
console.log(`Unique wallets found: ${Object.keys(grouped).length}`);
for (const [wallet, positions] of Object.entries(grouped)) {
  console.log(`  Wallet: ${wallet.slice(0, 6)}...${wallet.slice(-4)} -> ${positions.length} positions`);
}
console.log("");

// Test 2: scoreWallet for a specific wallet
console.log("--- TEST 2: scoreWallet breakdown for Top Predictor ---");
const topWallet = Object.keys(grouped)[0];
const topScore = scoreWallet(topWallet, grouped[topWallet]);
console.log("Top Wallet Score Details:", {
  wallet: `${topScore.wallet.slice(0, 6)}...${topScore.wallet.slice(-4)}`,
  totalPicks: topScore.totalPicks,
  correctPicks: topScore.correctPicks,
  accuracyPct: `${topScore.accuracyPct}%`,
  underdogBonus: topScore.underdogBonus,
  currentStreak: topScore.currentStreak,
  totalScore: topScore.totalScore,
  badgeTier: topScore.badgeTier,
  badges: topScore.badges,
});
console.log("");

// Test 3: Underdog badge check
console.log("--- TEST 3: Underdog Badge Evaluation ---");
const underdogTestWallet = Object.keys(grouped).find((w) =>
  grouped[w].some((p) => p.isCorrect && parseFloat(p.priceAtEntry) <= 0.15)
);
if (underdogTestWallet) {
  const underdogScore = scoreWallet(underdogTestWallet, grouped[underdogTestWallet]);
  console.log(`Wallet with <= 0.15 entry: ${underdogTestWallet.slice(0, 6)}...${underdogTestWallet.slice(-4)}`);
  console.log(`  Has Underdog Pick: ${underdogScore.hasUnderdogPick}`);
  console.log(`  Badge Tier: ${underdogScore.badgeTier}`);
  console.log(`  All Badges: ${JSON.stringify(underdogScore.badges)}`);
  console.log(`  Underdog Bonus Earned: +${underdogScore.underdogBonus}`);
}
console.log("");

// Test 4: rankWallets
console.log("--- TEST 4: rankWallets (Full Leaderboard) ---");
const leaderboard = rankWallets(resolvedMarkets);
console.table(
  leaderboard.map((item, index) => ({
    Rank: index + 1,
    Wallet: `${item.wallet.slice(0, 6)}...${item.wallet.slice(-4)}`,
    Picks: `${item.correctPicks}/${item.totalPicks}`,
    "Accuracy%": `${item.accuracyPct}%`,
    Streak: item.currentStreak,
    "Underdog+": `+${item.underdogBonus}`,
    Badge: item.badgeTier.toUpperCase(),
    "Total Score": item.totalScore,
  }))
);

console.log("\n=================================================");
console.log("       SCORING TESTS COMPLETED SUCCESSFULLY      ");
console.log("=================================================");
