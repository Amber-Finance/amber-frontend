export function computePositionAfterSwap(
  positionCalcs: any,
  strategy: Strategy,
  swapRouteInfo: SwapRouteInfo | null,
  isLeverageIncrease: boolean,
) {
  let supplies =
    positionCalcs.supplies !== undefined
      ? positionCalcs.supplies
      : positionCalcs.totalPosition - positionCalcs.borrowAmount

  let totalBorrows =
    positionCalcs.totalBorrows !== undefined
      ? positionCalcs.totalBorrows
      : positionCalcs.borrowAmount

  if (swapRouteInfo?.amountIn && swapRouteInfo?.amountOut && positionCalcs.supplies !== undefined) {
    const currentSupplies = positionCalcs.supplies
    const currentDebt = positionCalcs.currentBorrows || 0

    const debtAssetDecimals = strategy.debtAsset.decimals || 6

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

  const actualCollateral =
    positionCalcs.supplies !== undefined ? supplies + totalBorrows : positionCalcs.totalPosition

  return { supplies, totalBorrows, actualCollateral }
}

export function computeSwapImpact(
  swapRouteInfo: SwapRouteInfo | null,
  strategy: Strategy,
  isLeverageIncrease: boolean,
) {
  if (!swapRouteInfo?.amountIn || !swapRouteInfo?.amountOut) {
    return { priceImpact: 0, minReceivedDisplay: null }
  }

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
