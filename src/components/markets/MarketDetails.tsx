"use client";

import {
  InterestRateModelBox,
  MarketHeader,
  MarketInfoBox,
  UserPositionBox,
} from "@/components/markets";
import { MetricCard, MetricRow } from "@/components/metrics";
import MarketDetailsSkeleton from "@/components/skeletons/MarketDetailsSkeleton";
import chainConfig from "@/config/chain";
import { useMarketMetrics } from "@/hooks";
import { useMarkets } from "@/hooks/useMarkets";
import useUserPositions from "@/hooks/useUserPositions";
import useWalletBalances from "@/hooks/useWalletBalances";
import { useStore } from "@/store/useStore";
import { calculateUsdValue } from "@/utils/format";
import { useChain } from "@cosmos-kit/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function MarketDetails() {
  const { isLoading: marketsLoading } = useMarkets();
  const { isLoading: walletBalancesLoading } = useWalletBalances();
  const { isLoading: userPositionsLoading } = useUserPositions();
  const params = useParams();
  const symbol = params.symbol as string;
  const markets = useStore((state) => state.markets);
  const { address } = useChain(chainConfig.name);

  // Find the market with the matching symbol
  const market = useMemo(() => {
    if (!markets) return null;
    return markets.find((m) => m.asset.symbol === symbol);
  }, [markets, symbol]);

  // Always call the hook, but handle the null market case inside the hook
  // By providing a fallback empty market object, we ensure the hook is always called
  const marketForHook = market || ({} as Market);
  const metrics = useMarketMetrics(marketForHook);

  // Calculate APR values from market data
  const borrowApr = useMemo(() => {
    if (!market) return 0;
    // Get APR from interest rate model based on current utilization
    const interestRateModel = market.metrics.interest_rate_model;
    const currentUtil = metrics.utilizationRate / 100; // Convert to decimal
    const optimalUtil = parseFloat(interestRateModel.optimal_utilization_rate);
    const base = parseFloat(interestRateModel.base) * 100;
    const slope1 = parseFloat(interestRateModel.slope_1) * 100;
    const slope2 = parseFloat(interestRateModel.slope_2) * 100;

    let borrowRate;
    if (currentUtil <= optimalUtil) {
      borrowRate = base + (currentUtil / optimalUtil) * slope1;
    } else {
      borrowRate =
        base +
        slope1 +
        ((currentUtil - optimalUtil) / (1 - optimalUtil)) * slope2;
    }

    return parseFloat(borrowRate.toFixed(2));
  }, [market, metrics.utilizationRate]);

  // Calculate supply APR using the same formula as in the chart
  const supplyApr = useMemo(() => {
    if (!market) return 0;
    // Supply rate = borrow rate * utilization * (1 - reserve factor)
    const reserveFactor = metrics.reserveFactor / 100;
    const utilization = metrics.utilizationRate / 100;
    return parseFloat(
      (borrowApr * utilization * (1 - reserveFactor)).toFixed(2)
    );
  }, [borrowApr, market, metrics.reserveFactor, metrics.utilizationRate]);

  if (
    marketsLoading ||
    walletBalancesLoading ||
    userPositionsLoading ||
    !market
  ) {
    return <MarketDetailsSkeleton />;
  }

  return (
    <div className="w-full px-0 lg:container lg:px-4 mx-auto">
      <div className="py-4 md:p-4">
        {/* Back button with adjusted padding */}
        <div className="mb-3 px-2">
          <Link
            href="/markets"
            className="flex items-center text-orange-600 dark:text-orange-500 hover:underline"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Markets
          </Link>
        </div>

        {/* Market Header */}
        <MarketHeader market={market} />

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <MetricCard
            label="Market Size"
            value={metrics.reserveSizeUsd}
            isCurrency={true}
          />
          <MetricCard
            label="Available liquidity"
            value={metrics.availableLiquidityUsd}
            isCurrency={true}
          />
          <MetricCard
            label="Utilization Rate"
            value={metrics.utilizationRate}
            suffix="%"
          />
          <MetricCard
            label="Oracle price"
            value={metrics.oraclePrice}
            isCurrency={true}
            useCompactNotation={false}
          />
        </div>

        {/* Market status & configuration */}
        <div className="bg-white dark:bg-zinc-900 sm:rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 shadow">
          <h2 className="text-xl font-bold mb-3 sm:mb-4">
            Market status & configuration
          </h2>

          {/* Supply and Borrow Info */}
          <div
            className={`grid grid-cols-1 ${
              market.params.red_bank.borrow_enabled
                ? "md:grid-cols-2"
                : "md:grid-cols-1"
            } gap-4 sm:gap-6 mb-4 sm:mb-6`}
          >
            {/* Supply Section */}
            <div>
              <MarketInfoBox title="Supply info">
                {market.params.red_bank.borrow_enabled && (
                  <>
                    <MetricRow
                      label="Supply APY"
                      value={metrics.supplyApy}
                      suffix="%"
                      valueClassName="text-green-500"
                    />
                    <MetricRow
                      label="Supply APR"
                      value={supplyApr}
                      suffix="%"
                      valueClassName="text-green-200 dark:text-green-300"
                    />
                  </>
                )}
                <MetricRow
                  label="Total supplied"
                  value={metrics.reserveSizeUsd}
                  isCurrency={true}
                />
                <MetricRow
                  label="Deposit cap"
                  value={metrics.depositCapUsd}
                  isCurrency={true}
                />
                <MetricRow
                  label="Cap usage"
                  value={metrics.depositCapUsagePercent}
                  suffix="%"
                  valueClassName={
                    metrics.depositCapUsagePercent >= 100
                      ? "text-red-500"
                      : metrics.depositCapUsagePercent >= 95
                      ? "text-yellow-500"
                      : ""
                  }
                />
                {market.params.red_bank.borrow_enabled && (
                  <MetricRow
                    label="Reserve factor"
                    value={metrics.reserveFactor}
                    suffix="%"
                  />
                )}
              </MarketInfoBox>

              {/* User Supply Position */}
              {address && market.asset.denom && (
                <UserPositionBox
                  title="Your Supply Position"
                  borderClassName="border-orange-500"
                  denom={market.asset.denom}
                  primaryAction="supply"
                />
              )}
            </div>

            {/* Borrow Section */}
            {market.params.red_bank.borrow_enabled && (
              <div>
                <MarketInfoBox title="Borrow info">
                  <MetricRow
                    label="Borrow APY"
                    value={metrics.borrowApy}
                    suffix="%"
                    valueClassName="text-orange-500"
                  />
                  <MetricRow
                    label="Borrow APR"
                    value={borrowApr}
                    suffix="%"
                    valueClassName="text-amber-200 dark:text-amber-300"
                  />
                  <MetricRow
                    label="Total borrowed"
                    value={calculateUsdValue(
                      market.metrics.debt_total_amount,
                      market.price.price,
                      market.asset.decimals
                    )}
                    isCurrency={true}
                  />
                  <MetricRow
                    label="Available liquidity"
                    value={metrics.availableLiquidityUsd}
                    isCurrency={true}
                  />
                </MarketInfoBox>

                {/* User Borrow Position */}
                {address && market.asset.denom && (
                  <UserPositionBox
                    title="Your Borrow Position"
                    borderClassName="border-yellow-500"
                    denom={market.asset.denom}
                    primaryAction="borrow"
                  />
                )}
              </div>
            )}
          </div>

          {/* Collateral Usage - only show if borrow is enabled */}
          {market.params.red_bank.borrow_enabled && (
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 sm:p-4">
              <h3 className="text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                Collateral usage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <MetricRow
                    label="Max LTV"
                    value={metrics.maxLtv}
                    suffix="%"
                  />
                  <MetricRow
                    label="Liquidation threshold"
                    value={metrics.liquidationThreshold}
                    suffix="%"
                  />
                </div>
                <div className="space-y-2">
                  <MetricRow
                    label="Liquidation penalty"
                    value={metrics.liquidationPenalty}
                    suffix="%"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interest Rate Model */}
        {market.params.red_bank.borrow_enabled && (
          <InterestRateModelBox
            interestRateModel={market.metrics.interest_rate_model}
            reserveFactor={metrics.reserveFactor}
            currentUtilization={metrics.utilizationRate}
            optimalUtilizationRate={
              market.metrics.interest_rate_model.optimal_utilization_rate
            }
          />
        )}
      </div>
    </div>
  );
}
