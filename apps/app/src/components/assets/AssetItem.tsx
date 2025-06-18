"use client";

import { FormattedValue, TokenBalance } from "@/components/common";
import { AssetActionType, UnifiedAssetModal } from "@/components/modals";
import AssetItemSkeleton from "@/components/skeletons/AssetItemSkeleton";
import { Button } from "@/components/ui/button";
import chainConfig from "@/config/chain";
import { convertAprToApy } from "@/utils/finance";
import { useChain } from "@cosmos-kit/react";
import { BigNumber } from "bignumber.js";
import Image from "next/image";
import React, { useMemo, useState } from "react";

interface Props {
  coin: Coin;
  canBeCollateral?: boolean;
  action?: AssetActionType;
  isBalanceLoading?: boolean;
  market?: MarketItem;
}

const AssetItem: React.FC<Props> = ({
  coin,
  canBeCollateral = true,
  action = "supply",
  isBalanceLoading = false,
  market,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get wallet connection state
  const { isWalletConnected, connect } = useChain(chainConfig.name);

  // Extract asset information from the market
  const symbol = market?.asset.symbol || "";
  const logo = market?.asset.icon || "";

  // Calculate APY based on the action and getApy prop
  const apy = useMemo(() => {
    return action === "supply" || action === "withdraw"
      ? convertAprToApy(market?.metrics.liquidity_rate ?? 0)
      : convertAprToApy(market?.metrics.borrow_rate ?? 0);
  }, [action, market]);

  // Open modal handler
  const handleOpenModal = () => {
    // Check if wallet is connected
    if (!isWalletConnected) {
      // If not connected, trigger wallet connection
      connect();
      return;
    }
    // If connected, open the asset modal
    setIsModalOpen(true);
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (!market) return null;

  // Get the balance column label based on action
  const getBalanceLabel = () => {
    switch (action) {
      case "supply":
        return "Wallet balance";
      case "withdraw":
        return "Balance";
      case "borrow":
        return "Available to borrow";
      case "repay":
        return "Balance";
      default:
        return "Balance";
    }
  };

  // Get the appropriate action button text
  const getActionButtonText = () => {
    switch (action) {
      case "supply":
        return "Supply";
      case "withdraw":
        return "Withdraw";
      case "borrow":
        return "Borrow";
      case "repay":
        return "Repay";
      default:
        return "Action";
    }
  };

  // Determine button variant
  const buttonVariant =
    action === "supply" || action === "withdraw" ? "secondary" : "default";

  // Mobile card view
  const mobileView = (
    <div className="p-3 border-b last:border-b-0 border-gray-200 dark:border-gray-800 sm:hidden">
      <div className="flex flex-col">
        {/* Asset info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="relative flex items-center justify-center w-10 h-10 mr-3 overflow-hidden">
              {imageError ? (
                <div className="text-sm font-bold text-gray-700 dark:text-white bg-gray-100 rounded-full dark:bg-gray-800">
                  {symbol.substring(0, 2)}
                </div>
              ) : (
                <Image
                  src={logo}
                  alt={symbol}
                  width={40}
                  height={40}
                  className="rounded-full"
                  onError={() => setImageError(true)}
                />
              )}
            </div>
            <div>
              <h3 className="font-medium text-lg text-gray-900 dark:text-white">
                {symbol}
              </h3>
              {action === "supply" && !canBeCollateral && (
                <span className="block text-sm text-gray-500 dark:text-gray-400">
                  Cannot be used as collateral
                </span>
              )}
            </div>
          </div>

          {/* APY */}
          {new BigNumber(apy).isGreaterThan(0) && (
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                APY
              </span>
              {action === "supply" || action === "withdraw" ? (
                <span className="text-base font-medium text-green-500">
                  <FormattedValue value={apy} maxDecimals={2} suffix="%" />
                </span>
              ) : (
                <span className="text-base font-medium text-yellow-500">
                  <FormattedValue value={apy} maxDecimals={2} suffix="%" />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Balance with label */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {getBalanceLabel()}
          </span>
          {isBalanceLoading ? (
            <AssetItemSkeleton />
          ) : (
            <TokenBalance coin={coin} size="md" align="right" />
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            variant={buttonVariant}
            size="default"
            onClick={handleOpenModal}
            className="w-full py-2.5"
          >
            {getActionButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );

  // Desktop table row view
  const desktopView = (
    <div className="hidden sm:grid sm:grid-cols-4 sm:gap-4 sm:px-4 sm:py-3 sm:items-center sm:border-b sm:last:border-b-0 sm:border-gray-200 sm:dark:border-gray-800">
      {/* Asset info */}
      <div className="flex items-center">
        <div className="relative flex items-center justify-center w-8 h-8 mr-3 overflow-hidden">
          {imageError ? (
            <div className="text-sm font-bold text-gray-700 dark:text-white bg-gray-100 rounded-full dark:bg-gray-800">
              {symbol.substring(0, 2)}
            </div>
          ) : (
            <Image
              src={logo}
              alt={symbol}
              width={32}
              height={32}
              className="rounded-full"
              onError={() => setImageError(true)}
            />
          )}
        </div>
        <div>
          <h3 className="font-medium text-base text-gray-900 dark:text-white">
            {symbol}
          </h3>
          {action === "supply" && !canBeCollateral && (
            <span className="block text-xs text-gray-500 dark:text-gray-400">
              Cannot be used as collateral
            </span>
          )}
        </div>
      </div>

      {/* Balance with USD value using TokenBalance component */}
      {isBalanceLoading ? (
        <AssetItemSkeleton />
      ) : (
        <TokenBalance coin={coin} size="sm" align="right" />
      )}

      {/* APY */}
      {new BigNumber(apy).isGreaterThan(0) ? (
        <div className="text-right">
          {action === "supply" || action === "withdraw" ? (
            <span className="text-sm text-green-500">
              <FormattedValue value={apy} maxDecimals={2} suffix="%" />
            </span>
          ) : (
            <span className="text-sm text-yellow-500">
              <FormattedValue value={apy} maxDecimals={2} suffix="%" />
            </span>
          )}
        </div>
      ) : (
        <div />
      )}

      {/* Button */}
      <div className="flex justify-end">
        <Button variant={buttonVariant} size="sm" onClick={handleOpenModal}>
          {getActionButtonText()}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {mobileView}
      {desktopView}

      {/* Modal */}
      {market && isWalletConnected && (
        <UnifiedAssetModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          market={market}
          actionType={action as AssetActionType}
        />
      )}
    </>
  );
};

export default AssetItem;
