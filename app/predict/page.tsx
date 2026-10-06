"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Navbar } from "@/components/Navbar";
import {
  PredictionCard,
  TestMarket,
  UserPrediction,
} from "@/components/PredictionCard";
import {
  DashedSpinnerIcon,
  CrosshairIcon,
} from "@/components/icons";

export default function PredictPage() {
  const { publicKey, connected } = useWallet();
  const walletAddress = connected && publicKey ? publicKey.toBase58() : null;

  const [markets, setMarkets] = useState<TestMarket[]>([]);
  const [predictions, setPredictions] = useState<UserPrediction[]>([]);
  const [pointsBalance, setPointsBalance] = useState<number>(100);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  // Load test markets
  const loadMarkets = useCallback(async () => {
    try {
      const res = await fetch("/api/markets/test");
      if (res.ok) {
        const data = await res.json();
        setMarkets(data.markets || []);
      }
    } catch (err) {
      console.error("Failed to load test markets:", err);
    }
  }, []);

  // Load user predictions & points balance
  const loadWalletData = useCallback(async (wallet: string) => {
    try {
      const res = await fetch(`/api/wallet/${wallet}`);
      if (res.ok) {
        const data = await res.json();
        setPredictions(data.predictions || []);
        if (typeof data.pointsBalance === "number") {
          setPointsBalance(data.pointsBalance);
        }
      }
    } catch (err) {
      console.error("Failed to load wallet data:", err);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await loadMarkets();
      if (walletAddress) {
        await loadWalletData(walletAddress);
      }
      setLoading(false);
    }
    init();
  }, [loadMarkets, loadWalletData, walletAddress]);

  // Map of market_id -> UserPrediction
  const predictionsByMarketId = useMemo(() => {
    const map = new Map<string, UserPrediction>();
    predictions.forEach((p) => {
      map.set(p.market_id, p);
    });
    return map;
  }, [predictions]);

  // Handle new prediction submitted
  const handlePredicted = (newPred: UserPrediction) => {
    setPredictions((prev) => {
      const filtered = prev.filter((p) => p.market_id !== newPred.market_id);
      return [...filtered, newPred];
    });
    if (walletAddress) {
      loadWalletData(walletAddress);
    }
  };

  const unresolvedMarkets = useMemo(
    () => markets.filter((m) => !m.resolved),
    [markets]
  );
  const resolvedMarkets = useMemo(
    () => markets.filter((m) => m.resolved),
    [markets]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#f0f6fc]">
      {/* Sticky Navbar */}
      <Navbar showCategories={false} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Prominent Demo Prediction Game Banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 text-blue-200 px-4 py-3.5 rounded-xl flex items-start sm:items-center gap-3 text-xs sm:text-sm font-medium shadow-md">
          <span className="flex h-2.5 w-2.5 relative shrink-0 mt-0.5 sm:mt-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          <span>
            <strong className="text-blue-300">Demo Prediction Game</strong> — practice predictions using sample questions for points only. Not a real Panta trade.
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#21262d]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CrosshairIcon className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold tracking-wider uppercase text-blue-400">
                Phase 4: Points Simulation Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f0f6fc] tracking-tight">
              Test Market Predictions
            </h1>
            <p className="text-xs sm:text-sm text-[#8b949e] mt-1 max-w-2xl">
              Stake your starting 100 points on simulated binary market questions. Make your picks to earn points and practice before trading live Panta prediction markets.
            </p>
          </div>

          {/* Quick Wallet Points Card */}
          <div className="bg-[#161b22] border border-[#30363d] px-4 py-3 rounded-xl flex items-center gap-4 self-start md:self-auto shrink-0 shadow-sm">
            <div>
              <span className="text-[10px] text-[#8b949e] block font-mono uppercase">
                Points Balance
              </span>
              <span className="text-xl font-bold font-mono text-blue-400">
                {connected ? `${pointsBalance} pts` : "100 pts"}
              </span>
            </div>
            <div className="border-l border-[#21262d] pl-4">
              <span className="text-[10px] text-[#8b949e] block font-mono uppercase">
                Picks Made
              </span>
              <span className="text-xl font-bold font-mono text-white">
                {connected ? predictions.length : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#8b949e]">
            <DashedSpinnerIcon className="w-8 h-8 animate-spin text-blue-400" />
            <span className="text-xs">Loading test prediction markets...</span>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Active / Unresolved Markets Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">
                    Active Demo Questions
                  </h2>
                  <span className="text-xs text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded-full font-mono">
                    {unresolvedMarkets.length}
                  </span>
                </div>
              </div>

              {unresolvedMarkets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {unresolvedMarkets.map((market) => (
                    <PredictionCard
                      key={market.id}
                      market={market}
                      connectedWallet={walletAddress}
                      initialPrediction={predictionsByMarketId.get(market.id)}
                      onPredicted={handlePredicted}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center text-[#8b949e] text-xs">
                  No active demo markets currently open.
                </div>
              )}
            </section>

            {/* Resolved Markets Collapsed/Secondary Section */}
            {resolvedMarkets.length > 0 && (
              <section className="pt-6 border-t border-[#21262d] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#8b949e]">
                      Resolved Questions
                    </h3>
                    <span className="text-xs text-[#6e7681] bg-[#21262d] px-2 py-0.5 rounded-full font-mono">
                      {resolvedMarkets.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowResolved((prev) => !prev)}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    <span>{showResolved ? "Hide Resolved" : "Show Resolved"}</span>
                    <span>{showResolved ? "↑" : "↓"}</span>
                  </button>
                </div>

                {showResolved && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pt-2">
                    {resolvedMarkets.map((market) => (
                      <PredictionCard
                        key={market.id}
                        market={market}
                        connectedWallet={walletAddress}
                        initialPrediction={predictionsByMarketId.get(market.id)}
                        onPredicted={handlePredicted}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#21262d] py-6 mt-12 bg-[#0b0e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8b949e]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">PredictProof</span>
            <span>•</span>
            <span>Phase 4 Points Prediction Game</span>
          </div>
          <div>Simulated test markets backed by Supabase</div>
        </div>
      </footer>
    </div>
  );
}
