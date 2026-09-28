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
    pda: "FjV66HDuqV2N4fjES1ftTNZMAZ8yjc9rv6uv6KJeFtR7",
    badgeUri: "https://predictproof.vercel.app/badges/bronze.json",
    imagePath: "/badges/bronze.png",
    requirement: "3+ correct prediction picks",
  },
  silver: {
    tier: "silver",
    name: "PredictProof Silver",
    pda: "29e6YVdY9YfAZEsQuhSEXHUctvKHdJyzN3bqdkgR2UBy",
    badgeUri: "https://predictproof.vercel.app/badges/silver.json",
    imagePath: "/badges/silver.png",
    requirement: "7+ correct picks at 60%+ accuracy",
  },
  gold: {
    tier: "gold",
    name: "PredictProof Gold",
    pda: "CUxb8UdS9y24sKz21T66SJCmhX3M1mbwbycMcLsfstTh",
    badgeUri: "https://predictproof.vercel.app/badges/gold.json",
    imagePath: "/badges/gold.png",
    requirement: "15+ correct picks at 75%+ accuracy",
  },
  underdog: {
    tier: "underdog",
    name: "PredictProof Underdog",
    pda: "FWNQhBSF685vuLXDzBwqNwTZWmkHttETRa7Sb2dNoGXn",
    badgeUri: "https://predictproof.vercel.app/badges/underdog.json",
    imagePath: "/badges/underdog.png",
    requirement: "Correctly called an outcome priced at 15% or lower",
  },
};
