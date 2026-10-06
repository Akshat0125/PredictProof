"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PantaMarket } from "@/lib/panta-client";
import { MarketCard } from "./MarketCard";
import { Navbar } from "./Navbar";
import {
  AlertTriangleIcon,
  LayersIcon,
  HexCheckIcon,
  MedalRibbonIcon,
  LightningIcon,
} from "@/components/icons";

interface MarketFeedProps {
  initialMarkets: PantaMarket[];
  disclaimer?: string;
  isMockFallback?: boolean;
}

export function MarketFeed({
  initialMarkets,
  disclaimer,
  isMockFallback,
}: MarketFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredMarkets = useMemo(() => {
    if (selectedCategory === "All") {
      return initialMarkets;
    }
    return initialMarkets.filter(
      (m) => m.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [initialMarkets, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117]">
      {/* Sticky Top Navbar */}
      <Navbar
        activeCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Hero / Header Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#21262d]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase text-blue-400">
                Panta Live Markets Feed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f0f6fc] tracking-tight">
              Prediction Market Reputation
            </h1>
            <p className="text-xs sm:text-sm text-[#8b949e] mt-1 max-w-2xl">
              Track prediction markets powered by the Panta API, build your predictor accuracy score,
              and mint soulbound Solana NFT badges to showcase verified track records.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-[#161b22] border border-[#30363d] px-3.5 py-2 rounded-xl text-xs text-[#8b949e]">
            <div className="flex items-center gap-1.5 text-[#f0f6fc]">
              <LayersIcon className="w-4 h-4 text-blue-400" />
              <span className="font-semibold">{initialMarkets.length}</span>
              <span className="text-[#8b949e]">Market{initialMarkets.length === 1 ? "" : "s"}</span>
            </div>
            <span className="text-[#30363d]">|</span>
            <div className="flex items-center gap-1 text-blue-400">
              <LightningIcon className="w-3.5 h-3.5" />
              <span>Live Binary Odds</span>
            </div>
          </div>
        </section>

        {/* Disclaimer / Sandbox Test Mode Notice */}
        {disclaimer && (
          <div className="bg-[#161b22] border border-amber-500/30 text-amber-200/90 px-4 py-3 rounded-xl flex items-start gap-3 text-xs sm:text-sm">
            <AlertTriangleIcon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-300">
                {isMockFallback ? "Panta Local Fixture Mode" : "Panta Sandbox Fixture Mode"}
              </p>
              <p className="text-[#8b949e]">
                {disclaimer}.
                {isMockFallback && " Add PANTA_API_KEY to .env.local to query the live Panta API."}
              </p>
            </div>
          </div>
        )}

        {/* Selected Category Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#f0f6fc]">
              {selectedCategory === "All" ? "Featured Markets" : `${selectedCategory} Markets`}
            </h2>
            <span className="text-xs text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded-full font-mono">
              {filteredMarkets.length}
            </span>
          </div>
        </div>

        {/* Market Grid: 1 col mobile, 2 tablet, 3-4 desktop */}
        {filteredMarkets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.marketId} market={market} />
            ))}
          </div>
        ) : (
          /* Empty Filter State */
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#21262d] flex items-center justify-center mx-auto text-[#8b949e]">
              <LayersIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#f0f6fc]">
              No markets found in &ldquo;{selectedCategory}&rdquo;
            </h3>
            <p className="text-xs sm:text-sm text-[#8b949e] max-w-sm mx-auto">
              There are currently no sandbox markets available in this category.
            </p>
            <button
              onClick={() => setSelectedCategory("All")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-medium transition-colors"
            >
              Reset to All Markets
            </button>
          </div>
        )}

        {/* Phase 2 Feature Teasers (Leaderboard & Soulbound Badges preview section) */}
        <section id="leaderboard" className="pt-8 mt-12 border-t border-[#21262d]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Reputation Scoring Preview */}
            <Link
              href="/leaderboard"
              className="bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] hover:border-yellow-500/40 rounded-xl p-5 space-y-2.5 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-yellow-400">
                  <MedalRibbonIcon className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Predictor Rankings</span>
                </div>
                <span className="text-xs text-yellow-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  View Board →
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-yellow-300 transition-colors">
                Predictor Accuracy Scoring & Leaderboard
              </h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Aggregates predictor outcomes across resolved markets to calculate real Brier scores,
                win percentages, and rank wallets transparently on-chain.
              </p>
            </Link>

            {/* Soulbound Badges Preview */}
            <Link
              href="/profile"
              className="bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] hover:border-blue-500/40 rounded-xl p-5 space-y-2.5 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-400">
                  <HexCheckIcon className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Soulbound NFT Badges</span>
                </div>
                <span className="text-xs text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  View Badges →
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-blue-300 transition-colors">
                Non-Transferable On-Chain Badges
              </h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Top predictors mint verifiable soulbound NFT credentials on Solana devnet via
                our Anchor program, establishing durable prediction market reputation.
              </p>
            </Link>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#21262d] py-6 mt-12 bg-[#0b0e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8b949e]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">PredictProof</span>
            <span>•</span>
            <span>Colosseum Crypto World&apos;s Fair (Panta API Sidetrack)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Panta API v1</span>
            <span>Solana Devnet</span>
            <span className="text-blue-400 font-mono">BMwNMcr...bafz</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
