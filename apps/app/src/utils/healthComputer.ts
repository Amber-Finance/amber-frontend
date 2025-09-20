import { BigNumber } from 'bignumber.js'

import { healthComputerBarebone } from '@/store/healthComputer'
import { HealthComputer } from '@/utils/health_computer'

/*
 * Builds a HealthComputer object from the markets data
 * This creates a new HealthComputer from scratch each time, ensuring all
 * required data is always included from the current markets state
 */
export function buildHealthComputer(markets: Market[] | null): HealthComputer | null {
  // If no markets data, return null
  if (!markets || !markets.length) {
    return null
  }

  try {
    // Start with barebone structure
    const healthComputer = JSON.parse(JSON.stringify(healthComputerBarebone))

    // Reset positions arrays
    healthComputer.positions.lends = []
    healthComputer.positions.debts = []

    // For each market, populate asset params and oracle prices
    markets.forEach((market) => {
      if (
        !market.asset ||
        !market.asset.denom ||
        !market.params ||
        !market.price ||
        !market.price.price ||
        !market.price.denom
      ) {
        return
      }

      // Add asset params
      healthComputer.asset_params[market.asset.denom] = market.params

      // Calculate and add oracle price
      const decimalDifferenceToOracle = (market.asset.decimals ?? 6) - 6
      healthComputer.oracle_prices[market.price.denom] = new BigNumber(market.price.price)
        .shiftedBy(-decimalDifferenceToOracle)
        .decimalPlaces(18)
        .toString()

      // Add positions if they exist
      if (market.deposit && market.deposit !== '0') {
        healthComputer.positions.lends.push({
          denom: market.asset.denom,
          amount: market.deposit,
        })
      }

      if (market.debt && market.debt !== '0') {
        healthComputer.positions.debts.push({
          denom: market.asset.denom,
          amount: market.debt,
          shares: '0',
        })
      }
    })

    return healthComputer
  } catch {
    return null
  }
}

export function generatePositions(markets: Market[]) {
  const positions: Positions = {
    account_kind: 'default',
    account_id: 'neutron1ev02crc36675xd8s029qh7wg3wjtfk37784aeh',
    debts: [],
    deposits: [],
    lends: [],
    staked_astro_lps: [],
    perps: [],
    vaults: [],
  }

  markets.forEach((market) => {
    if (market.deposit && market.deposit !== '0') {
      positions.lends.push({
        denom: market.asset.denom,
        amount: market.deposit,
      })
    }

    if (market.debt && market.debt !== '0') {
      positions.debts.push({
        denom: market.asset.denom,
        amount: market.debt,
        shares: '0',
      })
    }
  })

  return positions
}

export const updatePositions = (markets: Market[], action: ActionType, coin: Coin) => {
  // Clone the markets to avoid mutating the input directly
  const updatedMarkets = [...markets]

  // Find the market we're acting on
  const marketIndex = updatedMarkets.findIndex((m) => m.asset.denom === coin.denom)
  if (marketIndex === -1) {
    return null
  }

  // Create a copy of the market
  const updatedMarket = { ...updatedMarkets[marketIndex] }

  // Update the appropriate position based on action type
  switch (action) {
    case 'supply':
      // Increase lend position
      const currentDeposit = new BigNumber(updatedMarket.deposit || '0')
      const newDeposit = currentDeposit.plus(coin.amount)
      updatedMarket.deposit = newDeposit.toString()
      break

    case 'withdraw':
      // Decrease lend position
      const currentWithdrawDeposit = new BigNumber(updatedMarket.deposit || '0')
      // Ensure we're not withdrawing more than the current deposit
      if (new BigNumber(coin.amount).gt(currentWithdrawDeposit)) {
        return null
      }
      const newWithdrawDeposit = currentWithdrawDeposit.minus(coin.amount)
      updatedMarket.deposit = newWithdrawDeposit.toString()
      break

    case 'borrow':
      // Increase debt position
      const currentBorrowDebt = new BigNumber(updatedMarket.debt || '0')
      const newBorrowDebt = currentBorrowDebt.plus(coin.amount)
      updatedMarket.debt = newBorrowDebt.toString()
      break

    case 'repay':
      // Decrease debt position
      const currentRepayDebt = new BigNumber(updatedMarket.debt || '0')
      // Handle case where repayment amount exceeds current debt
      const newRepayDebt = currentRepayDebt.minus(coin.amount)
      if (newRepayDebt.lt(0)) {
        updatedMarket.debt = '0'
      } else {
        updatedMarket.debt = newRepayDebt.toString()
      }
      break

    default:
      return null
  }

  // Update the market in our temporary array
  updatedMarkets[marketIndex] = updatedMarket

  // Generate and return updated positions
  return generatePositions(updatedMarkets)
}

// Helper function to determine health factor color
export const getHealthFactorColor = (healthFactor: number): string => {
  if (healthFactor > 1.1) return 'text-green-500'
  if (healthFactor > 1.05) return 'text-amber-500'
  return 'text-red-500'
}
