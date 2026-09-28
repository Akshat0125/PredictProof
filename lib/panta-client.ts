/**
 * Panta Prediction Market API Client
 * 
 * Verified Base URL: https://live-api.panta.market/api/v1
 * Endpoint: GET /markets/
 * Auth: X-Api-Key: <key>
 * 
 * CRITICAL RULE: Only verified endpoints are used.
 * No guessing endpoints or shapes.
 */

export interface PantaMarket {
  marketId: string;
  category: string;
  title: string;
  description: string;
  images: string[];
  phase: string;
  marketType: string;
  startTime: string;
  endTime: string;
  resolutionTime: string;
  region: string;
  resolved: boolean;
  status: string;
  volumeUsdc: string;
  yesPrice: string;
  noPrice: string;
  primaryYesPrice: string;
  primaryNoPrice: string;
  secondaryYesPrice: string | null;
  secondaryNoPrice: string | null;
}

export interface PantaMarketsResponse {
  items: PantaMarket[];
  nextCursor: string | null;
  disclaimer?: string;
  isMockFallback?: boolean;
}

const PANTA_API_BASE_URL = "https://live-api.panta.market/api/v1";

// Sandbox fallback fixture matching the exact real sandbox fixture shape
const SANDBOX_FALLBACK_FIXTURE: PantaMarketsResponse = {
  items: [
    {
      marketId: "panta-sandbox-market-001",
      category: "Crypto",
      title: "Will Solana hit an all-time high by Q4 2026?",
      description: "Standard binary prediction market resolving based on official index price feed.",
      images: [],
      phase: "primary",
      marketType: "standard",
      startTime: "2026-09-01T00:00:00Z",
      endTime: "2026-12-31T23:59:59Z",
      resolutionTime: "2026-12-31T23:59:59Z",
      region: "global",
      resolved: false,
      status: "primary",
      volumeUsdc: "10500.00",
      yesPrice: "0.50",
      noPrice: "0.50",
      primaryYesPrice: "0.50",
      primaryNoPrice: "0.50",
      secondaryYesPrice: null,
      secondaryNoPrice: null,
    },
  ],
  nextCursor: null,
  disclaimer: "Test mode: this response uses sandbox fixtures",
  isMockFallback: true,
};

/**
 * Fetch markets from the verified Panta GET /markets/ endpoint.
 * Requires PANTA_API_KEY in environment variables.
 */
export async function getMarkets(options?: {
  cursor?: string;
}): Promise<PantaMarketsResponse> {
  const apiKey = process.env.PANTA_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    console.warn(
      "[PantaClient] PANTA_API_KEY is not defined in .env.local. Using sandbox fixture fallback."
    );
    return SANDBOX_FALLBACK_FIXTURE;
  }

  const url = new URL(`${PANTA_API_BASE_URL}/markets/`);
  if (options?.cursor) {
    url.searchParams.set("cursor", options.cursor);
  }

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-Api-Key": apiKey.trim(),
        Accept: "application/json",
      },
      // Revalidate periodically or ensure fresh data without breaking cache
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(
        `[PantaClient] GET /markets/ failed with status ${res.status}: ${errText}`
      );
      // Fallback gracefully so UI doesn't crash if API key has issues or rate limit occurs
      return {
        ...SANDBOX_FALLBACK_FIXTURE,
        disclaimer: `Panta API error (${res.status}). Displaying sandbox fixture.`,
        isMockFallback: true,
      };
    }

    const data: PantaMarketsResponse = await res.json();
    return {
      items: data.items || [],
      nextCursor: data.nextCursor ?? null,
      disclaimer: data.disclaimer,
      isMockFallback: false,
    };
  } catch (error) {
    console.error("[PantaClient] Network error connecting to Panta API:", error);
    return {
      ...SANDBOX_FALLBACK_FIXTURE,
      disclaimer: "Network connection error. Displaying sandbox fixture.",
      isMockFallback: true,
    };
  }
}
