import { BigNumber } from 'bignumber.js'

export function computePositionAfterSwap(
  positionCalcs: any,
  strategy: Strategy,
  swapRouteInfo: SwapRouteInfo | null,
  isLeverageIncrease: boolean,
) {
  let supplies =
    (positionCalcs as any).supplies !== undefined
      ? (positionCalcs as any).supplies
      : positionCalcs.totalPosition - positionCalcs.borrowAmount

  let totalBorrows =
    (positionCalcs as any).totalBorrows !== undefined
      ? (positionCalcs as any).totalBorrows
      : positionCalcs.borrowAmount

  if (swapRouteInfo && (positionCalcs as any).supplies !== undefined) {
    const currentSupplies = (positionCalcs as any).supplies
    const currentDebt = (positionCalcs as any).currentBorrows || 0

    if (swapRouteInfo.amountIn && swapRouteInfo.amountOut) {
      const debtAssetDecimals = strategy.debtAsset.decimals || 6
      const collateralAssetDecimals = strategy.collateralAsset.decimals || 8

      if (isLeverageIncrease) {
        const debtBorrowed = swapRouteInfo.amountIn.shiftedBy(-debtAssetDecimals).toNumber()
        supplies = currentSupplies
        totalBorrows = currentDebt + debtBorrowed
      } else {
        const debtReceived = swapRouteInfo.amountOut.shiftedBy(-debtAssetDecimals).toNumber()
        supplies = currentSupplies
        totalBorrows = currentDebt - debtReceived
      }
    }
  }

  const actualCollateral =
    (positionCalcs as any).supplies !== undefined
      ? supplies + totalBorrows
      : positionCalcs.totalPosition

  return { supplies, totalBorrows, actualCollateral }
}

export function computeSwapImpact(
  swapRouteInfo: SwapRouteInfo | null,
  strategy: Strategy,
  isLeverageIncrease: boolean,
) {
  if (!swapRouteInfo || !swapRouteInfo.amountIn || !swapRouteInfo.amountOut)
    return { priceImpact: 0, minReceivedDisplay: null }

  const debtAssetDecimals = strategy.debtAsset.decimals || 6
  const collateralAssetDecimals = strategy.collateralAsset.decimals || 8
  const fromDecimals = isLeverageIncrease ? debtAssetDecimals : collateralAssetDecimals
  const toDecimals = isLeverageIncrease ? collateralAssetDecimals : debtAssetDecimals

  const inputAmount = swapRouteInfo.amountIn.shiftedBy(-fromDecimals)
  const outputAmount = swapRouteInfo.amountOut.shiftedBy(-toDecimals)
  const priceImpact =
    ((outputAmount.toNumber() - inputAmount.toNumber()) / inputAmount.toNumber()) * 100

  return { priceImpact, minReceivedDisplay: outputAmount.toFixed(6) }
}

