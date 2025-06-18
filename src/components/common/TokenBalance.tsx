"use client";

import FormattedValue from "@/components/common/FormattedValue";
import { useStore } from "@/store/useStore";
import { calculateUsdValue } from "@/utils/format";
import { BigNumber } from "bignumber.js";
import React from "react";

interface TokenBalanceProps {
  coin: Coin; // Required coin object with denom and amount
  size?: "sm" | "md" | "lg";
  align?: "left" | "right" | "center";
  className?: string;
}

/**
 * TokenBalance component displays a token amount with its USD value underneath.
 * Uses the FormattedValue component for consistent formatting across the application.
 * Gets the USD value automatically from the store based on the coin's denom.
 */
const TokenBalance: React.FC<TokenBalanceProps> = ({
  coin,
  size = "md",
  align = "right",
  className = "",
}) => {
  // Get markets data from the store
  const { markets } = useStore();

  // Set font sizes based on size prop, with responsive variants
  const amountTextSize =
    size === "sm"
      ? "text-xs sm:text-sm"
      : size === "lg"
      ? "text-base sm:text-lg"
      : "text-sm sm:text-base";

  const valueTextSize =
    size === "sm"
      ? "text-xxs sm:text-xs"
      : size === "lg"
      ? "text-sm sm:text-base"
      : "text-xs sm:text-sm";

  // Set alignment classes
  const alignmentClass =
    align === "left"
      ? "text-left"
      : align === "center"
      ? "text-center"
      : "text-right";

  // Calculate USD value from the store using coin.denom
  let usdValue = "0";
  let adjustedAmount = "0";

  if (markets && coin.denom && coin.amount) {
    // Find the matching market for this coin
    const market = markets.find((market) => market.asset.denom === coin.denom);

    if (market?.price?.price) {
      const decimals = market.asset.decimals || 6;
      usdValue = calculateUsdValue(
        coin.amount,
        market.price.price,
        decimals
      ).toString();
    }
    if (market?.asset) {
      adjustedAmount = new BigNumber(coin.amount)
        .shiftedBy(-market.asset.decimals)
        .toString();
    }
  }

  // Only show USD value if it's not zero
  const showUsdValue = usdValue !== "0";

  return (
    <div className={`${alignmentClass} ${className}`}>
      <div
        className={`${amountTextSize} text-gray-900 dark:text-white font-medium truncate`}
      >
        <FormattedValue value={adjustedAmount} isCurrency={false} />
      </div>
      {showUsdValue && (
        <div
          className={`${valueTextSize} text-gray-500 dark:text-gray-400 opacity-50 truncate`}
        >
          <FormattedValue value={usdValue} isCurrency={true} />
        </div>
      )}
    </div>
  );
};

export default TokenBalance;
