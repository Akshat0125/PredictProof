"use client";

import React from "react";
import { PantaMarket } from "@/lib/panta-client";
import { ClockIcon, MarketVolumeIcon } from "@/components/icons";

interface MarketCardProps {
  market: PantaMarket;
}

export function MarketCard({ market }: MarketCardProps) {
  const yesNum = parseFloat(market.yesPrice) || 0;
  const noNum = parseFloat(market.noPrice) || 0;
  const total = yesNum + noNum > 0 ? yesNum + noNum : 1;
  const yesPct = Math.round((yesNum / total) * 100);
  const noPct = 100 - yesPct;

  // Format volume in USDC
  const volumeNumber = parseFloat(market.volumeUsdc) || 0;
  const formattedVolume = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(volumeNumber);

  // Format date if present
  const formatResolutionDate = (isoString?: string) => {
    if (!isoString) return null;
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  const formattedResolution = formatResolutionDate(market.resolutionTime || market.endTime);

  return (
    <article className="group bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] hover:border-[#58a6ff]/40 rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-md shadow-black/20 hover:shadow-black/40">
      
      {/* Top Header: Category Pill & Market Phase */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#21262d] text-[#8b949e] border border-[#30363d] group-hover:border-[#58a6ff]/30 transition-colors">
          {market.category || "General"}
        </span>

        <div className="flex items-center gap-1.5 text-[11px] text-[#8b949e]">
          {formattedResolution && (
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3 text-[#6e7681]" />
              {formattedResolution}
            </span>
          )}
          {market.phase && (
            <span className="capitalize px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">
              {market.phase}
            </span>
          )}
        </div>
      </div>

      {/* Middle: Title */}
      <div className="mb-4 flex-1">
        <h3 className="text-[#f0f6fc] font-semibold text-sm sm:text-base leading-snug group-hover:text-white line-clamp-2">
          {market.title}
        </h3>
        {market.description && (
          <p className="text-xs text-[#8b949e] line-clamp-2 mt-1.5 font-normal">
            {market.description}
          </p>
        )}
      </div>

      {/* Outcomes & Pricing (Polymarket Style) */}
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-2">
          {/* YES Outcome */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs">
            <span className="font-semibold text-emerald-400">YES</span>
            <div className="text-right">
              <span className="font-mono font-bold text-white text-sm">
                {yesPct}%
              </span>
              <span className="text-[10px] text-[#8b949e] block font-mono">
                ${yesNum.toFixed(2)}
              </span>
            </div>
          </div>

          {/* NO Outcome */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs">
            <span className="font-semibold text-rose-400">NO</span>
            <div className="text-right">
              <span className="font-mono font-bold text-white text-sm">
                {noPct}%
              </span>
              <span className="text-[10px] text-[#8b949e] block font-mono">
                ${noNum.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Horizontal YES/NO Proportional Bar */}
        <div className="space-y-1">
          <div className="w-full h-2 rounded-full bg-[#21262d] overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${yesPct}%` }}
              title={`YES: ${yesPct}%`}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{ width: `${noPct}%` }}
              title={`NO: ${noPct}%`}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#6e7681] px-0.5">
            <span className="text-emerald-400/90 font-medium">Yes {yesPct}%</span>
            <span className="text-rose-400/90 font-medium">No {noPct}%</span>
          </div>
        </div>
      </div>

      {/* Footer: Volume & Action Footer */}
      <div className="pt-3 border-t border-[#21262d] flex items-center justify-between text-xs text-[#8b949e]">
        <div className="flex items-center gap-1.5 font-medium">
          <MarketVolumeIcon className="w-3.5 h-3.5 text-[#58a6ff]" />
          <span>{formattedVolume} Vol</span>
        </div>

        <span className="text-[11px] text-[#58a6ff] group-hover:underline font-medium">
          View details →
        </span>
      </div>

    </article>
  );
}
