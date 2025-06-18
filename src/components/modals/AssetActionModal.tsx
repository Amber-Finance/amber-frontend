"use client";

import { FormattedValue } from "@/components/common";
import Spinner from "@/components/common/Spinner";
import Modal from "@/components/modals/Modal";
import { Button } from "@/components/ui/Button";
import useHealthComputer from "@/hooks/useHealthComputer";
import { useStore } from "@/store/useStore";
import { convertAprToApy } from "@/utils/finance";
import { calculateUsdValue } from "@/utils/format";
import { updatePositions } from "@/utils/healthComputer";
import { formatMaxAmount, handleNumericInputChange } from "@/utils/input";
import BigNumber from "bignumber.js";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

interface AssetActionModalProps {
  isOpen: boolean;
  actionType: ActionType;
  onClose: () => void;
  title: string;
  market?: MarketItem;
  maxAmount: BigNumber;
  actionButtonLabel: string;
  apy?: string;
  onAction: (amount: string, amountRaw: string) => void;
  liquidationAt?: string;
  maxAmountLabel?: string;
  isPending?: boolean;
}

const AssetActionModal: React.FC<AssetActionModalProps> = ({
  isOpen,
  actionType,
  onClose,
  title,
  market,
  maxAmount,
  actionButtonLabel,
  onAction,
  maxAmountLabel = "Max:",
  isPending,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [amountRaw, setAmountRaw] = useState("");
  const [usdValue, setUsdValue] = useState<number>(0);
  const markets = useStore((s) => s.markets);

  // Get current and projected health factors
  const { healthFactor } = useHealthComputer();
  const updatedPositions = useMemo(() => {
    if (!markets || !market || !amountRaw) return undefined;

    const positions = updatePositions(markets, actionType, {
      amount: amountRaw,
      denom: market.params.denom,
    });

    return positions as Positions;
  }, [markets, market, actionType, amountRaw]);

  const { healthFactor: projectedHealthFactor } =
    useHealthComputer(updatedPositions);

  // Reset the input value when the modal opens
  useEffect(() => {
    if (isOpen) {
      setInputValue("");
      setAmountRaw("");
      setUsdValue(0);
    }
  }, [isOpen]);

  // Calculate the number of decimals for the token
  const decimals = market?.asset.decimals || 6;

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { inputValue: newInputValue, amountRaw: newAmountRaw } =
      handleNumericInputChange(e.target.value, maxAmount, decimals);

    // Set values directly from the utility function
    setInputValue(newInputValue);
    setAmountRaw(newAmountRaw);
  };

  // Handle max button click
  const handleMaxClick = () => {
    if (maxAmount.gt(0)) {
      const newValue = formatMaxAmount(maxAmount, decimals);
      setInputValue(newValue);
      setAmountRaw(maxAmount.toString());
    }
  };

  // Handle action button click
  const handleActionClick = () => {
    if (isInputValid) {
      onAction(inputValue, amountRaw);
    }
  };

  // Format max amount
  const formattedMaxAmount = formatMaxAmount(maxAmount, decimals);

  // Check if input is valid
  const isInputValid =
    amountRaw !== "" && amountRaw !== "0" && !isNaN(Number(amountRaw));

  // Update USD value whenever input or market changes
  useEffect(() => {
    // Only calculate USD value if amountRaw is a valid number and not just "0" from a decimal point
    if (amountRaw && amountRaw !== "0" && market?.price) {
      const calculatedValue = calculateUsdValue(
        amountRaw,
        market.price.price,
        market.asset.decimals
      );
      // Ensure usdValue always has exactly 2 decimal places
      setUsdValue(Number(calculatedValue.toFixed(2)));
    } else {
      setUsdValue(0);
    }
  }, [amountRaw, market]);

  const apy = useMemo(() => {
    if (actionType === "borrow")
      return convertAprToApy(market?.metrics.borrow_rate ?? 0);
    if (actionType === "supply")
      return convertAprToApy(market?.metrics.liquidity_rate ?? 0);
    return undefined;
  }, [actionType, market]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        {/* Amount input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="amount"
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              Amount
            </label>
          </div>

          <div className="relative border border-gray-300 dark:border-gray-700 rounded-md">
            <input
              id="amount"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="w-full p-3 bg-white dark:bg-zinc-950 outline-none text-gray-900 dark:text-white text-xl rounded-md"
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              <div className="flex items-center">
                {market?.asset.icon && (
                  <Image
                    src={market.asset.icon || ""}
                    alt={market.asset.symbol || "Token"}
                    width={20}
                    height={20}
                    className="rounded-full mr-2"
                    onError={(e) => {
                      // Handle error by hiding the image
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                )}
                <span className="text-gray-900 dark:text-white">
                  {market?.asset.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Max amount and button - below the input */}
          <div className="flex justify-end items-center mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
              {maxAmountLabel} {formattedMaxAmount}
            </span>
            <Button
              onClick={handleMaxClick}
              size="xs"
              variant="secondary"
              className="text-xs"
            >
              MAX
            </Button>
          </div>
        </div>

        {/* Transaction overview */}
        <div>
          <h4 className="text-md font-medium mb-3 border-b border-gray-200 dark:border-gray-800 pb-2">
            Transaction Overview
          </h4>

          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800 h-10">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Asset Value
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              <FormattedValue
                value={usdValue}
                prefix="$"
                maxDecimals={2}
                isCurrency={true}
              />
            </span>
          </div>

          {/* APY if provided */}
          {apy && (
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800 h-10">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {title.split(" ")[0]} APY
              </span>
              {actionType === "supply" ? (
                <span className="text-sm text-green-500">
                  <FormattedValue value={apy} maxDecimals={2} suffix="%" />
                </span>
              ) : (
                <span className="text-sm text-yellow-500">
                  <FormattedValue value={apy} maxDecimals={2} suffix="%" />
                </span>
              )}
            </div>
          )}

          {/* Health factor if provided */}
          {healthFactor !== undefined && (
            <>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800 h-10">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Health factor
                </span>
                <div className="flex items-center">
                  <span
                    className={`text-sm ${
                      healthFactor >= 2.5 ? "text-green-500" : "text-yellow-500"
                    }`}
                  >
                    {healthFactor.toFixed(2)}
                  </span>
                  {projectedHealthFactor &&
                    projectedHealthFactor !== healthFactor && (
                      <>
                        <span className="mx-2 text-gray-400">→</span>
                        <span
                          className={`text-sm ${
                            projectedHealthFactor >= 2.5
                              ? "text-green-500"
                              : projectedHealthFactor > 1.2
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                        >
                          {projectedHealthFactor.toFixed(2)}
                        </span>
                      </>
                    )}
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                Liquidation at &lt;1.0
              </div>
            </>
          )}
        </div>

        {/* Action button */}
        <Button
          fullWidth
          disabled={!isInputValid || isPending}
          onClick={handleActionClick}
          variant="gradient"
        >
          {isPending ? <Spinner /> : actionButtonLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default AssetActionModal;
