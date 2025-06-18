"use client";

import { FormattedValue } from "@/components/common";
import Button from "@/components/ui/Button";
import { track } from "@/utils/analytics";
import BigNumber from "bignumber.js";
import Image from "next/image";
import React from "react";

// Define a type for market-specific columns
type MarketSortColumn =
  | "asset"
  | "supplied"
  | "supplyApy"
  | "borrowed"
  | "borrowApy";

interface MarketRowProps {
  market: MarketWithValues;
  sortColumn?: MarketSortColumn;
  sortDirection?: SortDirection;
}

const MarketRow: React.FC<MarketRowProps> = ({
  market,
  sortColumn = "supplied",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sortDirection = "desc",
}) => {
  // Use the correct property names from MarketDataItem
  const totalSupplied = market.metrics.collateral_total_amount || "0";
  const totalBorrowed = market.metrics.debt_total_amount || "0";

  // Convert to actual token amounts
  const totalSuppliedAmount = new BigNumber(totalSupplied)
    .shiftedBy(-market.asset.decimals)
    .toString();

  const totalBorrowedAmount = new BigNumber(totalBorrowed)
    .shiftedBy(-market.asset.decimals)
    .toString();

  const highlightClass = (column: MarketSortColumn) => {
    return sortColumn === column ? "font-medium" : "";
  };

  // Mobile Card View (for small screens)
  const mobileView = (
    <div className="block sm:hidden p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="mr-3">
            <Image
              src={market.asset.icon || ""}
              width={36}
              height={36}
              alt={market.asset.symbol}
              className="rounded-full"
              onError={(e) => {
                // Handle error by hiding the image
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
          <div>
            <div className="font-medium text-lg text-gray-900 dark:text-white">
              {market.asset.symbol}
            </div>
            <div className="text-sm text-gray-500">{market.asset.name}</div>
          </div>
        </div>
        <Button
          variant="secondary"
          size="small"
          href={`/markets/${market.asset.symbol}`}
          className="ml-2"
        >
          Details
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Supply Section */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total Supplied
          </div>
          <div className="text-base text-gray-900 dark:text-white">
            <FormattedValue
              value={market.calculatedValues.suppliedUsd}
              prefix="$"
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            <FormattedValue
              value={totalSuppliedAmount}
              suffix={` ${market.asset.symbol}`}
            />
          </div>
          {new BigNumber(market.calculatedValues.supplyApy).isGreaterThan(
            0
          ) && (
            <div className="text-sm text-green-500">
              <FormattedValue
                value={market.calculatedValues.supplyApy}
                maxDecimals={2}
                suffix="% APY"
              />
            </div>
          )}
        </div>

        {/* Borrow Section */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total Borrowed
          </div>
          {new BigNumber(totalBorrowedAmount).isGreaterThan(0) && (
            <>
              <div className="text-base text-gray-900 dark:text-white">
                <FormattedValue
                  value={market.calculatedValues.borrowedUsd}
                  prefix="$"
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                <FormattedValue
                  value={totalBorrowedAmount}
                  suffix={` ${market.asset.symbol}`}
                />
              </div>
            </>
          )}
          {new BigNumber(market.calculatedValues.borrowApy).isGreaterThan(
            0
          ) && (
            <div className="text-sm text-yellow-500">
              <FormattedValue
                value={market.calculatedValues.borrowApy}
                maxDecimals={2}
                suffix="% APY"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Desktop Table Row View (for larger screens)
  const desktopView = (
    <div className="hidden sm:grid items-center grid-cols-7 px-6 py-4 text-sm">
      {/* Asset */}
      <div className="col-span-1 flex items-center">
        <div className="mr-3">
          <Image
            src={market.asset.icon || ""}
            width={32}
            height={32}
            alt={market.asset.symbol}
            className="rounded-full"
            onError={(e) => {
              // Handle error by hiding the image
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        </div>
        <div>
          <div
            className={`${highlightClass(
              "asset"
            )} text-gray-900 dark:text-white`}
          >
            {market.asset.symbol}
          </div>
          <div className="text-xs text-gray-500">{market.asset.name}</div>
        </div>
      </div>

      {/* Total Supplied */}
      <div className="col-span-1 text-right">
        <div
          className={`${highlightClass(
            "supplied"
          )} text-gray-900 dark:text-white`}
        >
          <FormattedValue
            value={market.calculatedValues.suppliedUsd}
            prefix="$"
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <FormattedValue
            value={totalSuppliedAmount}
            suffix={` ${market.asset.symbol}`}
          />
        </div>
      </div>

      {/* Supply APY */}
      <div className="col-span-1 text-right">
        {new BigNumber(market.calculatedValues.supplyApy).isGreaterThan(0) && (
          <div className={`${highlightClass("supplyApy")} text-green-500`}>
            <FormattedValue
              value={market.calculatedValues.supplyApy}
              maxDecimals={2}
              suffix="%"
            />
          </div>
        )}
      </div>

      {/* Total Borrowed */}
      <div className="col-span-1 text-right">
        {new BigNumber(totalBorrowedAmount).isGreaterThan(0) && (
          <>
            <div
              className={`${highlightClass(
                "borrowed"
              )} text-gray-900 dark:text-white`}
            >
              <FormattedValue
                value={market.calculatedValues.borrowedUsd}
                prefix="$"
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <FormattedValue
                value={totalBorrowedAmount}
                suffix={` ${market.asset.symbol}`}
              />
            </div>
          </>
        )}
      </div>

      {/* Borrow APY */}
      <div className="col-span-1 text-right">
        {new BigNumber(market.calculatedValues.borrowApy).isGreaterThan(0) && (
          <div className={`${highlightClass("borrowApy")} text-yellow-500`}>
            <FormattedValue
              value={market.calculatedValues.borrowApy}
              maxDecimals={2}
              suffix="%"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="col-span-2 space-x-2 flex justify-end">
        <Button
          variant="secondary"
          size="small"
          href={`/markets/${market.asset.symbol}`}
          onClick={() => track(`Visit ${market.asset.symbol} Market Details`)}
        >
          Details
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  );
};

export default MarketRow;
