import React from "react";
import Link from "next/link";
import resolvedMarketsData from "@/lib/mock-data/resolved-markets.json";
import { rankWallets, ResolvedMarket, BadgeTier } from "@/lib/scoring";
import { Navbar } from "@/components/Navbar";
import {
  Trophy,
  Flame,
  Award,
  Shield,
  Target,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Predictor Leaderboard — PredictProof",
  description:
    "Rankings, accuracy scores, streaks, and soulbound NFT tier eligibility on Solana devnet.",
};

function formatWallet(wallet: string): string {
  if (!wallet || wallet.length < 10) return wallet;
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

function getBadgePill(tier: BadgeTier) {
  switch (tier) {
    case "gold":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Sparkles className="w-3 h-3" />
          Gold Oracle
        </span>
      );
    case "silver":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          <Shield className="w-3 h-3" />
          Silver Forecaster
        </span>
      );
    case "bronze":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">
          <Award className="w-3 h-3" />
          Bronze Predictor
        </span>
      );
    case "underdog":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30">
          <Target className="w-3 h-3" />
          Underdog Sniper
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal bg-gray-800/40 text-[#8b949e] border border-gray-700/50">
          Unranked
        </span>
      );
  }
}

function getRankBadge(rank: number) {
  if (rank === 1) {
    return (
      <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-xs shadow-sm shadow-amber-500/10">
        🥇 1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="w-7 h-7 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/40 flex items-center justify-center font-bold text-xs">
        🥈 2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center font-bold text-xs">
        🥉 3
      </span>
    );
  }
  return (
    <span className="w-7 h-7 rounded-full bg-[#21262d] text-[#8b949e] flex items-center justify-center font-mono font-medium text-xs">
      #{rank}
    </span>
  );
}

export default function LeaderboardPage() {
  const resolvedMarkets = resolvedMarketsData as ResolvedMarket[];
  const ranked = rankWallets(resolvedMarkets);

  const topStreak = Math.max(...ranked.map((r) => r.currentStreak), 0);
  const totalUnderdogBonuses = ranked
    .reduce((sum, r) => sum + r.underdogBonus, 0)
    .toFixed(2);

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#f0f6fc]">
      {/* Sticky Navbar */}
      <Navbar showCategories={false} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Header & Subtitle */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#21262d]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <Trophy className="w-3 h-3" />
                Live Reputation Leaderboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Predictor Accuracy Rankings
            </h1>
            <p className="text-xs sm:text-sm text-[#8b949e] mt-1 max-w-2xl">
              Calculated on-chain from resolved Panta prediction markets. Wallets are scored on prediction accuracy,
              consecutive win streaks, and high-payout underdog bonuses to qualify for soulbound NFT badge minting.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-[#161b22] border border-[#30363d] p-3 rounded-xl text-center self-start md:self-auto shrink-0">
            <div className="px-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#8b949e] block">
                Predictors
              </span>
              <span className="text-lg font-bold text-white font-mono">{ranked.length}</span>
            </div>
            <div className="px-2 border-x border-[#21262d]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#8b949e] block">
                Top Streak
              </span>
              <span className="text-lg font-bold text-orange-400 font-mono">
                {topStreak} 🔥
              </span>
            </div>
            <div className="px-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#8b949e] block">
                Bonus Pool
              </span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                +{totalUnderdogBonuses}
              </span>
            </div>
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

        {/* Scoring Rule Explainer Banner */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[#8b949e]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-400 shrink-0" />
            <span>
              <strong className="text-white">Scoring Formula:</strong> Total Score = Correct Picks + Underdog Bonus (entry odds ≤ 50¢) + Streak Bonus (≥3 streak = streak × 0.5)
            </span>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors inline-flex items-center gap-1 shrink-0"
          >
            Browse Active Markets →
          </Link>
        </div>

        {/* DESKTOP VIEW: Ranked Table (md: and above) */}
        <div className="hidden md:block bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-lg shadow-black/20">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#21262d] bg-[#12161f] text-[11px] uppercase tracking-wider text-[#8b949e]">
                <th className="py-3.5 px-4 font-semibold">Rank</th>
                <th className="py-3.5 px-4 font-semibold">Wallet Address</th>
                <th className="py-3.5 px-4 font-semibold text-center">Picks</th>
                <th className="py-3.5 px-4 font-semibold">Accuracy</th>
                <th className="py-3.5 px-4 font-semibold text-center">Streak</th>
                <th className="py-3.5 px-4 font-semibold text-right">Underdog+</th>
                <th className="py-3.5 px-4 font-semibold text-center">Badge Tier</th>
                <th className="py-3.5 px-4 font-semibold text-right">Total Score</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {ranked.map((score, index) => {
                const rank = index + 1;
                return (
                  <tr
                    key={score.wallet}
                    className="hover:bg-[#1c2128] transition-colors group"
                  >
                    {/* Rank */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getRankBadge(rank)}
                    </td>

                    {/* Wallet */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <Link
                        href={`/profile/${score.wallet}`}
                        className="font-mono text-sm text-white hover:text-brand-400 font-semibold transition-colors flex items-center gap-1.5"
                      >
                        {formatWallet(score.wallet)}
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#6e7681] group-hover:text-brand-400 transition-colors" />
                      </Link>
                    </td>

                    {/* Picks */}
                    <td className="py-4 px-4 text-center whitespace-nowrap font-mono text-xs">
                      <span className="text-white font-semibold">{score.correctPicks}</span>
                      <span className="text-[#6e7681]"> / {score.totalPicks}</span>
                    </td>

                    {/* Accuracy */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-[#21262d] overflow-hidden flex">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, score.accuracyPct)}%` }}
                          />
                        </div>
                        <span className="font-mono font-semibold text-xs text-white">
                          {score.accuracyPct}%
                        </span>
                      </div>
                    </td>

                    {/* Streak */}
                    <td className="py-4 px-4 text-center whitespace-nowrap font-mono text-xs">
                      {score.currentStreak > 0 ? (
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold ${
                            score.currentStreak >= 3
                              ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                              : "text-white"
                          }`}
                        >
                          {score.currentStreak >= 3 && <Flame className="w-3 h-3 text-orange-400" />}
                          {score.currentStreak}W
                        </span>
                      ) : (
                        <span className="text-[#6e7681]">—</span>
                      )}
                    </td>

                    {/* Underdog Bonus */}
                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono text-xs">
                      {score.underdogBonus > 0 ? (
                        <span className="text-emerald-400 font-semibold">
                          +{score.underdogBonus}
                        </span>
                      ) : (
                        <span className="text-[#6e7681]">0.00</span>
                      )}
                    </td>

                    {/* Badge Tier */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {getBadgePill(score.badgeTier)}
                    </td>

                    {/* Total Score */}
                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono">
                      <span className="text-base font-bold text-white tracking-tight bg-[#21262d] px-2.5 py-1 rounded-lg border border-[#30363d]">
                        {score.totalScore.toFixed(2)}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/profile/${score.wallet}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-[#21262d] transition-colors"
                      >
                        Profile →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MOBILE VIEW: Stacked Cards (below md:, NO horizontal scrolling) */}
        <div className="block md:hidden space-y-3">
          {ranked.map((score, index) => {
            const rank = index + 1;
            return (
              <div
                key={score.wallet}
                className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-3 shadow-md"
              >
                {/* Card Top: Rank, Wallet & Badge Pill */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getRankBadge(rank)}
                    <Link
                      href={`/profile/${score.wallet}`}
                      className="font-mono text-sm font-bold text-white hover:text-brand-400 transition-colors"
                    >
                      {formatWallet(score.wallet)}
                    </Link>
                  </div>
                  {getBadgePill(score.badgeTier)}
                </div>

                {/* Score & Key Stats Grid */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#21262d] text-center">
                  <div className="bg-[#0d1117] p-2 rounded-lg border border-[#21262d]">
                    <span className="text-[10px] text-[#8b949e] uppercase font-mono block">Score</span>
                    <span className="font-mono font-bold text-sm text-white">{score.totalScore.toFixed(1)}</span>
                  </div>
                  <div className="bg-[#0d1117] p-2 rounded-lg border border-[#21262d]">
                    <span className="text-[10px] text-[#8b949e] uppercase font-mono block">Accuracy</span>
                    <span className="font-mono font-bold text-sm text-emerald-400">{score.accuracyPct}%</span>
                  </div>
                  <div className="bg-[#0d1117] p-2 rounded-lg border border-[#21262d]">
                    <span className="text-[10px] text-[#8b949e] uppercase font-mono block">Picks</span>
                    <span className="font-mono font-bold text-sm text-white">{score.correctPicks}/{score.totalPicks}</span>
                  </div>
                  <div className="bg-[#0d1117] p-2 rounded-lg border border-[#21262d]">
                    <span className="text-[10px] text-[#8b949e] uppercase font-mono block">Streak</span>
                    <span className="font-mono font-bold text-sm text-orange-400">{score.currentStreak}W</span>
                  </div>
                </div>

                {/* Action Link */}
                <div className="pt-1 flex items-center justify-between text-xs text-[#8b949e]">
                  <span>Underdog Bonus: <strong className="text-white">+{score.underdogBonus}</strong></span>
                  <Link
                    href={`/profile/${score.wallet}`}
                    className="text-brand-400 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    View Badges & History →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#21262d] py-6 mt-12 bg-[#0b0e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8b949e]">
          <div>
            PredictProof Scoring Engine • devnet Anchor Program ID:{" "}
            <span className="text-purple-400 font-mono">BMwNMcr...bafz</span>
          </div>
          <div>Ranked by verified predictive accuracy & underdog odds</div>
        </div>
      </footer>
    </div>
  );
}
