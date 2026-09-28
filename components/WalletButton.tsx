"use client";

import React, { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function WalletButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-28 sm:w-36 rounded-lg bg-[#21262d] animate-pulse" />
    );
  }

  return (
    <div className="wallet-button-wrapper">
      <WalletMultiButton />
    </div>
  );
}
