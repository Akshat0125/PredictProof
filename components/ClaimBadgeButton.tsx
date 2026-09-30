"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { BADGE_TIER_CONFIGS } from "@/lib/badge-config";
import {
  getEventAttendanceNftProgram,
  EVENT_ATTENDANCE_NFT_PROGRAM_ID,
} from "@/lib/event-attendance-nft-exports";
import { BadgeTier } from "@/lib/scoring";
import {
  HexCheckIcon,
  ExternalLinkIcon,
  DashedSpinnerIcon,
  CoinFlipIcon,
  AlertTriangleIcon,
} from "@/components/icons";

const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

interface ClaimBadgeButtonProps {
  tier: Exclude<BadgeTier, "none">;
  walletPublicKey?: PublicKey | null;
}

export function ClaimBadgeButton({
  tier,
  walletPublicKey,
}: ClaimBadgeButtonProps) {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  const [checking, setChecking] = useState<boolean>(true);
  const [isClaimed, setIsClaimed] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tierConfig = BADGE_TIER_CONFIGS[tier];

  // Check if attendance_record account already exists on-chain
  const checkClaimStatus = useCallback(async () => {
    if (!walletPublicKey || !tierConfig?.pda) {
      setChecking(false);
      return;
    }

    try {
      setChecking(true);
      const eventPda = new PublicKey(tierConfig.pda);
      const [attendanceRecordPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("attendance"),
          eventPda.toBuffer(),
          walletPublicKey.toBuffer(),
        ],
        EVENT_ATTENDANCE_NFT_PROGRAM_ID
      );

      const accountInfo = await connection.getAccountInfo(attendanceRecordPda);
      setIsClaimed(accountInfo !== null);
    } catch (err) {
      console.error(`Error checking claim status for ${tier}:`, err);
    } finally {
      setChecking(false);
    }
  }, [connection, tier, tierConfig?.pda, walletPublicKey]);

  useEffect(() => {
    checkClaimStatus();
  }, [checkClaimStatus]);

  const handleClaim = async () => {
    if (!anchorWallet || !walletPublicKey) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }

    if (!tierConfig?.pda) {
      setErrorMessage("Badge tier configuration missing PDA.");
      return;
    }

    setIsClaiming(true);
    setErrorMessage(null);
    setTxSignature(null);

    try {
      const eventPda = new PublicKey(tierConfig.pda);

      // 1. Fresh mint Keypair generated client-side (must co-sign)
      const mintKeypair = Keypair.generate();

      // 2. Attendance Record PDA: [b"attendance", event.key(), attendee.key()]
      const [attendanceRecordPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("attendance"),
          eventPda.toBuffer(),
          walletPublicKey.toBuffer(),
        ],
        EVENT_ATTENDANCE_NFT_PROGRAM_ID
      );

      // 3. Mint Authority PDA: [b"mint_authority"]
      const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("mint_authority")],
        EVENT_ATTENDANCE_NFT_PROGRAM_ID
      );

      // 4. Token Account (ATA) for attendee
      const tokenAccountAta = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        walletPublicKey
      );

      // 5. Metaplex Metadata PDA: [b"metadata", metadata_program.key(), mint.key()]
      const [metadataPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          METADATA_PROGRAM_ID.toBuffer(),
          mintKeypair.publicKey.toBuffer(),
        ],
        METADATA_PROGRAM_ID
      );

      // Setup Anchor provider and typed program
      const provider = new AnchorProvider(connection, anchorWallet, {
        commitment: "confirmed",
      });
      const program = getEventAttendanceNftProgram(provider);

      // Submit check_in transaction with mintKeypair as co-signer
      const tx = await program.methods
        .checkIn()
        .accountsPartial({
          attendee: walletPublicKey,
          event: eventPda,
          attendanceRecord: attendanceRecordPda,
          mintAuthority: mintAuthorityPda,
          mint: mintKeypair.publicKey,
          tokenAccount: tokenAccountAta,
          metadata: metadataPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          metadataProgram: METADATA_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([mintKeypair])
        .rpc();

      setTxSignature(tx);
      setIsClaimed(true);
    } catch (err: unknown) {
      console.error("Badge mint transaction error:", err);
      const rawMsg = err instanceof Error ? err.message : String(err);
      if (rawMsg.includes("already in use") || rawMsg.includes("0x0")) {
        setIsClaimed(true);
        setErrorMessage("Badge has already been claimed on-chain.");
      } else if (rawMsg.includes("Attempt to debit an account but found no record")) {
        setErrorMessage("Devnet SOL needed for transaction fees. Airdrop SOL to your wallet.");
      } else {
        setErrorMessage(rawMsg.slice(0, 140));
      }
    } finally {
      setIsClaiming(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs text-[#8b949e] bg-[#21262d]/50 rounded-xl">
        <DashedSpinnerIcon className="w-3.5 h-3.5 animate-spin" />
        <span>Checking claim status...</span>
      </div>
    );
  }

  if (isClaimed) {
    return (
      <div className="space-y-1.5">
        <button
          disabled
          className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-default"
        >
          <HexCheckIcon className="w-3.5 h-3.5" />
          <span>Claimed ✓</span>
        </button>

        {txSignature && (
          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 font-mono transition-colors"
          >
            <span>View Mint Tx</span>
            <ExternalLinkIcon className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <button
        onClick={handleClaim}
        disabled={isClaiming || !anchorWallet}
        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/30 transition-all active:scale-[0.98]"
      >
        {isClaiming ? (
          <>
            <DashedSpinnerIcon className="w-3.5 h-3.5 animate-spin" />
            <span>Minting Soulbound NFT...</span>
          </>
        ) : (
          <>
            <CoinFlipIcon className="w-3.5 h-3.5" />
            <span>Claim Soulbound Badge</span>
          </>
        )}
      </button>

      {errorMessage && (
        <div className="flex items-start gap-1 text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
          <AlertTriangleIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span className="leading-tight">{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
