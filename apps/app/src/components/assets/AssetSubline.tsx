import { FormattedValue } from "@/components/common";
import { getBorrowApy, getSupplyApy } from "@/utils/finance";
import { BigNumber } from "bignumber.js";
import React from "react";

type SublineMode = "supplies" | "borrows";

interface AssetSublineProps {
  mode: SublineMode;
  suppliesItems: MarketItem[];
  borrowItems?: MarketItem[]; // Only needed for borrows mode
}

const AssetSubline: React.FC<AssetSublineProps> = ({
  mode,
  suppliesItems,
  borrowItems = [],
}) => {
  // Use the appropriate items based on mode
  const items = mode === "supplies" ? suppliesItems : borrowItems;

  // Return null if no items
  if (!items.length) return null;

  // Calculate total balance in USD
  const totalUsd = items.reduce(
    (sum, item) => sum.plus(new BigNumber(item.balanceUsd || "0")),
    new BigNumber(0)
  );

  // Choose the appropriate APY function based on mode
  const getApyFn = mode === "supplies" ? getSupplyApy : getBorrowApy;
  const apyColorClass =
    mode === "supplies" ? "text-green-500" : "text-yellow-500";

  // Calculate weighted average APY
  let weightedApySum = new BigNumber(0);
  let totalWeight = new BigNumber(0);

  items.forEach((item) => {
    const weight = new BigNumber(item.balanceUsd || "0");
    const apy = new BigNumber(getApyFn(item) || "0");

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

  // Set up the third metric based on mode
  let thirdMetricLabel: string;
  let thirdMetricValue: BigNumber;

  if (mode === "supplies") {
    thirdMetricLabel = "Collateral";
    thirdMetricValue = totalCollateralUsd;
  } else {
    thirdMetricLabel = "Borrow power used";
    const borrowPowerUsed = totalCollateralUsd.isGreaterThan(0)
      ? totalUsd.dividedBy(totalCollateralUsd).multipliedBy(100)
      : new BigNumber(0);
    thirdMetricValue = borrowPowerUsed;
  }

  return (
    <div className="flex flex-wrap items-center w-full gap-2">
      <div className="flex items-center px-3 py-1 bg-muted border rounded-md">
        <span className="text-muted-foreground mr-2">Balance</span>
        <span className="font-medium">
          <FormattedValue
            value={totalUsd.toString()}
            isCurrency={true}
            maxDecimals={2}
            useCompactNotation={false}
          />
        </span>
      </div>
      <div className="flex items-center px-3 py-1 bg-muted border rounded-md">
        <span className="text-muted-foreground mr-2">APY</span>
        <span className={`font-medium ${apyColorClass}`}>
          <FormattedValue
            value={avgApy.toString()}
            suffix="%"
            maxDecimals={2}
          />
        </span>
      </div>
      <div className="flex items-center px-3 py-1 bg-muted border rounded-md">
        <span className="text-muted-foreground mr-2">{thirdMetricLabel}</span>
        <span className="font-medium">
          <FormattedValue
            value={thirdMetricValue.toString()}
            isCurrency={mode === "supplies"}
            suffix={mode === "borrows" ? "%" : ""}
            maxDecimals={2}
            useCompactNotation={false}
          />
        </span>
      </div>
    </div>
  );
};

export default AssetSubline;
