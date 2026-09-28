import fs from "fs";
import os from "os";
import path from "path";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { getEventAttendanceNftProgram } from "../lib/event-attendance-nft-exports";

// Configuration for the 4 reputation badge tiers
const BADGE_TIERS = [
  {
    key: "bronze",
    name: "PredictProof Bronze",
    badgeFile: "bronze.json",
  },
  {
    key: "silver",
    name: "PredictProof Silver",
    badgeFile: "silver.json",
  },
  {
    key: "gold",
    name: "PredictProof Gold",
    badgeFile: "gold.json",
  },
  {
    key: "underdog",
    name: "PredictProof Underdog",
    badgeFile: "underdog.json",
  },
];

async function main() {
  console.log("==========================================================");
  console.log("      PREDICTPROOF — BADGE TIER ON-CHAIN SETUP SCRIPT      ");
  console.log("==========================================================\n");

  // 1. Load deployer keypair from ~/.config/solana/id.json
  const idPath = path.join(os.homedir(), ".config", "solana", "id.json");
  if (!fs.existsSync(idPath)) {
    throw new Error(`Solana deployer keypair not found at: ${idPath}`);
  }

  const rawKeypair = JSON.parse(fs.readFileSync(idPath, "utf-8"));
  const deployerKeypair = Keypair.fromSecretKey(new Uint8Array(rawKeypair));
  console.log(`Deployer Wallet: ${deployerKeypair.publicKey.toBase58()}`);

  // 2. Setup connection and Anchor provider
  const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const connection = new Connection(rpcUrl, "confirmed");
  const balance = await connection.getBalance(deployerKeypair.publicKey);
  console.log(`Cluster: Devnet (${rpcUrl})`);
  console.log(`Balance: ${(balance / 1e9).toFixed(4)} SOL\n`);

  if (balance < 0.05 * 1e9) {
    console.warn("⚠️ Warning: Deployer balance is low. Airdrop SOL with: solana airdrop 1 --url devnet\n");
  }

  const wallet = new Wallet(deployerKeypair);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  const program = getEventAttendanceNftProgram(provider);
  console.log(`Program ID: ${program.programId.toBase58()}\n`);

  // Production base URL for badge metadata JSON
  const baseUrl = (process.env.PRODUCTION_URL || "https://predictproof.vercel.app").replace(/\/$/, "");
  console.log(`Base Metadata URL: ${baseUrl}\n`);

  const results: Record<string, { name: string; pda: string; badgeUri: string }> = {};

  // 3. Register each tier on-chain via create_event
  for (const tier of BADGE_TIERS) {
    const badgeUri = `${baseUrl}/badges/${tier.badgeFile}`;

    // Derive Event PDA: [b"event", organizer.key(), name.as_bytes()]
    const [eventPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("event"),
        deployerKeypair.publicKey.toBuffer(),
        Buffer.from(tier.name),
      ],
      program.programId
    );

    console.log(`--- Setting up Tier: ${tier.name} ---`);
    console.log(`  PDA: ${eventPda.toBase58()}`);
    console.log(`  URI: ${badgeUri}`);

    // Check if account already exists
    const accountInfo = await connection.getAccountInfo(eventPda);
    if (accountInfo) {
      console.log(`  Status: Account already initialized on-chain. Skipping initialization.`);
    } else {
      console.log(`  Submitting create_event transaction...`);
      try {
        const tx = await program.methods
          .createEvent(tier.name, badgeUri)
          .accounts({
            organizer: deployerKeypair.publicKey,
            event: eventPda,
            systemProgram: SystemProgram.programId,
          } as any)
          .rpc();
        console.log(`  Status: Successfully created on-chain! Tx: ${tx}`);
      } catch (err) {
        console.error(`  Error creating event for tier ${tier.name}:`, err);
        throw err;
      }
    }

    results[tier.key] = {
      name: tier.name,
      pda: eventPda.toBase58(),
      badgeUri,
    };
    console.log("");
  }

  console.log("==========================================================");
  console.log("                 BADGE TIER SETUP COMPLETE                ");
  console.log("==========================================================\n");
  console.log("Paste these 4 PDA addresses into /lib/badge-config.ts:\n");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error("Fatal error during setup:", err);
  process.exit(1);
});
