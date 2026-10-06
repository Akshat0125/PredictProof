"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  BadgeMedalIcon,
  TrophyIcon,
  CoinFlipIcon,
  TrendingChartIcon,
  CrosshairIcon,
} from "@/components/icons";
import { WalletButton } from "./WalletButton";

interface NavbarProps {
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
  showCategories?: boolean;
}

const CATEGORIES = [
  "All",
  "Crypto",
  "Politics",
  "Sports",
  "Tech",
  "Culture",
  "Economy",
];

export function Navbar({
  activeCategory = "All",
  onSelectCategory,
  showCategories = true,
}: NavbarProps) {
  const pathname = usePathname();
  const { publicKey, connected } = useWallet();
  const [selected, setSelected] = useState(activeCategory);
  const [pointsBalance, setPointsBalance] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchPoints() {
      if (connected && publicKey) {
        try {
          const res = await fetch(`/api/wallet/${publicKey.toBase58()}`);
          if (res.ok) {
            const data = await res.json();
            if (isMounted && typeof data.pointsBalance === "number") {
              setPointsBalance(data.pointsBalance);
            }
          }
        } catch (err) {
          console.error("Failed to load points balance:", err);
        }
      } else {
        if (isMounted) {
          setPointsBalance(null);
        }
      }
    }

    fetchPoints();
    return () => {
      isMounted = false;
    };
  }, [connected, publicKey]);

  const handleSelect = (category: string) => {
    setSelected(category);
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  const isPredict = pathname === "/predict";
  const isLeaderboard = pathname === "/leaderboard";
  const isProfile = pathname.startsWith("/profile");

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0d1117]/90 border-b border-[#21262d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <BadgeMedalIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                  PredictProof
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Panta
                  </span>
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation / Category Filter */}
          {showCategories ? (
            <div className="flex-1 max-w-2xl mx-1 sm:mx-2 overflow-x-auto no-scrollbar py-1">
              <nav className="flex items-center gap-1.5 whitespace-nowrap" aria-label="Categories">
                {CATEGORIES.map((cat) => {
                  const isActive = selected === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelect(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                        isActive
                          ? "bg-[#21262d] text-white border border-[#30363d] shadow-sm"
                          : "text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </nav>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 sm:gap-4">
              <Link
                href="/"
                className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === "/"
                    ? "bg-[#21262d] text-white border border-[#30363d]"
                    : "text-[#8b949e] hover:text-white hover:bg-[#161b22]"
                }`}
              >
                <TrendingChartIcon className="w-4 h-4 text-blue-400" />
                <span>Markets</span>
              </Link>
              <Link
                href="/predict"
                className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  isPredict
                    ? "bg-[#21262d] text-white border border-[#30363d]"
                    : "text-[#8b949e] hover:text-white hover:bg-[#161b22]"
                }`}
              >
                <CrosshairIcon className="w-4 h-4 text-blue-400" />
                <span>Predict</span>
              </Link>
              <Link
                href="/leaderboard"
                className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  isLeaderboard
                    ? "bg-[#21262d] text-white border border-[#30363d]"
                    : "text-[#8b949e] hover:text-white hover:bg-[#161b22]"
                }`}
              >
                <TrophyIcon className="w-4 h-4 text-yellow-500" />
                <span>Leaderboard</span>
              </Link>
              <Link
                href="/profile"
                className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  isProfile
                    ? "bg-[#21262d] text-white border border-[#30363d]"
                    : "text-[#8b949e] hover:text-white hover:bg-[#161b22]"
                }`}
              >
                <CoinFlipIcon className="w-4 h-4 text-blue-400" />
                <span>My Profile</span>
              </Link>
            </div>
          )}

          {/* Right Navigation & Solana Wallet Connect */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {showCategories && (
              <>
                <Link
                  href="/predict"
                  className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                    isPredict
                      ? "bg-[#21262d] text-white border border-[#30363d]"
                      : "text-[#8b949e] hover:text-white hover:bg-[#161b22]"
                  }`}
                >
                  <CrosshairIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Predict</span>
                </Link>
                <Link
                  href="/leaderboard"
                  className="hidden md:flex items-center gap-1.5 text-xs font-medium text-[#8b949e] hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-[#161b22] transition-colors"
                >
                  <TrophyIcon className="w-3.5 h-3.5 text-yellow-500" />
                  <span>Leaderboard</span>
                </Link>
                <Link
                  href="/profile"
                  className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-[#8b949e] hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-[#161b22] transition-colors"
                >
                  <CoinFlipIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Profile</span>
                </Link>
              </>
            )}

            {/* Points Balance Pill */}
            {connected && pointsBalance !== null && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono text-xs font-bold shadow-sm">
                <span className="text-[10px] text-blue-400 uppercase">Pts</span>
                <span>{pointsBalance}</span>
              </div>
            )}

            {/* Live Devnet Solana Wallet Multi Button */}
            <WalletButton />
          </div>

        </div>
      </div>
    </header>
  );
}
