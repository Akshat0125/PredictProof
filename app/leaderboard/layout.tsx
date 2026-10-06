import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Predictor Leaderboard — PredictProof",
  description:
    "Rankings, accuracy scores, streaks, and soulbound NFT tier eligibility on Solana devnet.",
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
