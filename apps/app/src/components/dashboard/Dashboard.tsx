"use client";

import AssetSubline from "@/components/assets/AssetSubline";
import AssetTable from "@/components/assets/AssetTable";
import InfoAlert from "@/components/InfoAlert";
import useHealthComputer from "@/hooks/useHealthComputer";
import { useMarkets } from "@/hooks/useMarkets";
import useUserPositions from "@/hooks/useUserPositions";
import useWalletBalances from "@/hooks/useWalletBalances";
import { useStore } from "@/store/useStore";
import { track } from "@/utils/analytics";
import { getBorrowApy, getSupplyApy } from "@/utils/finance";
import { calculateUsdValue } from "@/utils/format";
import { BigNumber } from "bignumber.js";
import { useEffect, useState } from "react";

const Dashboard = () => {
  // Use the markets hook to fetch data
  const { isLoading: marketsLoading, error: marketsError } = useMarkets();

  // Get markets and hideZeroBalances state from the store
  const { markets, hideZeroBalances, setHideZeroBalances } = useStore();
  // State for sort column and direction
  const [sortColumn, setSortColumn] = useState<"apy" | "balance">("apy");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Track dashboard visit when component mounts
  useEffect(() => {
    track("Visit Dashboard");
  }, []);

  // Get wallet balances - the hook automatically uses the connected wallet address
  const {
    data: walletBalances,
    isLoading: walletBalancesLoading,
    isReady: walletConnected,
  } = useWalletBalances();

  // Use the user positions hook to fetch and update positions in the store
  const { isLoading: userPositionsLoading, isReady: userPositionsReady } =
    useUserPositions();

  // Use health computer hook for max borrow calculation
  const { computeMaxBorrowAmount, isWasmReady } = useHealthComputer();

  // Update sorting when wallet connection state changes
  useEffect(() => {
    if (walletConnected && !walletBalancesLoading) {
      // When wallet is connected, sort by wallet balance
      setSortColumn("balance");
      setSortDirection("desc");
    } else if (!walletConnected) {
      // When wallet is disconnected, sort by APY
      setSortColumn("apy");
      setSortDirection("desc");
    }
  }, [walletConnected, walletBalancesLoading]);

  // Combined loading state
  const isLoading =
    marketsLoading ||
    (walletConnected && walletBalancesLoading) ||
    (userPositionsReady && userPositionsLoading) ||
    (walletConnected && !isWasmReady);

  const getBalance = (denom: string): string => {
    // If a wallet is connected but balances are still loading, return loading indicator as string
    if (walletConnected && walletBalancesLoading) return "loading";

    // If no wallet balances or no markets, return 0
    if (!walletBalances || !markets) return "0";

    const balance = walletBalances.find((b) => b.denom === denom);
    if (!balance) return "0";

    // Find the corresponding market to get the decimals
    const market = markets.find((m) => m.asset.denom === denom);
    if (!market) return "0";
    return balance.amount;
  };

  const getBalanceUsd = (denom: string, amount: string): string => {
    if (amount === "loading" || !markets) return "0";

    const market = markets.find((m) => m.asset.denom === denom);
    if (!market || !market.price?.price) return "0";

    const usdValue = calculateUsdValue(
      amount,
      market.price.price,
      market.asset.decimals
    );

    return usdValue.toString();
  };

  // Create supply assets with wallet balances
  const supplyMarketItems = (markets || [])
    .filter((market) => market.params.red_bank.deposit_enabled)
    .map((market) => {
      const denom = market.asset.denom;
      const balanceValue = getBalance(denom);
      const balanceUsdValue = getBalanceUsd(denom, balanceValue);

      return {
        ...market,
        balance: balanceValue === "loading" ? undefined : balanceValue,
        balanceUsd: balanceUsdValue,
        // Add a loading flag to the market item
        isBalanceLoading: balanceValue === "loading",
      };
    })
    // Filter out assets with zero balance if checkbox is checked
    .filter((market) => {
      // Only filter if checkbox is checked
      if (!hideZeroBalances) return true;
      // Skip filtering if wallet is not connected or balances are loading
      if (!walletConnected || walletBalancesLoading) return true;

      // Check if balance is zero
      const balance =
        market.balance !== undefined
          ? new BigNumber(market.balance)
          : new BigNumber(0);
      return !balance.isZero(); // Keep if balance is not zero
    });

  // Create borrow assets with max borrow amount for available column
  const borrowMarketItems = (markets || [])
    .filter((market) => market.params.red_bank.borrow_enabled)
    .map((market) => {
      const denom = market.asset.denom;

      // Calculate max borrow amount using the health computer
      // For wallet connected users, compute the actual max borrow amount
      // Otherwise return "0"
      let maxBorrowAmount = "0";

      if (walletConnected && isWasmReady) {
        // Get the raw amount from health computer
        const rawAmount = computeMaxBorrowAmount(denom, "wallet");

        // Check for available liquidity
        // Calculate available liquidity from the market data
        const collateralTotal = new BigNumber(
          market.metrics.collateral_total_amount || "0"
        );
        const debtTotal = new BigNumber(
          market.metrics.debt_total_amount || "0"
        );
        const availableLiquidity = BigNumber.max(
          0,
          collateralTotal.minus(debtTotal)
        );

        // Use the lesser of maxBorrowAmount and availableLiquidity to ensure
        // we don't allow borrowing more than what's actually available in the market
        maxBorrowAmount = BigNumber.min(
          new BigNumber(rawAmount),
          availableLiquidity
        ).toString();
      }
      // Get USD value of the max borrow amount
      const maxBorrowUsdValue =
        walletConnected && isWasmReady && market.price?.price
          ? calculateUsdValue(
              maxBorrowAmount,
              market.price.price,
              market.asset.decimals
            ).toString()
          : "0";

      return {
        ...market,
        balance: maxBorrowAmount,
        balanceUsd: maxBorrowUsdValue,
      };
    });

  // Create user deposits (supplies) market items directly from market objects
  const userDepositItems =
    userPositionsReady && markets
      ? (markets
          .filter((market) =>
            new BigNumber(market.deposit || "0").isGreaterThan(0)
          )
          .map((market) => ({
            ...market,
            balance: market.deposit || "0",
            balanceUsd: getBalanceUsd(
              market.asset.denom,
              market.deposit || "0"
            ),
            // Make sure metrics contains liquidity_rate for supply APY calculation
            metrics: {
              ...market.metrics,
              liquidity_rate: market.metrics.liquidity_rate || "0",
            },
          })) as unknown as MarketItem[])
      : [];

  // Create user debts (borrows) market items directly from market objects
  const userDebtItems =
    userPositionsReady && markets
      ? (markets
          .filter((market) =>
            new BigNumber(market.debt || "0").isGreaterThan(0)
          )
          .map((market) => ({
            ...market,
            balance: market.debt || "0",
            balanceUsd: getBalanceUsd(market.asset.denom, market.debt || "0"),
            // Make sure metrics contains borrow_rate for borrow APY calculation
            metrics: {
              ...market.metrics,
              borrow_rate: market.metrics.borrow_rate || "0",
            },
          })) as unknown as MarketItem[])
      : [];

  // Check if user has deposit positions for info alert
  const hasDepositPositions =
    userPositionsReady &&
    markets &&
    markets.some((market) =>
      new BigNumber(market.deposit || "0").isGreaterThan(0)
    );

  // Define columns for supply assets
  const supplyColumns: MarketColumn[] = [
    { id: "asset", label: "Assets" },
    { id: "balance", label: "Wallet balance", align: "right" },
    { id: "apy", label: "APY", align: "right" },
  ];

  // Define columns for borrow assets
  const borrowColumns: MarketColumn[] = [
    { id: "asset", label: "Asset" },
    { id: "balance", label: "Available to borrow", align: "right" },
    { id: "apy", label: "APY", align: "right" },
  ];

  // Define columns for user deposits and debts
  const userPositionColumns: MarketColumn[] = [
    { id: "asset", label: "Asset" },
    { id: "balance", label: "Balance", align: "right" },
    { id: "apy", label: "APY", align: "right" },
  ];

  // Borrow info alert - only shown if user has no deposits
  const showBorrowInfoAlert = !userPositionsReady || !hasDepositPositions;
  const borrowInfoAlert = showBorrowInfoAlert ? (
    <InfoAlert message="To borrow you need to supply any asset to be used as collateral." />
  ) : null;

  // Hide zero balances checkbox
  const hideZeroBalancesCheckbox = walletConnected ? (
    <div className="flex items-center">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id="hideZeroBalances"
          checked={hideZeroBalances}
          onChange={(e) => setHideZeroBalances(e.target.checked)}
          className="sr-only" // Hide the actual checkbox but keep it accessible
        />
        <div
          className={`
            w-5 h-5 flex items-center justify-center rounded
            transition-all duration-200 ease-in-out cursor-pointer
            ${
              hideZeroBalances
                ? "bg-orange-600 border-orange-600"
                : "bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-gray-600"
            } 
            border-2 hover:border-orange-500
          `}
          onClick={() => setHideZeroBalances(!hideZeroBalances)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setHideZeroBalances(!hideZeroBalances);
            }
          }}
          role="checkbox"
          aria-checked={hideZeroBalances}
          tabIndex={0}
        >
          {hideZeroBalances && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        <label
          htmlFor="hideZeroBalances"
          className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          Hide 0 balances
        </label>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-4 sm:space-y-6 w-full mx-0 lg:px-0 lg:mx-auto">
      {/* Responsive grid layout that stacks on small screens */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Left column: Supply-related tables */}
        <div className="space-y-4 sm:space-y-6">
          {/* Your supplies section - only shown when wallet is connected */}
          {walletConnected && (
            <AssetTable
              title="Your supplies"
              assets={userDepositItems}
              columns={userPositionColumns}
              initialSortColumn="balance"
              initialSortDirection="desc"
              isEmpty={userDepositItems.length === 0}
              emptyMessage="Nothing supplied yet"
              getApy={getSupplyApy}
              action="withdraw"
              isLoading={userPositionsLoading}
              sublineContent={
                <AssetSubline
                  mode="supplies"
                  suppliesItems={userDepositItems}
                />
              }
            />
          )}

          {/* Assets to supply */}
          <AssetTable
            title="Assets to supply"
            assets={supplyMarketItems as unknown as MarketItem[]}
            columns={supplyColumns}
            initialSortColumn={sortColumn}
            initialSortDirection={sortDirection}
            emptyMessage="No supply assets available"
            getApy={getSupplyApy}
            action="supply"
            isLoading={isLoading}
            error={marketsError}
            headerElement={hideZeroBalancesCheckbox}
          />
        </div>

        {/* Right column: Borrow-related tables */}
        <div className="space-y-4 sm:space-y-6">
          {/* Your borrows section - only shown when wallet is connected */}
          {walletConnected && (
            <AssetTable
              title="Your borrows"
              assets={userDebtItems}
              columns={userPositionColumns}
              initialSortColumn="balance"
              initialSortDirection="desc"
              isEmpty={userDebtItems.length === 0}
              emptyMessage="Nothing borrowed yet"
              getApy={getBorrowApy}
              action="repay"
              isLoading={userPositionsLoading}
              sublineContent={
                <AssetSubline
                  mode="borrows"
                  suppliesItems={userDepositItems}
                  borrowItems={userDebtItems}
                />
              }
            />
          )}

          {/* Assets to borrow */}
          <AssetTable
            title="Assets to borrow"
            assets={borrowMarketItems as unknown as MarketItem[]}
            columns={borrowColumns}
            initialSortColumn="apy"
            initialSortDirection="desc"
            emptyMessage="No borrow assets available"
            getApy={getBorrowApy}
            action="borrow"
            isLoading={isLoading}
            error={marketsError}
            infoAlert={borrowInfoAlert}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
