"use client";

import AssetActionModal from "@/components/modals/AssetActionModal";
import chainConfig from "@/config/chain";
import useHealthComputer from "@/hooks/useHealthComputer";
import useWalletBalances from "@/hooks/useWalletBalances";
import { useStore } from "@/store/useStore";
import { track } from "@/utils/analytics";
import { updatePositions } from "@/utils/healthComputer";
import { useChain } from "@cosmos-kit/react";
import { BigNumber } from "bignumber.js";
import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { mutate } from "swr";

// Define the action types
export type AssetActionType = "supply" | "withdraw" | "borrow" | "repay";

// Define a type for the market metrics values
type MetricsValue = string | undefined | null;

interface UnifiedAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: MarketItem;
  actionType: AssetActionType;
}

const UnifiedAssetModal: React.FC<UnifiedAssetModalProps> = ({
  isOpen,
  onClose,
  market,
  actionType,
}) => {
  // Connect to the wallet using cosmos-kit
  const { getSigningCosmWasmClient, address } = useChain(chainConfig.name);

  // Get health computer for borrow/withdraw max calculations
  const { computeMaxBorrowAmount, computeMaxWithdrawAmount } =
    useHealthComputer();

  const [isPending, setIsPending] = useState(false);

  // Get wallet balances
  const { data: walletBalances, isLoading: walletBalancesLoading } =
    useWalletBalances();

  // Get wallet balance for the current asset
  const walletBalance = useMemo(() => {
    if (walletBalancesLoading || !walletBalances || !market) return "0";

    const balance = walletBalances.find(
      (balance) => balance.denom === market.asset.denom
    );

    return balance?.amount || "0";
  }, [walletBalances, walletBalancesLoading, market]);

  // Get deposited balance and borrowed amount from the market
  const depositedBalance = useMemo(() => {
    return market?.deposit || "0";
  }, [market]);

  const borrowedAmount = useMemo(() => {
    return market?.debt || "0";
  }, [market]);

  // Get deposit cap if available
  const depositCap = useMemo(() => {
    return market?.params.deposit_cap || undefined;
  }, [market]);

  // Calculate max amount based on action type
  const maxAmount = useMemo(() => {
    if (!market) return new BigNumber(0);

    switch (actionType) {
      case "supply": {
        const walletBN = new BigNumber(walletBalance || "0");

        // If deposit cap is defined, check if it limits the supply
        if (depositCap) {
          const depositCapBN = new BigNumber(depositCap);
          const currentDeposits = new BigNumber(
            market.metrics.collateral_total_amount || "0"
          );
          const remainingCap = depositCapBN.minus(currentDeposits);

          // Return the smaller of wallet balance or remaining cap
          return BigNumber.min(walletBN, remainingCap);
        }

        return walletBN;
      }

      case "withdraw": {
        const depositedBN = new BigNumber(depositedBalance || "0");

        // Calculate max withdraw based on health factor
        const maxWithdrawBN = computeMaxWithdrawAmount(market.asset.denom);

        // Return the smaller of deposited balance or max withdraw
        return BigNumber.min(depositedBN, maxWithdrawBN);
      }

      case "borrow": {
        // Calculate max borrow based on health factor
        const maxBorrowBN = computeMaxBorrowAmount(
          market.asset.denom,
          "wallet"
        );

        // Calculate remaining liquidity in the market
        const totalLiquidity = new BigNumber(
          market.metrics.collateral_total_amount || "0"
        );
        const totalBorrowed = new BigNumber(
          market.metrics.debt_total_amount || "0"
        );
        const remainingLiquidity = totalLiquidity.minus(totalBorrowed);

        // Return the smaller of max borrow or remaining liquidity
        return BigNumber.min(maxBorrowBN, remainingLiquidity);
      }

      case "repay": {
        const walletBN = new BigNumber(walletBalance || "0");
        const borrowedBN = new BigNumber(borrowedAmount || "0");

        // Add a small buffer for accrued interest (1 minute of interest)
        if (borrowedBN.gt(0)) {
          const borrowRate = new BigNumber(
            (market.metrics.borrow_rate as MetricsValue) || "0"
          );
          const oneMinuteInterest = borrowedBN.times(borrowRate).div(525600);
          const totalRepayAmount = borrowedBN.plus(oneMinuteInterest);

          // Return the smaller of wallet balance or total repay amount
          return BigNumber.min(walletBN, totalRepayAmount);
        }

        return walletBN;
      }

      default:
        return new BigNumber(0);
    }
  }, [
    actionType,
    market,
    walletBalance,
    depositedBalance,
    borrowedAmount,
    depositCap,
    computeMaxBorrowAmount,
    computeMaxWithdrawAmount,
  ]);

  // Create appropriate execute message based on action type
  const createExecuteMsg = (amount: string): ExecuteMsg => {
    // Ensure amount has the correct number of decimal places
    const formattedAmount = new BigNumber(amount)
      .decimalPlaces(market.asset.decimals, BigNumber.ROUND_DOWN)
      .toString();

    switch (actionType) {
      case "withdraw":
        return {
          withdraw: {
            amount: formattedAmount,
            denom: market.asset.denom,
          },
        };
      case "borrow":
        return {
          borrow: {
            amount: formattedAmount,
            denom: market.asset.denom,
          },
        };
      case "repay":
        return {
          repay: {},
        };
      default:
        return {
          deposit: {},
        };
    }
  };

  // Handle action
  const handleAction = async (amount: string, amountRaw: string) => {
    if (!address) {
      toast.error("Wallet not connected");
      return;
    }

    setIsPending(true);

    // Format the amount to match the asset's decimal places
    const formattedAmount = new BigNumber(amountRaw)
      .decimalPlaces(market.asset.decimals, BigNumber.ROUND_DOWN)
      .toString();

    // Create the execution message with the formatted amount
    const msg = createExecuteMsg(formattedAmount);

    // Show pending toast
    const pendingToastId = toast.loading(`Transaction pending...`, {
      autoClose: false,
    });

    try {
      // Get the signing client
      const client = await getSigningCosmWasmClient();
      if (!client) {
        toast.update(pendingToastId, {
          render: "Failed to connect to wallet",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        return;
      }

      // Prepare funds for supply and repay actions
      let funds: { amount: string; denom: string }[] = [];
      if (actionType === "supply" || actionType === "repay") {
        // For repay action, ensure the amount has no decimals
        if (actionType === "repay") {
          // Remove any decimal part from amountRaw
          const amountWithoutDecimals = new BigNumber(formattedAmount)
            .integerValue(BigNumber.ROUND_DOWN)
            .toString();
          funds = [
            { amount: amountWithoutDecimals, denom: market.asset.denom },
          ];
        } else {
          funds = [{ amount: formattedAmount, denom: market.asset.denom }];
        }
      }

      // Execute the contract call
      await client.execute(
        address,
        chainConfig.constracts.moneyMarketContract,
        msg,
        "auto",
        undefined,
        funds
      );

      // Get markets from the store to update positions
      const markets = useStore.getState().markets;
      if (markets) {
        const newPositions = updatePositions(markets, actionType, {
          amount: formattedAmount,
          denom: market.params.denom,
        });
        console.log("New Positions:", newPositions);
      }

      // Show success toast
      toast.update(pendingToastId, {
        render: `Successfully ${
          actionType === "supply"
            ? "supplied"
            : actionType === "withdraw"
            ? "withdrew"
            : actionType === "borrow"
            ? "borrowed"
            : "repaid"
        } ${amount} ${market.asset.symbol}`,
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      // Refresh data
      await mutate("metricsRefresh");
      await mutate(`${address}/positions`);
      await mutate(`${address}/balances`);

      // Track successful transaction
      track(`${actionType} ${amount} ${market.asset.symbol}`);
      setIsPending(false);
      setIsPending(false);
      // Close the modal after action is complete
      onClose();
    } catch (error) {
      console.error("Error:", error);

      // Track failed transaction
      track(`${actionType} ${amount} ${market.asset.symbol} Failed`);

      // Show error toast
      toast.update(pendingToastId, {
        render: `Transaction failed: ${
          (error as Error).message || "Unknown error"
        }`,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
      setIsPending(false);
    }
  };

  // Determine modal-specific properties based on action type
  const getActionTitle = () => {
    const symbol = market?.asset.symbol || "";
    return `${
      actionType.charAt(0).toUpperCase() + actionType.slice(1)
    } ${symbol}`;
  };

  const getMaxAmountLabel = () => {
    switch (actionType) {
      case "supply":
      case "repay":
        return "Wallet Balance:";
      case "withdraw":
        return "Available:";
      case "borrow":
        return "Max Amount:";
      default:
        return "Max:";
    }
  };

  return (
    <AssetActionModal
      isOpen={isOpen}
      onClose={onClose}
      title={getActionTitle()}
      actionType={actionType}
      market={market}
      maxAmount={maxAmount}
      actionButtonLabel={getActionTitle()}
      onAction={handleAction}
      maxAmountLabel={getMaxAmountLabel()}
      isPending={isPending}
    />
  );
};

export default UnifiedAssetModal;
