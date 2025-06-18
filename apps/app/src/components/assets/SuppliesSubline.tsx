import { FormattedValue } from "@/components/common";
import { getSupplyApy } from "@/utils/finance";
import { BigNumber } from "bignumber.js";
import React from "react";

interface SuppliesSublineProps {
  suppliesItems: MarketItem[];
}

const SuppliesSubline: React.FC<SuppliesSublineProps> = ({ suppliesItems }) => {
  if (!suppliesItems.length) return null;

  // Calculate total balance in USD
  const totalSuppliesUsd = suppliesItems.reduce(
    (sum, item) => sum.plus(new BigNumber(item.balanceUsd || "0")),
    new BigNumber(0)
  );

  // Calculate weighted average APY
  let weightedApySum = new BigNumber(0);
  let totalWeight = new BigNumber(0);

  suppliesItems.forEach((item) => {
    const weight = new BigNumber(item.balanceUsd || "0");
    const apy = new BigNumber(getSupplyApy(item) || "0");

    if (weight.isGreaterThan(0)) {
      weightedApySum = weightedApySum.plus(weight.multipliedBy(apy));
      totalWeight = totalWeight.plus(weight);
    }
  });

  const avgApy = totalWeight.isGreaterThan(0)
    ? weightedApySum.dividedBy(totalWeight)
    : new BigNumber(0);

  // Calculate total collateral value accounting for liquidation thresholds
  const totalCollateralUsd = suppliesItems.reduce((sum, item) => {
    const balanceUsd = new BigNumber(item.balanceUsd || "0");
    // Get the liquidation threshold or default to 1 (100%)
    const liquidationThreshold = new BigNumber(
      item.params?.liquidation_threshold || "1"
    );
    // Calculate collateral value based on liquidation threshold
    return sum.plus(balanceUsd.multipliedBy(liquidationThreshold));
  }, new BigNumber(0));

  return (
    <div className="flex flex-wrap items-center w-full gap-2">
      <div className="flex items-center px-3 py-1 bg-muted border rounded-md">
        <span className="text-muted-foreground mr-2">Balance</span>
        <span className="font-medium">
          <FormattedValue
            value={totalSuppliesUsd.toString()}
            isCurrency={true}
            maxDecimals={2}
            useCompactNotation={false}
          />
        </span>
      </div>
      <div className="flex items-center px-3 py-1 bg-muted border rounded-md">
        <span className="text-muted-foreground mr-2">APY</span>
        <span className="font-medium text-green-500">
          <FormattedValue
            value={avgApy.toString()}
            suffix="%"
            maxDecimals={2}
          />
        </span>
      </div>
      <div className="flex items-center px-3 py-1 bg-muted border rounded-md">
        <span className="text-muted-foreground mr-2">Collateral power</span>
        <span className="font-medium">
          <FormattedValue
            value={totalCollateralUsd.toString()}
            isCurrency={true}
            maxDecimals={2}
            useCompactNotation={false}
          />
        </span>
      </div>
    </div>
  );
};

export default SuppliesSubline;
