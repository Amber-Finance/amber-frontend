"use client";

import Tooltip from "@/components/ui/Tooltip";
import { copyToClipboard } from "@/utils/clipboard";
import Image from "next/image";
import React, { useState } from "react";

interface MarketHeaderProps {
  market: Market;
}

const MarketHeader: React.FC<MarketHeaderProps> = ({ market }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!market || !market.asset) return null;

  const handleCopyDenom = async () => {
    const success = await copyToClipboard(market.asset.denom);
    if (success) {
      setShowTooltip(true);
    }
  };

  return (
    <div className="flex items-center mb-4 sm:mb-6 bg-white dark:bg-zinc-900 p-3 sm:p-4 sm:rounded-lg shadow">
      <div className="mr-3 sm:mr-4">
        {market.asset.icon && (
          <Image
            src={market.asset.icon}
            alt={market.asset.symbol}
            width={48}
            height={48}
            className="rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        )}
      </div>
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
          {market.asset.name}
        </h1>
        <div className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
          {market.asset.symbol}
        </div>
        <div className="relative inline-block">
          <button
            onClick={handleCopyDenom}
            className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer font-mono"
          >
            {market.asset.denom}
          </button>
          <Tooltip
            show={showTooltip}
            message="Copied to clipboard"
            onDismiss={() => setShowTooltip(false)}
            position="top"
          />
        </div>
      </div>
    </div>
  );
};

export default MarketHeader;
