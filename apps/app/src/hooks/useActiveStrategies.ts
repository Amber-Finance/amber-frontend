import { useCallback, useEffect, useState } from 'react'

import { useChain } from '@cosmos-kit/react'
import { BigNumber } from 'bignumber.js'

import chainConfig from '@/config/chain'
import tokens from '@/config/tokens'
import { useStore } from '@/store/useStore'
import { calculateUsdValue } from '@/utils/format'

interface ActiveStrategy {
  accountId: string
  collateralAsset: {
    denom: string
    symbol: string
    amount: string
    amountFormatted: number
    usdValue: number
  }
  debtAsset: {
    denom: string
    symbol: string
    amount: string
    amountFormatted: number
    usdValue: number
  }
  leverage: number
  netApy: number
  isPositive: boolean
  strategyId: string
}

export function useActiveStrategies() {
  const { address, getCosmWasmClient } = useChain(chainConfig.name)
  const { markets } = useStore()
  const [activeStrategies, setActiveStrategies] = useState<ActiveStrategy[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get WBTC.eureka denom (temporarily using WBTC.eureka as mentioned in requirements)
  const wbtcDenom = 'ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E' // WBTC.eureka for now
  const wbtcEurekaDenom = 'ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E' // actual WBTC.eureka

  const scanCreditAccounts = useCallback(async () => {
    if (!address || !markets?.length) return

    setIsLoading(true)
    setError(null)

    try {
      const client = await getCosmWasmClient()
      if (!client) throw new Error('Failed to get CosmWasm client')

      // Query all tokens first, then filter by owner
      let allTokens = []

      try {
        const allTokensQuery = {
          all_tokens: {},
        }

        const allTokensResponse = await client.queryContractSmart(
          chainConfig.contracts.accountNft,
          allTokensQuery,
        )

        console.log('All tokens response:', allTokensResponse)

        // Handle different possible response formats
        if (Array.isArray(allTokensResponse)) {
          allTokens = allTokensResponse
        } else if (allTokensResponse?.data && Array.isArray(allTokensResponse.data)) {
          allTokens = allTokensResponse.data
        } else if (allTokensResponse?.tokens && Array.isArray(allTokensResponse.tokens)) {
          allTokens = allTokensResponse.tokens
        } else {
          console.warn('Unexpected all_tokens response format:', allTokensResponse)
          allTokens = []
        }
      } catch (allTokensError) {
        console.error('Failed to query all_tokens:', allTokensError)
        allTokens = []
      }

      // For each token, query the owner and positions
      // Limit to first 20 tokens to avoid rate limiting
      const maxTokensToCheck = Math.min(allTokens.length, 20)
      const tokensToCheck = allTokens.slice(0, maxTokensToCheck)

      console.log(`Checking ${tokensToCheck.length} out of ${allTokens.length} total tokens`)

      const defaultAccounts = []

      if (tokensToCheck.length === 0) {
        console.log('No tokens found to check')
        setActiveStrategies([])
        return
      }

      for (const tokenId of tokensToCheck) {
        try {
          // Query token owner
          const ownerQuery = {
            owner_of: {
              token_id: tokenId,
            },
          }

          const ownerResponse = await client.queryContractSmart(
            chainConfig.contracts.accountNft,
            ownerQuery,
          )

          const tokenOwner = ownerResponse?.owner
          console.log(`Token ${tokenId} owner:`, tokenOwner, 'User address:', address)

          // Check if this token belongs to the user
          if (tokenOwner === address) {
            // Query account positions from credit manager
            const positionsQuery = {
              positions: {
                account_id: tokenId,
              },
            }

            const positionsResponse = await client.queryContractSmart(
              chainConfig.contracts.creditManager,
              positionsQuery,
            )

            console.log(`Positions for account ${tokenId}:`, positionsResponse)

            // Check if this account has positions (lends or debts)
            if (
              positionsResponse &&
              ((positionsResponse.lends && positionsResponse.lends.length > 0) ||
                (positionsResponse.debts && positionsResponse.debts.length > 0))
            ) {
              defaultAccounts.push({
                id: tokenId,
                kind: 'default', // Assume default for now
                positions: positionsResponse,
              })
            }
          }
        } catch (tokenError) {
          console.warn(`Failed to query token ${tokenId}:`, tokenError)
        }
      }

      console.log(`Found ${defaultAccounts.length} active accounts for user`)

      const strategies: ActiveStrategy[] = []

      // Scan each default credit account
      for (const account of defaultAccounts) {
        try {
          // Use the positions data already retrieved
          const positions = account.positions
          const lends = positions?.lends || []
          const debts = positions?.debts || []

          // Look for WBTC collateral (either WBTC.axl or WBTC.eureka)
          const wbtcCollateral = lends.find(
            (lend: any) => lend.denom === wbtcDenom || lend.denom === wbtcEurekaDenom,
          )

          if (!wbtcCollateral) continue

          // Look for BTC debt assets
          const btcDebts = debts.filter((debt: any) => {
            const token = tokens.find((t) => t.denom === debt.denom)
            return token && token.symbol.includes('BTC') && token.symbol !== 'WBTC'
          })

          // Create strategy entries for each BTC debt
          for (const debt of btcDebts) {
            const collateralToken = tokens.find((t) => t.denom === wbtcCollateral.denom)
            const debtToken = tokens.find((t) => t.denom === debt.denom)

            if (!collateralToken || !debtToken) continue

            // Find market data for price calculations
            const collateralMarket = markets.find((m) => m.asset.denom === wbtcCollateral.denom)
            const debtMarket = markets.find((m) => m.asset.denom === debt.denom)

            if (!collateralMarket || !debtMarket) continue

            // Calculate formatted amounts
            const collateralAmount = new BigNumber(wbtcCollateral.amount)
              .shiftedBy(-collateralToken.decimals)
              .toNumber()

            const debtAmount = new BigNumber(debt.amount).shiftedBy(-debtToken.decimals).toNumber()

            // Calculate USD values
            const collateralUsd = calculateUsdValue(
              wbtcCollateral.amount,
              collateralMarket.price?.price || '0',
              collateralToken.decimals,
            )

            const debtUsd = calculateUsdValue(
              debt.amount,
              debtMarket.price?.price || '0',
              debtToken.decimals,
            )

            // Calculate leverage: (collateral + debt) / collateral
            const leverage = collateralUsd > 0 ? (collateralUsd + debtUsd) / collateralUsd : 1

            // Calculate net APY (simplified calculation)
            const collateralSupplyApy = parseFloat(collateralMarket.metrics?.liquidity_rate || '0')
            const debtBorrowApy = parseFloat(debtMarket.metrics?.borrow_rate || '0')
            const netApy = collateralSupplyApy * leverage - debtBorrowApy * (leverage - 1)

            const strategy: ActiveStrategy = {
              accountId: account.id,
              collateralAsset: {
                denom: wbtcCollateral.denom,
                symbol: collateralToken.symbol,
                amount: wbtcCollateral.amount,
                amountFormatted: collateralAmount,
                usdValue: collateralUsd,
              },
              debtAsset: {
                denom: debt.denom,
                symbol: debtToken.symbol,
                amount: debt.amount,
                amountFormatted: debtAmount,
                usdValue: debtUsd,
              },
              leverage,
              netApy,
              isPositive: netApy > 0,
              strategyId: `${collateralToken.symbol}-${debtToken.symbol}`,
            }

            strategies.push(strategy)
          }
        } catch (accountError) {
          console.warn(`Failed to scan account ${account.id}:`, accountError)
        }
      }

      setActiveStrategies(strategies)
    } catch (err) {
      console.error('Failed to scan credit accounts:', err)
      setError(err instanceof Error ? err.message : 'Failed to scan credit accounts')
    } finally {
      setIsLoading(false)
    }
  }, [address, getCosmWasmClient, wbtcDenom, wbtcEurekaDenom])

  // Scan accounts when wallet connects (only on initial load and address changes)
  useEffect(() => {
    if (address) {
      scanCreditAccounts()
    } else {
      setActiveStrategies([])
    }
  }, [address]) // Only depend on address, not markets

  // Manual refresh function
  const refreshActiveStrategies = useCallback(() => {
    if (address) {
      scanCreditAccounts()
    }
  }, [address, scanCreditAccounts])

  return {
    activeStrategies,
    isLoading,
    error,
    refreshActiveStrategies,
    hasActiveStrategies: activeStrategies.length > 0,
  }
}
