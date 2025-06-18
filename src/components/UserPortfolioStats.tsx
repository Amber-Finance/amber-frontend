"use client";

import { FormattedValue } from "@/components/common";
import HealthFactorModal from "@/components/modals/HealthFactorModal";
import UserPortfolioStatsSkeleton from "@/components/skeletons/UserPortfolioStatsSkeleton";
import { Button } from "@/components/ui/Button";
import chainConfig from "@/config/chain";
import useHealthComputer from "@/hooks/useHealthComputer";
import { useStore } from "@/store/useStore";
import { calculateTotalApy } from "@/utils/finance";
import { calculateUsdValue } from "@/utils/format";
import { useChain } from "@cosmos-kit/react";
import { BigNumber } from "bignumber.js";
import React, { useState } from "react";

/**
 * UserPortfolioStats component displays the user's net worth and net APY
 * when they're connected to the wallet. It calculates these values based
 * on the user's deposits and debts stored in the markets store.
 */
const UserPortfolioStats: React.FC = () => {
  const { address } = useChain(chainConfig.name);
  const { markets } = useStore();
  const { healthFactor } = useHealthComputer();
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

  // Show loading skeleton if user is connected but markets are still loading
  if (address && (!markets || markets.length === 0)) {
    return <UserPortfolioStatsSkeleton />;
  }

  // Only calculate and render if user is connected and markets are loaded
  if (!address || !markets || markets.length === 0) {
    return null;
  }

  // Calculate total deposits, debts, and net worth
  let totalDepositsUSD = new BigNumber(0);
  let totalDebtsUSD = new BigNumber(0);

  // Process all markets to calculate total values
  markets.forEach((market) => {
    // Skip markets without price data
    if (!market.price?.price) return;

    // Calculate deposit value if user has deposited in this market
    if (new BigNumber(market.deposit || "0").isGreaterThan(0)) {
      const depositValue = calculateUsdValue(
        market.deposit || "0",
        market.price.price,
        market.asset.decimals
      );

      totalDepositsUSD = totalDepositsUSD.plus(depositValue);
    }

    // Calculate debt value if user has debt in this market
    if (new BigNumber(market.debt || "0").isGreaterThan(0)) {
      const debtValue = calculateUsdValue(
        market.debt || "0",
        market.price.price,
        market.asset.decimals
      );

      totalDebtsUSD = totalDebtsUSD.plus(debtValue);
    }
  });

  // Calculate net worth
  const netWorthUSD = totalDepositsUSD.minus(totalDebtsUSD);

  // Calculate net APY using the helper function
  const netApy = calculateTotalApy(markets);

  // Only render if user has deposits or debts
  if (totalDepositsUSD.isZero() && totalDebtsUSD.isZero()) {
    return null;
  }

  return (
    <div className="mb-6 px-4 lg:px-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-4 sm:space-y-0">
          {/* Net Worth */}
          <div>
            <div className="mb-1 text-sm text-gray-500 dark:text-gray-500">
              Net worth
            </div>
            <div className="text-xl font-medium text-gray-900 dark:text-white">
              <FormattedValue
                value={netWorthUSD.toString()}
                isCurrency={true}
              />
            </div>
          </div>

          {/* Net APY */}
          <div>
            <div className="mb-1 text-sm text-gray-500 dark:text-gray-500">
              Net APY
            </div>
            <div
              className={`text-xl font-medium ${
                netApy.isGreaterThan(0)
                  ? "text-green-500"
                  : netApy.isLessThan(0)
                  ? "text-orange-500"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              <FormattedValue
                value={netApy.toString()}
                suffix="%"
                maxDecimals={2}
              />
            </div>
          </div>
          {healthFactor && (
            <div>
              <div className="mb-1 text-sm text-gray-500 dark:text-gray-500">
                Health Factor
              </div>
              <div className="flex flex-wrap gap-2 text-xl font-medium items-center">
                <FormattedValue
                  className={
                    healthFactor >= 2.5
                      ? "text-green-500"
                      : healthFactor > 1.2
                      ? "text-yellow-500"
                      : "text-red-500"
                  }
                  value={healthFactor.toString()}
                  maxDecimals={2}
                />
                <Button
                  variant="secondary"
                  className="ml-1"
                  size="xs"
                  onClick={() => setIsHealthModalOpen(true)}
                >
                  Info
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <HealthFactorModal
        isHealthModalOpen={isHealthModalOpen}
        setIsHealthModalOpen={setIsHealthModalOpen}
        healthFactor={healthFactor}
      />
    </div>
  );
};

export default UserPortfolioStats;
