import { BadgeTier } from "./scoring";

export interface BadgeTierConfig {
  tier: BadgeTier;
  name: string;
  pda: string;
  badgeUri: string;
  imagePath: string;
  requirement: string;
}

/**
 * On-chain event configuration for each soulbound badge tier.
 * PDAs are initialized via `scripts/setup-badge-tiers.ts`.
 */
export const BADGE_TIER_CONFIGS: Record<Exclude<BadgeTier, "none">, BadgeTierConfig> = {
  bronze: {
    tier: "bronze",
    name: "PredictProof Bronze",
    pda: "DBnXQPhYk4MmvNaysZ5Tx5F9NSo4AbiMAsbPdgPVJy2i",
    badgeUri: "https://predict-proof.vercel.app/badges/bronze.json",
    imagePath: "/badges/bronze.png",
    requirement: "3+ correct prediction picks",
  },
  silver: {
    tier: "silver",
    name: "PredictProof Silver",
    pda: "7QuyyoF7RLmmWNDqBcN5PCgYdHSsM3ukhxJeSqRhdVZH",
    badgeUri: "https://predict-proof.vercel.app/badges/silver.json",
    imagePath: "/badges/silver.png",
    requirement: "7+ correct picks at 60%+ accuracy",
  },
  gold: {
    tier: "gold",
    name: "PredictProof Gold",
    pda: "ARYbqTjn5KrsNj6MgZDoJHoKqsfxYgz6v2Y5WhKbZnxH",
    badgeUri: "https://predict-proof.vercel.app/badges/gold.json",
    imagePath: "/badges/gold.png",
    requirement: "15+ correct picks at 75%+ accuracy",
  },
  underdog: {
    tier: "underdog",
    name: "PredictProof Underdog",
    pda: "YFcNVPXtPmwxT3rARz4FHhSxXmvunGZ3jZ5zkFVU9Wb",
    badgeUri: "https://predict-proof.vercel.app/badges/underdog.json",
    imagePath: "/badges/underdog.png",
    requirement: "Correctly called an outcome priced at 15% or lower",
  },
};
