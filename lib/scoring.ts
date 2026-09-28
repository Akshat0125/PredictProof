/**
 * PredictProof Reputation & Scoring Engine
 * 
 * Pure functions, fully unit-testable, no React or network dependencies.
 * Evaluates predictor accuracy across resolved prediction markets.
 */

export interface MarketPosition {
  wallet: string;
  side: "YES" | "NO";
  amountUsdc: string;
  priceAtEntry: string;
}

export interface ResolvedMarket {
  marketId: string;
  eventId: string;
  category: string;
  title: string;
  resolved: boolean;
  winningOutcome: "YES" | "NO";
  primaryYesPrice: string;
  primaryNoPrice: string;
  positions: MarketPosition[];
}

export interface EnrichedPosition extends MarketPosition {
  marketId: string;
  eventId: string;
  category: string;
  marketTitle: string;
  winningOutcome: "YES" | "NO";
  isCorrect: boolean;
  marketOrderIndex: number;
}

export type BadgeTier = "none" | "bronze" | "silver" | "gold" | "underdog";

export interface WalletScore {
  wallet: string;
  totalPicks: number;
  correctPicks: number;
  accuracyPct: number;
  underdogBonus: number;
  currentStreak: number;
  totalScore: number;
  badgeTier: BadgeTier;
  hasUnderdogPick: boolean;
  badges: BadgeTier[];
  positions: EnrichedPosition[];
}

/**
 * 1. Groups all positions from resolved markets by wallet address,
 * enriching each position with market context and correctness.
 */
export function groupPositionsByWallet(
  resolvedMarkets: ResolvedMarket[]
): Record<string, EnrichedPosition[]> {
  const map: Record<string, EnrichedPosition[]> = {};

  resolvedMarkets.forEach((market, marketIndex) => {
    if (!market.resolved || !market.positions) return;

    market.positions.forEach((pos) => {
      if (!map[pos.wallet]) {
        map[pos.wallet] = [];
      }

      const isCorrect = pos.side === market.winningOutcome;

      map[pos.wallet].push({
        ...pos,
        marketId: market.marketId,
        eventId: market.eventId,
        category: market.category,
        marketTitle: market.title,
        winningOutcome: market.winningOutcome,
        isCorrect,
        marketOrderIndex: marketIndex,
      });
    });
  });

  return map;
}

/**
 * 4. Determines the badge tier based on performance metrics.
 * - bronze: correctPicks >= 3
 * - silver: correctPicks >= 7 AND accuracyPct >= 60
 * - gold: correctPicks >= 15 AND accuracyPct >= 75
 * - underdog: any single correct pick with priceAtEntry <= 0.15 (checked independently)
 */
export function getBadgeTier(score: {
  correctPicks: number;
  accuracyPct: number;
  hasUnderdogPick?: boolean;
}): BadgeTier {
  if (score.correctPicks >= 15 && score.accuracyPct >= 75) {
    return "gold";
  }
  if (score.correctPicks >= 7 && score.accuracyPct >= 60) {
    return "silver";
  }
  // Underdog tier honors contrarian / high-risk correct picks
  if (score.hasUnderdogPick) {
    return "underdog";
  }
  if (score.correctPicks >= 3) {
    return "bronze";
  }
  return "none";
}

/**
 * Returns all badge tiers a wallet qualifies for (useful for profile badge grid).
 */
export function getAllBadges(score: {
  correctPicks: number;
  accuracyPct: number;
  hasUnderdogPick?: boolean;
}): BadgeTier[] {
  const badges: BadgeTier[] = [];
  if (score.correctPicks >= 15 && score.accuracyPct >= 75) {
    badges.push("gold");
  } else if (score.correctPicks >= 7 && score.accuracyPct >= 60) {
    badges.push("silver");
  } else if (score.correctPicks >= 3) {
    badges.push("bronze");
  }

  if (score.hasUnderdogPick) {
    badges.push("underdog");
  }

  return badges;
}

/**
 * 2. Computes the reputation metrics and score for a single wallet.
 */
export function scoreWallet(
  wallet: string,
  positions: EnrichedPosition[] = []
): WalletScore {
  const totalPicks = positions.length;
  const correctPicks = positions.filter((p) => p.isCorrect).length;

  const accuracyPct =
    totalPicks > 0
      ? Number(((correctPicks / totalPicks) * 100).toFixed(1))
      : 0;

  // Underdog bonus: sum of (0.5 - priceAtEntry) * 2 for each correct pick where priceAtEntry < 0.5, floored at 0
  let rawUnderdogBonus = 0;
  let hasUnderdogPick = false;

  for (const pos of positions) {
    if (pos.isCorrect) {
      const price = parseFloat(pos.priceAtEntry) || 0.5;
      if (price < 0.5) {
        rawUnderdogBonus += Math.max(0, (0.5 - price) * 2);
      }
      if (price <= 0.15) {
        hasUnderdogPick = true;
      }
    }
  }

  const underdogBonus = Number(rawUnderdogBonus.toFixed(2));

  // Current streak: consecutive correct picks, most recent first
  // Uses marketOrderIndex descending (end of mock file is most recent)
  const sortedPositions = [...positions].sort(
    (a, b) => b.marketOrderIndex - a.marketOrderIndex
  );

  let currentStreak = 0;
  for (const pos of sortedPositions) {
    if (pos.isCorrect) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Total score: correctPicks + underdogBonus + (currentStreak >= 3 ? currentStreak * 0.5 : 0)
  const streakBonus = currentStreak >= 3 ? currentStreak * 0.5 : 0;
  const totalScore = Number(
    (correctPicks + underdogBonus + streakBonus).toFixed(2)
  );

  const badgeTier = getBadgeTier({
    correctPicks,
    accuracyPct,
    hasUnderdogPick,
  });

  const badges = getAllBadges({
    correctPicks,
    accuracyPct,
    hasUnderdogPick,
  });

  return {
    wallet,
    totalPicks,
    correctPicks,
    accuracyPct,
    underdogBonus,
    currentStreak,
    totalScore,
    badgeTier,
    hasUnderdogPick,
    badges,
    positions: sortedPositions,
  };
}

/**
 * 3. Evaluates and ranks all wallets in resolved markets, highest totalScore first.
 */
export function rankWallets(resolvedMarkets: ResolvedMarket[]): WalletScore[] {
  const grouped = groupPositionsByWallet(resolvedMarkets);

  const scores = Object.entries(grouped).map(([wallet, positions]) =>
    scoreWallet(wallet, positions)
  );

  // Sort descending by totalScore, then accuracyPct, then totalPicks
  return scores.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    if (b.accuracyPct !== a.accuracyPct) {
      return b.accuracyPct - a.accuracyPct;
    }
    return b.totalPicks - a.totalPicks;
  });
}
