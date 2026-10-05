import { supabaseAdmin } from "../lib/supabase-admin";

const TEST_MARKETS_SEED = [
  {
    title: "Will Bitcoin exceed $120,000 before December 31, 2026?",
    category: "crypto",
  },
  {
    title: "Will Solana achieve a new all-time high above $260 in 2026?",
    category: "crypto",
  },
  {
    title: "Will the US Federal Reserve cut the federal funds rate at the next FOMC meeting?",
    category: "politics",
  },
  {
    title: "Will SpaceX successfully catch both the Super Heavy booster and Starship ship in 2026?",
    category: "tech",
  },
  {
    title: "Will India win the ICC World Test Championship Final?",
    category: "sports",
  },
  {
    title: "Will Apple announce a dedicated AI smart home display before end of Q2 2027?",
    category: "tech",
  },
];

async function main() {
  console.log("==========================================================");
  console.log("       PREDICTPROOF — SEED TEST MARKETS SCRIPT            ");
  console.log("==========================================================\n");

  console.log("Inserting 6 test markets into Supabase...\n");

  const { data, error } = await supabaseAdmin
    .from("test_markets")
    .insert(TEST_MARKETS_SEED)
    .select();

  if (error) {
    console.error("Error inserting test markets:", error);
    process.exit(1);
  }

  console.log(`Successfully seeded ${data.length} test markets:\n`);
  data.forEach((market, index) => {
    console.log(`${index + 1}. [${market.category.toUpperCase()}] ${market.title}`);
    console.log(`   UUID:       ${market.id}`);
    console.log(`   Resolved:   ${market.resolved}`);
    console.log(`   Created At: ${market.created_at}\n`);
  });
}

main().catch((err) => {
  console.error("Fatal error during seeding:", err);
  process.exit(1);
});
