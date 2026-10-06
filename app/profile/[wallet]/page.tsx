"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import resolvedMarketsData from "@/lib/mock-data/resolved-markets.json";
import {
  groupPositionsByWallet,
  scoreWallet,
  ResolvedMarket,
} from "@/lib/scoring";
import { Navbar } from "@/components/Navbar";
import { BadgeCard, BADGE_METADATA } from "@/components/BadgeCard";
import { ClaimBadgeButton } from "@/components/ClaimBadgeButton";
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  FlameStreakIcon,
  HexCheckIcon,
  XBadgeIcon,
  HelpBadgeIcon,
  TrophyIcon,
  CoinFlipIcon,
  TrendingChartIcon,
} from "@/components/icons";

interface ProfilePageProps {
  params: {
    wallet: string;
  };
}

interface WalletPredictionItem {
  id: string;
  wallet_address: string;
  market_id: string;
  side: "YES" | "NO";
  points_delta: number | null;
  created_at: string;
}

function truncateAddress(addr: string): string {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function WalletProfilePage({ params }: ProfilePageProps) {
  const { wallet } = params;
  const { publicKey } = useWallet();

  const [demoPositionsActive, setDemoPositionsActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [walletPredictions, setWalletPredictions] = useState<WalletPredictionItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch /api/wallet/[wallet] for points history
  useEffect(() => {
    let isMounted = true;
    async function loadWalletHistory() {
      try {
        setLoadingHistory(true);
        const res = await fetch(`/api/wallet/${wallet}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.predictions) {
            setWalletPredictions(data.predictions);
          }
        }
      } catch (err) {
        console.error("Failed to load wallet predictions history:", err);
      } finally {
        if (isMounted) {
          setLoadingHistory(false);
        }
      }
    }
    loadWalletHistory();
    return () => {
      isMounted = false;
    };
  }, [wallet]);

  // Compute running cumulative points balance for recharts LineChart
  const chartData = useMemo(() => {
    const resolved = walletPredictions.filter(
      (p) => typeof p.points_delta === "number" && p.points_delta !== null
    );
    if (resolved.length === 0) return [];

    let runningBalance = 100;
    return resolved.map((p) => {
      runningBalance += p.points_delta!;
      const d = new Date(p.created_at);
      const formattedDate = isNaN(d.getTime())
        ? p.created_at.slice(5, 10)
        : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return {
        date: p.created_at,
        formattedDate,
        balance: runningBalance,
      };
    });
  }, [walletPredictions]);

  const resolvedMarkets = resolvedMarketsData as ResolvedMarket[];
  const grouped = useMemo(
    () => groupPositionsByWallet(resolvedMarkets),
    [resolvedMarkets]
  );

  const isOwnProfile = !!(
    publicKey && publicKey.toBase58().toLowerCase() === wallet.toLowerCase()
  );

  const userPositions = useMemo(() => {
    const raw = grouped[wallet] || [];
    if (raw.length > 0) return raw;
    if (demoPositionsActive) {
      // Sample positions from top predictor to test claiming on Devnet
      return grouped["7xKXtg2CW37d97TXJSDpbD5jBkheTqA83TZRuJosgWp1"] || [];
    }
    return [];
  }, [grouped, wallet, demoPositionsActive]);

  const hasHistory = userPositions.length > 0;
  const score = useMemo(
    () => scoreWallet(wallet, userPositions),
    [wallet, userPositions]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#f0f6fc]">
      {/* Sticky Navbar */}
      <Navbar showCategories={false} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#8b949e]">
          <Link
            href="/leaderboard"
            className="hover:text-white flex items-center gap-1 transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Back to Leaderboard
          </Link>
          <span>/</span>
          <span className="text-white font-mono">{truncateAddress(wallet)}</span>
          {isOwnProfile && (
            <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
              Your Wallet
            </span>
          )}
        </div>

        {/* Profile Header */}
        <section className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/20 shrink-0">
              <div className="w-full h-full bg-[#12161f] rounded-[14px] flex items-center justify-center text-white">
                <TrophyIcon className="w-8 h-8 text-purple-400" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-mono text-white">
                  {truncateAddress(wallet)}
                </h1>
                {score.badgeTier !== "none" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    {BADGE_METADATA[score.badgeTier]?.name || "Ranked"}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-normal bg-gray-800/40 text-[#8b949e] border border-gray-700/50">
                    Novice Predictor
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8b949e] font-mono break-all sm:break-normal">
                {wallet}
              </p>
            </div>
          </div>

          {/* External Explorer Link */}
          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <a
              href={`https://explorer.solana.com/address/${wallet}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-xs font-medium text-[#f0f6fc] border border-[#30363d] transition-colors"
            >
              <span>Solana Devnet Explorer</span>
              <ExternalLinkIcon className="w-3.5 h-3.5 text-[#8b949e]" />
            </a>
          </div>
        </section>

        {/* Judging Transparency & Honesty Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 px-4 py-3 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-medium">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span>
            <strong className="text-amber-300">Demo mode</strong> — scores are computed from sample prediction data, not live resolved Panta markets yet.
          </span>
        </div>

        {/* Points History Chart (Phase 4E) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingChartIcon className="w-4 h-4 text-purple-400" />
              <span>Points Balance History</span>
            </h2>
            <span className="text-xs font-mono text-[#8b949e]">
              Base 100 pts · ±10 pts / outcome
            </span>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 sm:p-6 shadow-xl">
            {loadingHistory ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-[#8b949e]">
                <span>Loading points history...</span>
              </div>
            ) : chartData.length === 0 ? (
              <div className="py-12 text-center text-[#8b949e] space-y-2">
                <p className="text-sm font-medium text-[#c9d1d9]">
                  No resolved predictions yet — chart will appear once your first prediction is resolved
                </p>
                <p className="text-xs text-[#6e7681]">
                  Current balance defaults to 100 pts. Resolved test market predictions will trace cumulative balance changes here.
                </p>
              </div>
            ) : mounted ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8b949e] px-1">
                  <span>Starting Balance: <strong className="text-white">100 pts</strong></span>
                  <span>
                    Current Cumulative Balance:{" "}
                    <strong className="text-purple-400 font-mono font-bold">
                      {chartData[chartData.length - 1].balance} pts
                    </strong>
                  </span>
                </div>
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                      <XAxis
                        dataKey="formattedDate"
                        stroke="#6e7681"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "#30363d" }}
                      />
                      <YAxis
                        stroke="#6e7681"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "#30363d" }}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#161b22",
                          borderColor: "#30363d",
                          borderRadius: "0.5rem",
                          fontSize: "12px",
                          color: "#f0f6fc",
                        }}
                        formatter={(value: number | string | readonly (number | string)[] | undefined) => [
                          `${value ?? 0} pts`,
                          "Balance",
                        ]}
                        labelFormatter={(label) => (label ? `Date: ${String(label)}` : "")}
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#a855f7"
                        strokeWidth={2.5}
                        dot={{
                          r: 4,
                          fill: "#a855f7",
                          stroke: "#161b22",
                          strokeWidth: 1,
                        }}
                        activeDot={{ r: 6, fill: "#c084fc" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="h-64 w-full flex items-center justify-center text-xs text-[#8b949e]">
                Loading points chart...
              </div>
            )}
          </div>
        </section>

        {/* Reputational Stat Summary */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Reputation Metrics</span>
            <span className="text-xs text-[#8b949e] font-normal font-sans">
              (derived from resolved market positions)
            </span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Total Score */}
            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl">
              <span className="text-[11px] font-mono uppercase text-[#8b949e] block mb-1">
                Total Score
              </span>
              <span className="text-2xl font-extrabold text-white font-mono">
                {score.totalScore.toFixed(2)}
              </span>
              <span className="text-[10px] text-[#6e7681] block mt-1">
                Picks + Underdog + Streak
              </span>
            </div>

            {/* Accuracy % */}
            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl">
              <span className="text-[11px] font-mono uppercase text-[#8b949e] block mb-1">
                Accuracy %
              </span>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                {score.accuracyPct}%
              </span>
              <span className="text-[10px] text-[#6e7681] block mt-1">
                {score.correctPicks} of {score.totalPicks} correct
              </span>
            </div>

            {/* Win Streak */}
            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl">
              <span className="text-[11px] font-mono uppercase text-[#8b949e] block mb-1">
                Current Streak
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-extrabold text-orange-400 font-mono">
                  {score.currentStreak}W
                </span>
                {score.currentStreak >= 3 && (
                  <FlameStreakIcon className="w-5 h-5 text-orange-400" />
                )}
              </div>
              <span className="text-[10px] text-[#6e7681] block mt-1">
                {score.currentStreak >= 3 ? "Active streak bonus (+0.5/w)" : "Consecutive correct"}
              </span>
            </div>

            {/* Total Picks */}
            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl">
              <span className="text-[11px] font-mono uppercase text-[#8b949e] block mb-1">
                Picks Record
              </span>
              <span className="text-2xl font-extrabold text-white font-mono">
                {score.correctPicks}/{score.totalPicks}
              </span>
              <span className="text-[10px] text-[#6e7681] block mt-1">
                Wins / Losses: {score.correctPicks} / {score.totalPicks - score.correctPicks}
              </span>
            </div>

            {/* Underdog Bonus */}
            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-[11px] font-mono uppercase text-[#8b949e] block mb-1">
                Underdog Bonus
              </span>
              <span className="text-2xl font-extrabold text-purple-400 font-mono">
                +{score.underdogBonus}
              </span>
              <span className="text-[10px] text-[#6e7681] block mt-1">
                {score.hasUnderdogPick ? "★ Has ≤15¢ Pick" : "From odds < 50¢"}
              </span>
            </div>
          </div>
        </section>

        {/* Soulbound Badge Collection */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Soulbound Badge Collection</span>
                <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 font-medium">
                  Anchor Program
                </span>
                {isOwnProfile && (
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium flex items-center gap-1">
                    <CoinFlipIcon className="w-3 h-3" />
                    Your Connected Wallet
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#8b949e] mt-0.5">
                Non-transferable on-chain credentials minted to verify prediction track records on Solana Devnet.
              </p>
            </div>
          </div>

          {/* Badge Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["gold", "silver", "bronze", "underdog"] as const).map((tier) => {
              const isUnlocked = score.badges.includes(tier);
              return (
                <BadgeCard
                  key={tier}
                  tier={tier}
                  unlocked={isUnlocked}
                  earnedDate={isUnlocked ? "Devnet Season 1" : "Locked"}
                  action={
                    isUnlocked && isOwnProfile && publicKey ? (
                      <ClaimBadgeButton
                        tier={tier}
                        walletPublicKey={publicKey}
                      />
                    ) : undefined
                  }
                />
              );
            })}
          </div>

          {/* If completely no badges earned yet, show empty/zero state note */}
          {!hasHistory && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#21262d] flex items-center justify-center mx-auto text-[#8b949e]">
                <HelpBadgeIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">
                  No Resolved Predictions for this Wallet
                </h3>
                <p className="text-xs sm:text-sm text-[#8b949e] max-w-md mx-auto">
                  This wallet has no positions recorded in our resolved markets mock dataset.
                  Participate in markets to build on-chain accuracy and earn soulbound badges.
                </p>
              </div>

              {isOwnProfile && (
                <div className="pt-1">
                  <button
                    onClick={() => setDemoPositionsActive(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all"
                  >
                    Simulate Active Predictor (Unlocks Badges to Test Minting)
                  </button>
                </div>
              )}

              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/"
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
                >
                  Browse Markets
                </Link>
                <Link
                  href="/leaderboard"
                  className="px-4 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-semibold transition-colors"
                >
                  View Leaderboard
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Resolved Market History */}
        {hasHistory && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white">
              Resolved Prediction History ({userPositions.length})
            </h2>

            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-lg">
              <div className="divide-y divide-[#21262d]">
                {score.positions.map((pos, idx) => (
                  <div
                    key={`${pos.marketId}-${idx}`}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1c2128] transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                          {pos.category}
                        </span>
                        <span className="text-xs text-[#8b949e] font-mono">
                          ID: {pos.marketId}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-white">
                        {pos.marketTitle}
                      </h4>
                    </div>

                    {/* Outcome Stats */}
                    <div className="flex items-center gap-4 sm:gap-6 self-start sm:self-auto shrink-0 text-xs font-mono">
                      <div className="text-right">
                        <span className="text-[10px] text-[#8b949e] block uppercase">Picks</span>
                        <span className="font-bold text-white">
                          Picked {pos.side} @ ${(parseFloat(pos.priceAtEntry) || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#8b949e] block uppercase">Outcome</span>
                        <span className="font-bold text-white">
                          Resolved {pos.winningOutcome}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#8b949e] block uppercase">Result</span>
                        {pos.isCorrect ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                            <HexCheckIcon className="w-3.5 h-3.5" /> Won
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-400">
                            <XBadgeIcon className="w-3.5 h-3.5" /> Lost
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#21262d] py-6 mt-12 bg-[#0b0e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8b949e]">
          <div>
            PredictProof Soulbound Credentials • Solana devnet program:{" "}
            <span className="text-purple-400 font-mono">BMwNMcr...bafz</span>
          </div>
          <div>Non-transferable on-chain reputation for Panta prediction markets</div>
        </div>
      </footer>
    </div>
  );
}
