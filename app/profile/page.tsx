"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Navbar } from "@/components/Navbar";
import { WalletButton } from "@/components/WalletButton";
import Link from "next/link";
import {
  SolanaWalletIcon,
  CoinFlipIcon,
  ShieldIcon,
  ArrowRightIcon,
  CrosshairIcon,
  TrophyIcon,
} from "@/components/icons";

const SAMPLE_WALLETS = [
  {
    address: "7xKXtg2CW37d97TXJSDpbD5jBkheTqA83TZRuJosgWp1",
    label: "Top Predictor (Silver Tier)",
    score: "14.40 pts",
    accuracy: "100%",
    icon: TrophyIcon,
    color: "text-amber-400",
  },
  {
    address: "9gWpQ4Mn7134kL5mNo9PqRsTuVwXyZ1234567890abcd",
    label: "Underdog Sniper (≤15¢ Winner)",
    score: "7.56 pts",
    accuracy: "66.7%",
    icon: CrosshairIcon,
    color: "text-fuchsia-400",
  },
  {
    address: "4vJ9JU1bJJE96FLSm75mUSDb38wZAUfKk8g8t6m1efgh",
    label: "Bronze Forecaster",
    score: "5.94 pts",
    accuracy: "80%",
    icon: ShieldIcon,
    color: "text-orange-400",
  },
];

export default function ProfileRootPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  // If wallet is connected, automatically redirect to its dedicated profile URL
  useEffect(() => {
    if (connected && publicKey) {
      router.push(`/profile/${publicKey.toBase58()}`);
    }
  }, [connected, publicKey, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#f0f6fc]">
      <Navbar showCategories={false} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
        
        {/* Connect Wallet Hero Box */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-700/10 blur-3xl pointer-events-none rounded-full" />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-700 flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
            <SolanaWalletIcon className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Connect Your Solana Wallet
            </h1>
            <p className="text-xs sm:text-sm text-[#8b949e]">
              Connect your wallet on <span className="text-blue-400 font-semibold">Solana Devnet</span> to load your
              prediction reputation metrics, check your streak, and view your soulbound badge status.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <WalletButton />
          </div>
        </div>

        {/* Demo / Sample Profiles */}
        <div className="space-y-4 pt-4">
          <div className="text-center space-y-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8b949e] flex items-center justify-center gap-1.5">
              <CoinFlipIcon className="w-4 h-4 text-blue-400" />
              Explore Sample Predictor Profiles
            </h2>
            <p className="text-xs text-[#6e7681]">
              Or select one of our active mock wallets to preview the reputation scoring and soulbound badge engine:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SAMPLE_WALLETS.map((sample) => {
              const IconComp = sample.icon;
              return (
                <Link
                  key={sample.address}
                  href={`/profile/${sample.address}`}
                  className="bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] hover:border-brand-500/50 rounded-2xl p-4 transition-all duration-200 group flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <IconComp className={`w-5 h-5 ${sample.color}`} />
                      <span className="text-[10px] font-mono text-[#8b949e] group-hover:text-white transition-colors">
                        {sample.address.slice(0, 4)}...{sample.address.slice(-4)}
                      </span>
                    </div>
                    <div className="font-semibold text-sm text-white group-hover:text-brand-300 transition-colors">
                      {sample.label}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#21262d] flex items-center justify-between text-xs font-mono">
                    <span className="text-blue-400 font-bold">{sample.accuracy} Acc</span>
                    <span className="text-white font-bold">{sample.score}</span>
                    <ArrowRightIcon className="w-3.5 h-3.5 text-[#6e7681] group-hover:translate-x-1 group-hover:text-white transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </main>

      <footer className="border-t border-[#21262d] py-6 mt-12 bg-[#0b0e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-[#8b949e]">
          PredictProof • Soulbound Reputation Engine on Solana Devnet
        </div>
      </footer>
    </div>
  );
}
