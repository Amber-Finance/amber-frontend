"use client";

import InstanceHeader from "@/components/InstanceHeader";
import MarketSearch from "@/components/markets/MarketSearch";
import MarketStats from "@/components/markets/MarketStats";
import MarketTable from "@/components/markets/MarketTable";
import MarketPageSkeleton from "@/components/skeletons/MarketPageSkeleton";
import { useMarkets } from "@/hooks/useMarkets";
import { useStore } from "@/store/useStore";
import { track } from "@/utils/analytics";
import { convertAprToApy } from "@/utils/finance";
import { calculateUsdValue } from "@/utils/format";
import BigNumber from "bignumber.js";
import { useCallback, useEffect, useState } from "react";

// Define the markets page component
export default function MarketsOverview() {
  // Get market data
  useMarkets();
  const { markets } = useStore();
  const [processedMarkets, setProcessedMarkets] = useState<MarketWithValues[]>(
    []
  );
  const [totalMarketSize, setTotalMarketSize] = useState<number>(0);
  const [totalAvailable, setTotalAvailable] = useState<number>(0);
  const [totalBorrows, setTotalBorrows] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Track markets visit when component mounts
  useEffect(() => {
    track("Visit Markets");
  }, []);

  // Calculate market values
  const calculateMarketValues = useCallback(
    (market: Market): MarketWithValues => {
      const price = market.price?.price || "0";

      // Use the correct property names from MarketDataItem
      const totalSupplied = market.metrics.collateral_total_amount || "0";
      const totalBorrowed = market.metrics.debt_total_amount || "0";

      // Calculate available liquidity in the UI component
      const collateralTotal = new BigNumber(totalSupplied);
      const debtTotal = new BigNumber(totalBorrowed);
      const availableLiquidity = BigNumber.max(
        0,
        collateralTotal.minus(debtTotal)
      ).toString();

      const borrowApy = convertAprToApy(market.metrics.borrow_rate || "0");
      const supplyApy = convertAprToApy(market.metrics.liquidity_rate || "0");

      const suppliedUsd = calculateUsdValue(
        totalSupplied,
        price,
        market.asset.decimals
      );
      const borrowedUsd = calculateUsdValue(
        totalBorrowed,
        price,
        market.asset.decimals
      );
      const liquidityUsd = calculateUsdValue(
        availableLiquidity,
        price,
        market.asset.decimals
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
      };
    },
    []
  );

  // Process markets when they change
  useEffect(() => {
    if (!markets || markets.length === 0) return;

    // Calculate values for all markets
    const marketsWithValues = markets.map((market) =>
      calculateMarketValues(market as unknown as Market)
    );

    // Filter by search term if provided
    const filtered = searchTerm
      ? marketsWithValues.filter(
          (market) =>
            market.asset.symbol
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            market.asset.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            market.asset.denom.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : marketsWithValues;

    // Calculate totals
    let marketSize = 0;
    let available = 0;
    let borrows = 0;

    filtered.forEach((market) => {
      marketSize += market.calculatedValues.suppliedUsd;
      available += market.calculatedValues.liquidityUsd;
      borrows += market.calculatedValues.borrowedUsd;
    });

    setTotalMarketSize(marketSize);
    setTotalAvailable(available);
    setTotalBorrows(borrows);
    setProcessedMarkets(filtered);
  }, [markets, calculateMarketValues, searchTerm]);

  // Handle loading state
  if (!markets) {
    return <MarketPageSkeleton />;
  }

  return (
    <div className="w-full px-0 lg:container lg:px-4 py-8 mx-auto">
      {/* Header */}
      <InstanceHeader />

      {/* Market Stats */}
      <MarketStats
        totalMarketSize={totalMarketSize}
        totalAvailable={totalAvailable}
        totalBorrows={totalBorrows}
      />

      {/* Search field - always visible */}
      <div className="overflow-hidden bg-white sm:rounded-lg shadow dark:bg-gray-900">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Markets
          </h2>
        </div>
        <MarketSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Market Table or No Results Message */}
        {processedMarkets.length > 0 ? (
          <MarketTable markets={processedMarkets} />
        ) : (
          <div className="p-8 text-center">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              No Markets Found
            </h3>
            {searchTerm && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                No markets match your search criteria. Try a different search
                term.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
