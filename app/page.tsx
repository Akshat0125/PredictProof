import { getMarkets } from "@/lib/panta-client";
import { MarketFeed } from "@/components/MarketFeed";

// Revalidate every 30 seconds for fresh market odds
export const revalidate = 30;

export default async function HomePage() {
  const { items, disclaimer, isMockFallback } = await getMarkets();

  return (
    <MarketFeed
      initialMarkets={items}
      disclaimer={disclaimer}
      isMockFallback={isMockFallback}
    />
  );
}
