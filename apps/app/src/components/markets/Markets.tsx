"use client";

import MarketTable from "@/components/markets/MarketTable";
import { useMarkets } from "@/hooks/useMarkets";
import { useStore } from "@/store/useStore";
import { convertAprToApy } from "@/utils/finance";
import { calculateUsdValue } from "@/utils/format";
import { BigNumber } from "bignumber.js";
import React from "react";

/**
 * Markets component displays a list of all available markets
 * with their supply and borrow information.
 */
const Markets: React.FC = () => {
  const { marketsData } = useMarkets();
  const { markets } = useStore();

  // Process market data for display
  const processedMarkets = React.useMemo(() => {
    if (!marketsData || !markets) return [];

    return markets.map((market) => {
      // Calculate USD values
      const suppliedUsd = market.metrics.collateral_total_amount
        ? calculateUsdValue(
            market.metrics.collateral_total_amount,
            market.price?.price || "0",
            market.asset.decimals
          )
        : 0;

      const borrowedUsd = market.metrics.debt_total_amount
        ? calculateUsdValue(
            market.metrics.debt_total_amount,
            market.price?.price || "0",
            market.asset.decimals
          )
        : 0;

      // Calculate liquidity (supplied - borrowed)
      const liquidityUsd = Math.max(0, suppliedUsd - borrowedUsd);

      // Calculate APYs
      const supplyApy = convertAprToApy(
        new BigNumber(market.metrics.liquidity_rate || "0").toString()
      );
      const borrowApy = convertAprToApy(
        new BigNumber(market.metrics.borrow_rate || "0").toString()
      );

      return {
        ...market,
        calculatedValues: {
          suppliedUsd,
          borrowedUsd,
          liquidityUsd,
          supplyApy,
          borrowApy,
        },
      } as MarketWithValues;
    });
  }, [marketsData, markets]);

  return (
    <div className="mt-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        All Markets
      </h2>
      <MarketTable markets={processedMarkets} />
    </div>
  );
};

export default Markets;
