import { convertAprToApy } from "@/utils/finance";
import { calculateUsdValue } from "@/utils/format";
import { BigNumber } from "bignumber.js";
import { useMemo } from "react";

export function useMarketMetrics(market: Market): MarketMetrics {
  return useMemo(() => {
    // If market doesn't have the required properties, return default values
    if (
      !market?.metrics?.collateral_total_amount ||
      !market?.metrics?.debt_total_amount ||
      !market?.price?.price
    ) {
      return {
        reserveSizeUsd: 0,
        availableLiquidityUsd: 0,
        depositCap: 0,
        depositCapUsd: 0,
        depositCapUsagePercent: 0,
        utilizationRate: 0,
        oraclePrice: 0,
        supplyApy: "0",
        borrowApy: "0",
        maxLtv: 0,
        liquidationThreshold: 0,
        liquidationPenalty: 0,
        reserveFactor: 0,
      };
    }

    const reserveSize = parseFloat(market.metrics.collateral_total_amount);
    const reserveSizeUsd = calculateUsdValue(
      reserveSize,
      parseFloat(market.price.price),
      market.asset.decimals
    );

    const availableLiquidity = parseFloat(
      new BigNumber(market.metrics.collateral_total_amount)
        .minus(market.metrics.debt_total_amount)
        .toString()
    );
    const availableLiquidityUsd = calculateUsdValue(
      availableLiquidity,
      parseFloat(market.price.price),
      market.asset.decimals
    );

    const depositCap = parseFloat(market.params.deposit_cap);
    const depositCapUsd = calculateUsdValue(
      depositCap,
      parseFloat(market.price.price),
      market.asset.decimals
    );
    const depositCapAmount = new BigNumber(depositCap)
      .shiftedBy(-market.asset.decimals)
      .toNumber();

    const depositCapUsagePercent =
      depositCapUsd > 0
        ? Math.min(
            100,
            parseFloat(((reserveSizeUsd / depositCapUsd) * 100).toFixed(2))
          )
        : 0;

    const utilizationRate = parseFloat(
      (parseFloat(market.metrics.utilization_rate) * 100).toFixed(2)
    );
    const oraclePrice = parseFloat(market.price.price);
    const supplyApy = convertAprToApy(
      parseFloat(market.metrics.liquidity_rate)
    );
    const borrowApy = convertAprToApy(parseFloat(market.metrics.borrow_rate));
    const maxLtv = parseFloat(market.params.max_loan_to_value) * 100;
    const liquidationThreshold =
      parseFloat(market.params.liquidation_threshold) * 100;
    const liquidationPenalty =
      parseFloat(market.params.liquidation_bonus.starting_lb) * 100;
    const reserveFactor = parseFloat(market.metrics.reserve_factor) * 100;

    return {
      reserveSizeUsd,
      availableLiquidityUsd,
      depositCap: depositCapAmount,
      depositCapUsd,
      depositCapUsagePercent,
      utilizationRate,
      oraclePrice,
      supplyApy,
      borrowApy,
      maxLtv,
      liquidationThreshold,
      liquidationPenalty,
      reserveFactor,
    };
  }, [market]);
}

export default useMarketMetrics;
