"use client";

import { FormattedValue } from "@/components/common";
import React from "react";

interface MarketStatsProps {
  totalMarketSize: number;
  totalAvailable: number;
  totalBorrows: number;
}

const MarketStats: React.FC<MarketStatsProps> = ({
  totalMarketSize,
  totalAvailable,
  totalBorrows,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
      <div className="p-4 bg-white sm:rounded-lg shadow dark:bg-gray-900">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total market size
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          <FormattedValue value={totalMarketSize} prefix="$" />
        </div>
      </div>
      <div className="p-4 bg-white sm:rounded-lg shadow dark:bg-gray-900">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total available
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          <FormattedValue value={totalAvailable} prefix="$" />
        </div>
      </div>
      <div className="p-4 bg-white sm:rounded-lg shadow dark:bg-gray-900">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total borrows
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          <FormattedValue value={totalBorrows} prefix="$" />
        </div>
      </div>
    </div>
  );
};

export default MarketStats;
