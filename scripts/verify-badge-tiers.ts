import fs from "fs";
import os from "os";
import path from "path";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { getEventAttendanceNftProgram } from "../lib/event-attendance-nft-exports";

// The 4 known Event PDAs to verify (v2 events with hyphenated domain)
const KNOWN_BADGE_PDAS = [
  {
    tier: "bronze",
    pda: new PublicKey("DBnXQPhYk4MmvNaysZ5Tx5F9NSo4AbiMAsbPdgPVJy2i"),
  },
  {
    tier: "silver",
    pda: new PublicKey("7QuyyoF7RLmmWNDqBcN5PCgYdHSsM3ukhxJeSqRhdVZH"),
  },
  {
    tier: "gold",
    pda: new PublicKey("ARYbqTjn5KrsNj6MgZDoJHoKqsfxYgz6v2Y5WhKbZnxH"),
  },
  {
    tier: "underdog",
    pda: new PublicKey("YFcNVPXtPmwxT3rARz4FHhSxXmvunGZ3jZ5zkFVU9Wb"),
  },
];

async function main() {
  console.log("==========================================================");
  console.log("    PREDICTPROOF — VERIFY ON-CHAIN BADGE TIERS (READ-ONLY)");
  console.log("==========================================================\n");

  // 1. Load deployer keypair from ~/.config/solana/id.json (same as setup-badge-tiers.ts)
  const idPath = path.join(os.homedir(), ".config", "solana", "id.json");
  if (!fs.existsSync(idPath)) {
    throw new Error(`Solana deployer keypair not found at: ${idPath}`);
  }

  const rawKeypair = JSON.parse(fs.readFileSync(idPath, "utf-8"));
  const deployerKeypair = Keypair.fromSecretKey(new Uint8Array(rawKeypair));
  console.log(`Deployer Wallet: ${deployerKeypair.publicKey.toBase58()}`);

  // 2. Setup connection and Anchor provider (same as setup-badge-tiers.ts)
  const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const connection = new Connection(rpcUrl, "confirmed");
  const balanceBefore = await connection.getBalance(deployerKeypair.publicKey);
  console.log(`Cluster: Devnet (${rpcUrl})`);
  console.log(`Initial Balance: ${(balanceBefore / 1e9).toFixed(6)} SOL\n`);

  const wallet = new Wallet(deployerKeypair);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  // 3. Get typed program via getEventAttendanceNftProgram
  const program = getEventAttendanceNftProgram(provider);
  console.log(`Program ID: ${program.programId.toBase58()}\n`);

  console.log("Fetching on-chain Event accounts (read-only calls)...\n");

  // 4. Fetch and display each known PDA
  for (const item of KNOWN_BADGE_PDAS) {
    const eventAccount = await program.account.event.fetch(item.pda);
    const badgeUri = eventAccount.badgeUri ?? (eventAccount as any).badge_uri;

    console.log(`--- [${item.tier.toUpperCase()}] ---`);
    console.log(`  Tier Name:    ${item.tier}`);
    console.log(`  Event Name:   ${eventAccount.name}`);
    console.log(`  PDA Address:  ${item.pda.toBase58()}`);
    console.log(`  badgeUri:     ${badgeUri}`);
    console.log(`  Organizer:    ${eventAccount.organizer.toBase58()}`);
    console.log(`  Attendees:    ${eventAccount.attendeeCount}`);
    console.log(`  Bump:         ${eventAccount.bump}\n`);
  }

  // 5. Confirm read-only status: no SOL spent, no balance changes, no transactions sent
  const balanceAfter = await connection.getBalance(deployerKeypair.publicKey);
  console.log("==========================================================");
  console.log("               READ-ONLY AUDIT CONFIRMATION               ");
  console.log("==========================================================");
  console.log(`Transactions Sent:     0`);
  console.log(`Signatures Submitted:  0`);
  console.log(`Balance Before:        ${(balanceBefore / 1e9).toFixed(6)} SOL`);
  console.log(`Balance After:         ${(balanceAfter / 1e9).toFixed(6)} SOL`);
  console.log(`SOL Spent:             ${((balanceBefore - balanceAfter) / 1e9).toFixed(6)} SOL`);
  console.log(`Accounts Modified:     None (read-only getAccountInfo RPC)\n`);
}

main().catch((err) => {
  console.error("Fatal error during verification:", err);
  process.exit(1);
});
