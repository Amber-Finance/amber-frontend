"use client";

import Image from "next/image";
import React from "react";

interface MarketHeaderProps {
  market: Market;
}

const MarketHeader: React.FC<MarketHeaderProps> = ({ market }) => {
  if (!market || !market.asset) return null;

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
      </div>
    </div>
  );
};

export default MarketHeader;
