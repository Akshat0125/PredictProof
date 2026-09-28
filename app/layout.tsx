import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SolanaProvider } from "@/components/SolanaProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PredictProof — Prediction Market Reputation & Soulbound Proofs",
  description:
    "Track live Panta prediction markets, score predictor accuracy on-chain, and earn soulbound NFT badges on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0d1117] text-[#f0f6fc] min-h-screen selection:bg-brand-500 selection:text-white`}
      >
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
