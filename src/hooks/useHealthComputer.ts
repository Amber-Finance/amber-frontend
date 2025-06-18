import { useStore } from "@/store/useStore";
import {
  BorrowTarget,
  compute_health_js,
  max_borrow_estimate_js,
  max_withdraw_estimate_js,
} from "@/utils/health_computer";
import {
  initializeWasm,
  isWasmInitialized,
} from "@/utils/health_computer/initWasm";
import { buildHealthComputer } from "@/utils/healthComputer";
import BigNumber from "bignumber.js";
import { useCallback, useEffect, useMemo, useState } from "react";

export const VALUE_SCALE_FACTOR = 12;
const BN_ZERO = new BigNumber(0);

export default function useHealthComputer(updatedPositions?: Positions) {
  const [healthFactor, setHealthFactor] = useState<number | undefined>(
    undefined
  );
  const [isWasmReady, setIsWasmReady] = useState(isWasmInitialized());

  // Get markets from store
  const markets = useStore((s) => s.markets);

  // Build healthComputer from markets on every render
  const healthComputer = useMemo(() => {
    const computer = buildHealthComputer(markets);
    if (computer && updatedPositions) {
      computer.positions = updatedPositions;
    }
    return computer;
  }, [markets, updatedPositions]);

  // Ensure WASM is initialized
  useEffect(() => {
    if (isWasmInitialized()) {
      setIsWasmReady(true);
      return;
    }

    initializeWasm()
      .then(() => {
        setIsWasmReady(true);
      })
      .catch(() => {
        // Silently fail - no need to log
      });
  }, []);

  // Calculate health factor when WASM is ready and healthComputer is available
  useEffect(() => {
    if (!isWasmReady || !healthComputer) {
      setHealthFactor(undefined);
      return;
    }

    // Check if there are any positions - if not, health factor should be 0
    const hasPositions =
      healthComputer.positions.lends.length > 0 ||
      healthComputer.positions.debts.length > 0;

    if (!hasPositions) {
      setHealthFactor(undefined);
      return;
    }

    try {
      // Compute health values
      const healthValues = compute_health_js(healthComputer);

      // Check for null values in the response
      if (healthValues.liquidation_health_factor === null) {
        setHealthFactor(10);
      } else {
        setHealthFactor(
          Math.min(Number(healthValues.liquidation_health_factor), 10)
        );
      }
    } catch {
      setHealthFactor(0);
    }
  }, [healthComputer, isWasmReady]);

  const computeMaxBorrowAmount = useCallback(
    (denom: string, target: BorrowTarget) => {
      if (!isWasmReady || !healthComputer) return BN_ZERO;
      try {
        return new BigNumber(
          max_borrow_estimate_js(healthComputer, denom, target)
        ).integerValue();
      } catch {
        return BN_ZERO;
      }
    },
    [healthComputer, isWasmReady]
  );

  const computeMaxWithdrawAmount = useCallback(
    (denom: string) => {
      if (!isWasmReady || !healthComputer) return BN_ZERO;
      try {
        return new BigNumber(max_withdraw_estimate_js(healthComputer, denom));
      } catch {
        return BN_ZERO;
      }
    },
    [healthComputer, isWasmReady]
  );

  return {
    healthFactor,
    computeMaxBorrowAmount,
    computeMaxWithdrawAmount,
    isWasmReady,
  };
}
