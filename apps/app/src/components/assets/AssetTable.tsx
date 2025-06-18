"use client";

import AssetItem from "@/components/assets/AssetItem";
import AssetTableSkeleton from "@/components/skeletons/AssetTableSkeleton";
import SortIndicator from "@/components/ui/SortIndicator";
import { FlickeringGrid } from "@/components/ui/FlickeringGrid";
import { sortArrayByProperty, toggleSortDirection } from "@/utils/sorting";
import { BigNumber } from "bignumber.js";
import React, { ReactNode, useEffect, useState } from "react";

interface AssetTableProps {
  title: string;
  assets?: MarketItem[];
  columns?: MarketColumn[];
  initialSortColumn?: SortColumn;
  initialSortDirection?: SortDirection;
  emptyMessage?: string;
  getApy?: (market: MarketItem) => string;
  action?: "supply" | "borrow" | "withdraw" | "repay";
  isLoading?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  infoAlert?: ReactNode;
  headerElement?: ReactNode;
  sublineContent?: ReactNode;
}

const AssetTable: React.FC<AssetTableProps> = ({
  title,
  assets = [],
  columns = [],
  initialSortColumn = "apy",
  initialSortDirection = "desc",
  emptyMessage = "No assets available",
  getApy = () => "0",
  action = "supply",
  isLoading = false,
  error = null,
  isEmpty = false,
  infoAlert,
  headerElement,
  sublineContent,
}) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>(initialSortColumn);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(initialSortDirection);

  // Update sort state when initialSortColumn or initialSortDirection change
  useEffect(() => {
    setSortColumn(initialSortColumn);
    setSortDirection(initialSortDirection);
  }, [initialSortColumn, initialSortDirection]);

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      // Toggle direction if clicking the same column
      setSortDirection(toggleSortDirection(sortDirection));
    } else {
      // Set new column and default to descending for APY, ascending for others
      setSortColumn(column);
      setSortDirection(column === "apy" ? "desc" : "asc");
    }
  };

  // Sort the assets
  const sortedAssets = React.useMemo(() => {
    if (!assets || assets.length === 0) return [];

    // Use the sortArrayByProperty function for the asset column
    if (sortColumn === "asset") {
      return sortArrayByProperty(
        assets,
        "asset" as keyof MarketItem,
        sortDirection
      );
    }

    // Create a copy of the assets array to sort
    return [...assets].sort((a, b) => {
      if (sortColumn === "balance") {
        // Sort by USD value instead of token amount
        // Use balanceUsd if available, otherwise calculate it from balance and price
        let aBalanceUsd: BigNumber;
        let bBalanceUsd: BigNumber;

        if (a.balanceUsd) {
          aBalanceUsd = new BigNumber(a.balanceUsd);
        } else if (a.price?.price && a.balance) {
          // Calculate USD value from token amount and price
          aBalanceUsd = new BigNumber(a.balance || "0")
            .shiftedBy(-(a.asset.decimals || 6))
            .multipliedBy(a.price.price);
        } else {
          aBalanceUsd = new BigNumber(0);
        }

        if (b.balanceUsd) {
          bBalanceUsd = new BigNumber(b.balanceUsd);
        } else if (b.price?.price && b.balance) {
          // Calculate USD value from token amount and price
          bBalanceUsd = new BigNumber(b.balance || "0")
            .shiftedBy(-(b.asset.decimals || 6))
            .multipliedBy(b.price.price);
        } else {
          bBalanceUsd = new BigNumber(0);
        }

        const comparison = aBalanceUsd.comparedTo(bBalanceUsd) || 0;
        return sortDirection === "asc" ? comparison : -comparison;
      } else if (sortColumn === "apy") {
        // Sort by APY value
        const aApy = new BigNumber(getApy(a) || "0");
        const bApy = new BigNumber(getApy(b) || "0");

        const comparison = aApy.comparedTo(bApy) || 0;
        return sortDirection === "asc" ? comparison : -comparison;
      }

      // Fallback sorting by asset symbol
      const comparison = a.asset.symbol.localeCompare(b.asset.symbol);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [assets, sortColumn, sortDirection, getApy]);

  // Loading content
  const loadingContent = (
    <AssetTableSkeleton columns={columns} headerElement={headerElement} />
  );

  // Error content
  const errorContent = (
    <div className="p-4 text-center text-red-500">
      {error
        ? `Error loading assets: ${error.message}`
        : "There was a problem loading assets"}
    </div>
  );

  // Determine content to display
  const getContent = () => {
    if (isEmpty) {
      return (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </div>
      );
    }

    if (isLoading) return loadingContent;
    if (error) return errorContent;
    if (assets.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div>
        {/* Table Headers - Only visible on larger screens */}
        <div className="hidden sm:grid grid-cols-4 gap-4 px-4 py-3 text-sm text-gray-500 border-b border-gray-200 dark:border-gray-800 dark:text-gray-400">
          {columns.map((column) => (
            <div
              key={column.id}
              onClick={() => handleSort(column.id)}
              className={`cursor-pointer hover:text-gray-900 dark:hover:text-white flex items-center ${
                column.align === "right" ? "justify-end text-right" : ""
              }`}
            >
              <span>{column.label}</span>
              <SortIndicator
                column={column.id}
                currentSortColumn={sortColumn}
                sortDirection={sortDirection}
              />
            </div>
          ))}
          <div></div>
        </div>

        {/* Asset Items */}
        <div className="grid grid-cols-1 sm:block">
          {sortedAssets.map((market: MarketItem) => (
            <AssetItem
              key={market.asset.denom}
              coin={{
                denom: market.asset.denom,
                amount: (market.balance as string) || "0",
              }}
              action={action}
              isBalanceLoading={!!market.isBalanceLoading}
              market={market}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sm:rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm mb-4 sm:mb-6">
      {/* Table header with FlickeringGrid background */}
      <div className="relative border-b border-gray-100 dark:border-zinc-800 overflow-hidden">
        {/* FlickeringGrid Background with gradient mask */}
        <FlickeringGrid
          className="absolute inset-0 z-0 size-full opacity-30"
          style={{
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
          }}
          squareSize={4}
          gridGap={6}
          color="#6B7280"
          maxOpacity={0.3}
          flickerChance={0.05}
          height={200}
          width={800}
        />

        <div
          className={`relative z-10 flex items-center px-4 sm:px-6 py-4 ${
            headerElement ? "justify-between" : ""
          }`}
        >
          <h2 className="text-lg sm:text-xl font-medium">{title}</h2>
          {headerElement}
        </div>
        {sublineContent && (
          <div className="relative z-10 flex items-center px-4 sm:px-6 pb-4 text-sm">
            {sublineContent}
          </div>
        )}
      </div>

      {!isLoading && infoAlert && infoAlert}

      {getContent()}
    </div>
  );
};

export default AssetTable;
