/**
 * Market Grouping Configuration
 * 
 * Panta markets are strictly binary (each market only has yesPrice & noPrice).
 * Real-world multi-outcome events (e.g., presidential election, tournament winner)
 * are modeled as multiple binary markets grouped together in this app-level data layer.
 * 
 * Maps eventId -> array of marketIds
 */

export interface EventGrouping {
  eventId: string;
  eventTitle: string;
  category: string;
  description: string;
  marketIds: string[];
}

export const EVENT_GROUPINGS: Record<string, EventGrouping> = {
  "solana-ecosystem-2026": {
    eventId: "solana-ecosystem-2026",
    eventTitle: "Solana Ecosystem Milestones 2026",
    category: "Crypto",
    description: "Milestones and key target achievements across the Solana ecosystem.",
    marketIds: ["panta-sandbox-market-001"],
  },
};

/**
 * Helper to retrieve an event grouping for a given market ID.
 */
export function getGroupByMarketId(marketId: string): EventGrouping | undefined {
  return Object.values(EVENT_GROUPINGS).find((group) =>
    group.marketIds.includes(marketId)
  );
}
