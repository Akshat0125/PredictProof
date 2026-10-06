"use client";

import React from "react";
import { BadgeTier } from "@/lib/scoring";
import {
  MedalRibbonIcon,
  ShieldIcon,
  CrosshairIcon,
  FlameStreakIcon,
  CoinFlipIcon,
  CheckIcon,
  PadlockIcon,
} from "@/components/icons";

interface BadgeCardProps {
  tier: BadgeTier;
  unlocked?: boolean;
  earnedDate?: string;
  showDetails?: boolean;
  action?: React.ReactNode;
}

export const BADGE_METADATA: Record<
  BadgeTier,
  {
    name: string;
    title: string;
    description: string;
    requirement: string;
    gradient: string;
    borderColor: string;
    textColor: string;
    icon: React.ComponentType<{ className?: string }>;
    accentBg: string;
  }
> = {
  gold: {
    name: "Gold Oracle",
    title: "Gold Tier Reputation",
    description: "Exceptional market insight with 15+ correct calls and sustained 75%+ accuracy.",
    requirement: "15+ correct picks & ≥75% accuracy",
    gradient: "from-amber-400 via-yellow-500 to-amber-600",
    borderColor: "border-amber-400/50",
    textColor: "text-amber-400",
    icon: CoinFlipIcon,
    accentBg: "bg-amber-500/10",
  },
  silver: {
    name: "Silver Forecaster",
    title: "Silver Tier Reputation",
    description: "Consistent market predictor with 7+ correct calls and 60%+ accuracy.",
    requirement: "7+ correct picks & ≥60% accuracy",
    gradient: "from-slate-200 via-cyan-300 to-blue-400",
    borderColor: "border-cyan-400/50",
    textColor: "text-cyan-300",
    icon: ShieldIcon,
    accentBg: "bg-cyan-500/10",
  },
  bronze: {
    name: "Bronze Predictor",
    title: "Bronze Tier Reputation",
    description: "Proven participant with at least 3 verified correct prediction calls.",
    requirement: "3+ correct prediction picks",
    gradient: "from-amber-600 via-orange-500 to-amber-700",
    borderColor: "border-orange-500/40",
    textColor: "text-orange-400",
    icon: MedalRibbonIcon,
    accentBg: "bg-orange-500/10",
  },
  underdog: {
    name: "Underdog Sniper",
    title: "Specialist Contrarian",
    description: "Accurately called a high-stakes outcome with entry odds ≤15¢.",
    requirement: "Win a pick with entry price ≤ $0.15",
    gradient: "from-fuchsia-500 via-blue-500 to-blue-700",
    borderColor: "border-fuchsia-500/50",
    textColor: "text-fuchsia-400",
    icon: CrosshairIcon,
    accentBg: "bg-fuchsia-500/10",
  },
  none: {
    name: "Unranked",
    title: "New Predictor",
    description: "Make correct predictions in resolved markets to qualify for soulbound badge minting.",
    requirement: "Need 3+ correct picks to unlock Bronze",
    gradient: "from-gray-600 to-slate-700",
    borderColor: "border-gray-700",
    textColor: "text-gray-400",
    icon: FlameStreakIcon,
    accentBg: "bg-gray-800/40",
  },
};

export function BadgeCard({
  tier,
  unlocked = true,
  earnedDate = "Devnet Season 1",
  showDetails = true,
  action,
}: BadgeCardProps) {
  const meta = BADGE_METADATA[tier] || BADGE_METADATA.none;
  const IconComponent = meta.icon;

  if (tier === "none") {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-2 opacity-60">
        <div className="w-12 h-12 rounded-full bg-[#21262d] flex items-center justify-center text-gray-500">
          <PadlockIcon className="w-5 h-5" />
        </div>
        <div className="font-semibold text-sm text-[#f0f6fc]">No Badges Earned Yet</div>
        <p className="text-xs text-[#8b949e] max-w-xs">
          Participate in prediction markets and achieve 3+ correct picks to unlock your first soulbound NFT badge.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative group bg-[#161b22] border ${meta.borderColor} rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-black/60`}
    >
      {/* Background glow effect */}
      <div
        className={`absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br ${meta.gradient} opacity-15 blur-2xl rounded-full pointer-events-none`}
      />

      {/* Top Header: Badge Type Pill & Status */}
      <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${meta.accentBg} ${meta.textColor} border ${meta.borderColor}`}
        >
          <IconComponent className="w-3.5 h-3.5" />
          {meta.name}
        </span>

        {unlocked ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
            <CheckIcon className="w-3 h-3" />
            Soulbound Ready
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-800/40 px-2 py-0.5 rounded-full border border-gray-700">
            <PadlockIcon className="w-3 h-3" />
            Locked
          </span>
        )}
      </div>

      {/* Badge Visual Icon Shield */}
      <div className="flex flex-col items-center my-3 relative z-10">
        <div
          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${meta.gradient} p-0.5 shadow-xl shadow-black/50 group-hover:rotate-1 transition-transform`}
        >
          <div className="w-full h-full bg-[#12161f] rounded-[14px] flex flex-col items-center justify-center p-2">
            <IconComponent className={`w-8 h-8 ${meta.textColor}`} />
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#8b949e] mt-1">
              Anchor NFT
            </span>
          </div>
        </div>

        <h4 className="mt-3 text-base font-bold text-white text-center">
          {meta.name}
        </h4>
        <p className="text-xs text-[#8b949e] text-center max-w-xs mt-0.5">
          {meta.title}
        </p>
      </div>

      {/* Details & Requirement */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-[#21262d] space-y-2 relative z-10 text-xs">
          <p className="text-[#8b949e] text-[11px] leading-relaxed">
            {meta.description}
          </p>

          <div className="flex items-center justify-between text-[11px] bg-[#0d1117] p-2 rounded-lg border border-[#21262d]">
            <span className="text-[#8b949e]">Criteria:</span>
            <span className="font-medium text-white">{meta.requirement}</span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#6e7681] pt-1">
            <span>Verified by PredictProof Engine</span>
            <span>{earnedDate}</span>
          </div>
        </div>
      )}

      {/* Optional Action / Claim Button */}
      {action && (
        <div className="mt-4 pt-3 border-t border-[#21262d] relative z-10">
          {action}
        </div>
      )}
    </div>
  );
}
