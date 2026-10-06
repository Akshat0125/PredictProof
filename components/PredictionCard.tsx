"use client";

import React, { useState, useEffect } from "react";
import {
  HexCheckIcon,
  CheckIcon,
  XBadgeIcon,
  DashedSpinnerIcon,
} from "@/components/icons";

export interface TestMarket {
  id: string;
  title: string;
  category: string;
  resolved: boolean;
  winning_side: "YES" | "NO" | null;
  created_at?: string;
}

export interface UserPrediction {
  id?: string;
  market_id: string;
  side: "YES" | "NO";
  points_delta?: number | null;
}

interface PredictionCardProps {
  market: TestMarket;
  connectedWallet: string | null;
  initialPrediction?: UserPrediction | null;
  onPredicted?: (prediction: UserPrediction) => void;
}

export function PredictionCard({
  market,
  connectedWallet,
  initialPrediction,
  onPredicted,
}: PredictionCardProps) {
  const [prediction, setPrediction] = useState<UserPrediction | null>(
    initialPrediction || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingSide, setSubmittingSide] = useState<"YES" | "NO" | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync initialPrediction prop if it changes
  useEffect(() => {
    if (initialPrediction) {
      setPrediction(initialPrediction);
    }
  }, [initialPrediction]);

  const handlePredict = async (side: "YES" | "NO") => {
    if (!connectedWallet || isSubmitting || prediction || market.resolved) {
      return;
    }

    setIsSubmitting(true);
    setSubmittingSide(side);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: connectedWallet,
          marketId: market.id,
          side,
        }),
      });

      if (res.status === 200) {
        const created = await res.json();
        const pred: UserPrediction = {
          id: created.id,
          market_id: market.id,
          side: created.side,
          points_delta: created.points_delta,
        };
        setPrediction(pred);
        onPredicted?.(pred);
      } else if (res.status === 409) {
        // Already predicted — fetch existing pick from wallet API
        try {
          const walletRes = await fetch(`/api/wallet/${connectedWallet}`);
          if (walletRes.ok) {
            const walletData = await walletRes.json();
            const existing = walletData.predictions?.find(
              (p: UserPrediction) => p.market_id === market.id
            );
            if (existing) {
              const pred: UserPrediction = {
                id: existing.id,
                market_id: market.id,
                side: existing.side,
                points_delta: existing.points_delta,
              };
              setPrediction(pred);
              onPredicted?.(pred);
              return;
            }
          }
        } catch {
          // Fallback to local prediction state
        }
        setPrediction({ market_id: market.id, side });
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMessage(errData.error || "Failed to submit prediction");
      }
    } catch (err) {
      console.error("Prediction submission error:", err);
      const message =
        err instanceof Error ? err.message : "Network error submitting prediction";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
      setSubmittingSide(null);
    }
  };

  const isResolved = market.resolved;
  const hasPredicted = !!prediction;
  const userSide = prediction?.side;
  const isWinner =
    isResolved && userSide && market.winning_side && userSide === market.winning_side;
  const isLoser =
    isResolved && userSide && market.winning_side && userSide !== market.winning_side;

  return (
    <article className="group bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] hover:border-purple-500/30 rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-md shadow-black/20 hover:shadow-black/40 relative">
      
      {/* Top Header: Category Pill & Distinct "Demo Prediction" Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
            Demo Prediction
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#21262d] text-[#8b949e] border border-[#30363d] uppercase">
            {market.category}
          </span>
        </div>

        {isResolved ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
            Resolved
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        )}
      </div>

      {/* Market Title */}
      <div className="mb-4 flex-1">
        <h3 className="text-[#f0f6fc] font-semibold text-sm sm:text-base leading-snug">
          {market.title}
        </h3>
      </div>

      {/* Resolution State Display */}
      {isResolved && (
        <div className="mb-4 p-3 rounded-lg bg-[#0d1117] border border-[#21262d] space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#8b949e]">Winning Outcome:</span>
            <span
              className={`font-semibold font-mono px-2 py-0.5 rounded text-xs ${
                market.winning_side === "YES"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
              }`}
            >
              {market.winning_side}
            </span>
          </div>

          {hasPredicted ? (
            <div className="pt-1.5 border-t border-[#21262d] flex items-center justify-between font-medium">
              <span className="text-[#8b949e]">Your Pick: {userSide}</span>
              {isWinner && (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                  <HexCheckIcon className="w-3.5 h-3.5" /> Correct (+10 pts)
                </span>
              )}
              {isLoser && (
                <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                  <XBadgeIcon className="w-3.5 h-3.5" /> Incorrect (-10 pts)
                </span>
              )}
            </div>
          ) : (
            <div className="pt-1 border-t border-[#21262d] text-[11px] text-[#6e7681]">
              You did not make a prediction on this market.
            </div>
          )}
        </div>
      )}

      {/* Unresolved Market: User Prediction Status */}
      {!isResolved && hasPredicted && (
        <div className="mb-3.5 py-1.5 px-2.5 rounded-lg bg-[#0d1117] border border-[#21262d] text-xs flex items-center gap-2 text-[#8b949e]">
          <CheckIcon className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
          <span className="text-[11px]">
            You predicted{" "}
            <span className="font-medium text-[#c9d1d9]">{userSide}</span>
            {" — awaiting resolution"}
          </span>
        </div>
      )}

      {/* Prediction Action Buttons */}
      {!isResolved && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* YES Button */}
            <button
              type="button"
              onClick={() => handlePredict("YES")}
              disabled={!connectedWallet || isSubmitting || hasPredicted}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                hasPredicted && userSide === "YES"
                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 cursor-default"
                  : hasPredicted
                  ? "bg-transparent text-[#6e7681] border border-[#21262d] opacity-50 cursor-not-allowed"
                  : !connectedWallet
                  ? "bg-transparent text-emerald-400/50 border border-emerald-500/20 cursor-not-allowed"
                  : "bg-transparent hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 active:scale-[0.99]"
              }`}
            >
              {isSubmitting && submittingSide === "YES" ? (
                <DashedSpinnerIcon className="w-3 h-3 animate-spin text-emerald-400" />
              ) : (
                <CheckIcon className="w-3 h-3 text-emerald-400/70" />
              )}
              <span>Predict YES</span>
            </button>

            {/* NO Button */}
            <button
              type="button"
              onClick={() => handlePredict("NO")}
              disabled={!connectedWallet || isSubmitting || hasPredicted}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                hasPredicted && userSide === "NO"
                  ? "bg-rose-500/10 text-rose-300 border border-rose-500/40 cursor-default"
                  : hasPredicted
                  ? "bg-transparent text-[#6e7681] border border-[#21262d] opacity-50 cursor-not-allowed"
                  : !connectedWallet
                  ? "bg-transparent text-rose-400/50 border border-rose-500/20 cursor-not-allowed"
                  : "bg-transparent hover:bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:border-rose-500/60 active:scale-[0.99]"
              }`}
            >
              {isSubmitting && submittingSide === "NO" ? (
                <DashedSpinnerIcon className="w-3 h-3 animate-spin text-rose-400" />
              ) : (
                <XBadgeIcon className="w-3 h-3 text-rose-400/70" />
              )}
              <span>Predict NO</span>
            </button>
          </div>

          {!connectedWallet && !hasPredicted && (
            <p className="text-[11px] text-center text-[#8b949e]">
              Connect your Solana wallet to predict and earn points.
            </p>
          )}

          {errorMessage && (
            <p className="text-[11px] text-center text-rose-400 font-medium">
              {errorMessage}
            </p>
          )}
        </div>
      )}

      {/* Platform Mechanics Footer */}
      <div className="pt-2.5 mt-3 border-t border-[#21262d]/60 flex items-center justify-between text-[10px] text-[#6e7681]">
        <span>Resolves via admin review</span>
        <span>±10 pts on outcome</span>
      </div>

    </article>
  );
}
