"use client";

import MarketRow from "@/components/markets/MarketRow";
import React, { useState } from "react";

// Define sort columns and direction using the global types from types.d.ts
// Extending the existing SortColumn for markets-specific sorting
type MarketSortColumn =
  | "asset"
  | "supplied"
  | "supplyApy"
  | "borrowed"
  | "borrowApy";

interface MarketTableProps {
  markets: MarketWithValues[];
}

const MarketTable: React.FC<MarketTableProps> = ({ markets }) => {
  // State for sorting
  const [sortColumn, setSortColumn] = useState<MarketSortColumn>("supplied");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Handle sorting
  const handleSort = (column: MarketSortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New column, default to descending
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  // Sort markets
  const sortedMarkets = [...markets].sort((a, b) => {
    let comparison = 0;

    switch (sortColumn) {
      case "asset":
        comparison = a.asset.symbol.localeCompare(b.asset.symbol);
        break;
      case "supplied":
        comparison =
          a.calculatedValues.suppliedUsd - b.calculatedValues.suppliedUsd;
        break;
      case "supplyApy":
        comparison =
          parseFloat(a.calculatedValues.supplyApy) -
          parseFloat(b.calculatedValues.supplyApy);
        break;
      case "borrowed":
        comparison =
          a.calculatedValues.borrowedUsd - b.calculatedValues.borrowedUsd;
        break;
      case "borrowApy":
        comparison =
          parseFloat(a.calculatedValues.borrowApy) -
          parseFloat(b.calculatedValues.borrowApy);
        break;
      default:
        comparison = 0;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Sort indicator component
  const SortIndicator = ({ column }: { column: MarketSortColumn }) => {
    const isActive = sortColumn === column;

    return (
      <div className="inline-flex flex-col ml-1 h-3">
        <svg
          width="8"
          height="4"
          viewBox="0 0 8 4"
          fill="none"
          className={`${
            isActive && sortDirection === "asc"
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 dark:text-gray-600"
          } mb-0.5`}
        >
          <path d="M4 0L8 4H0L4 0Z" fill="currentColor" />
        </svg>
        <svg
          width="8"
          height="4"
          viewBox="0 0 8 4"
          fill="none"
          className={`${
            isActive && sortDirection === "desc"
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 dark:text-gray-600"
          }`}
        >
          <path d="M4 4L0 0H8L4 4Z" fill="currentColor" />
        </svg>
      </div>
    );
  };

  return (
    <div className="overflow-hidden bg-white sm:rounded-lg shadow dark:bg-gray-900">
      {/* Desktop Table Headers - Hidden on mobile */}
      <div className="hidden sm:grid grid-cols-7 px-6 py-3 text-sm text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-800">
        <div
          className="col-span-1 flex items-center cursor-pointer hover:text-gray-900 dark:hover:text-white"
          onClick={() => handleSort("asset")}
        >
          Asset
          <SortIndicator column="asset" />
        </div>
        <div
          className="col-span-1 text-right flex items-center justify-end cursor-pointer hover:text-gray-900 dark:hover:text-white"
          onClick={() => handleSort("supplied")}
        >
          Total supplied
          <SortIndicator column="supplied" />
        </div>
        <div
          className="col-span-1 text-right flex items-center justify-end cursor-pointer hover:text-gray-900 dark:hover:text-white"
          onClick={() => handleSort("supplyApy")}
        >
          Supply APY
          <SortIndicator column="supplyApy" />
        </div>
        <div
          className="col-span-1 text-right flex items-center justify-end cursor-pointer hover:text-gray-900 dark:hover:text-white"
          onClick={() => handleSort("borrowed")}
        >
          Total borrowed
          <SortIndicator column="borrowed" />
        </div>
        <div
          className="col-span-1 text-right flex items-center justify-end cursor-pointer hover:text-gray-900 dark:hover:text-white"
          onClick={() => handleSort("borrowApy")}
        >
          Borrow APY
          <SortIndicator column="borrowApy" />
        </div>
        <div className="col-span-2 text-right"></div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {sortedMarkets.map((market) => (
          <MarketRow
            key={market.asset.denom}
            market={market}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
          />
        ))}
      </div>
    </div>
  );
};

export default MarketTable;
