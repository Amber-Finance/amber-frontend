import { useCallback, useEffect, useState } from 'react'

import { useChain } from '@cosmos-kit/react'
import { BigNumber } from 'bignumber.js'

import chainConfig from '@/config/chain'
import tokens from '@/config/tokens'
import { useStore } from '@/store/useStore'
import { calculateUsdValueLegacy } from '@/utils/format'

export function useActiveStrategies() {
  const { address, getCosmWasmClient } = useChain(chainConfig.name)
  const { markets } = useStore()
  const [activeStrategies, setActiveStrategies] = useState<ActiveStrategy[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get WBTC.eureka denom (temporarily using WBTC.eureka as mentioned in requirements)
  const wbtcDenom = 'ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E' // WBTC.eureka for now

  const getAllTokens = async (client: any) => {
    const allTokensQuery = { all_tokens: {} }
    const response = await client.queryContractSmart(
      chainConfig.contracts.accountNft,
      allTokensQuery,
    )

    if (Array.isArray(response)) return response
    if (response?.data && Array.isArray(response.data)) return response.data
    if (response?.tokens && Array.isArray(response.tokens)) return response.tokens
    return []
  }

  const getTokenOwner = async (client: any, tokenId: string) => {
    const ownerQuery = { owner_of: { token_id: tokenId } }
    const response = await client.queryContractSmart(chainConfig.contracts.accountNft, ownerQuery)
    return response?.owner
  }

  const getTokenPositions = async (client: any, tokenId: string) => {
    const positionsQuery = { positions: { account_id: tokenId } }
    return await client.queryContractSmart(chainConfig.contracts.creditManager, positionsQuery)
  }

  const hasActivePositions = (positions: any) => {
    return positions && (positions.lends?.length > 0 || positions.debts?.length > 0)
  }

  const createStrategy = (account: any, wbtcCollateral: any, debt: any) => {
    const collateralToken = tokens.find((t) => t.denom === wbtcCollateral.denom)
    const debtToken = tokens.find((t) => t.denom === debt.denom)
    const collateralMarket = markets?.find((m) => m.asset.denom === wbtcCollateral.denom)
    const debtMarket = markets?.find((m) => m.asset.denom === debt.denom)

    if (!collateralToken || !debtToken || !collateralMarket || !debtMarket) return null

    const collateralAmount = new BigNumber(wbtcCollateral.amount)
      .shiftedBy(-collateralToken.decimals)
      .toNumber()
    const debtAmount = new BigNumber(debt.amount).shiftedBy(-debtToken.decimals).toNumber()

    const collateralUsd = calculateUsdValueLegacy(
      wbtcCollateral.amount,
      collateralMarket.price?.price || '0',
      collateralToken.decimals,
    )
    const debtUsd = calculateUsdValueLegacy(
      debt.amount,
      debtMarket.price?.price || '0',
      debtToken.decimals,
    )

    const leverage = collateralUsd > 0 ? (collateralUsd + debtUsd) / collateralUsd : 1
    const collateralSupplyApy = parseFloat(collateralMarket.metrics?.liquidity_rate || '0')
    const debtBorrowApy = parseFloat(debtMarket.metrics?.borrow_rate || '0')
    const netApy = collateralSupplyApy * leverage - debtBorrowApy * (leverage - 1)

    return {
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
  }

  const getUserAccounts = async (client: any, tokensToCheck: string[]) => {
    const accounts = []
    for (const tokenId of tokensToCheck) {
      try {
        const tokenOwner = await getTokenOwner(client, tokenId)
        if (tokenOwner !== address) continue

        const positions = await getTokenPositions(client, tokenId)
        if (hasActivePositions(positions)) {
          accounts.push({ id: tokenId, kind: 'default', positions })
        }
      } catch (error) {
        console.warn(`Failed to query token ${tokenId}:`, error)
      }
    }
    return accounts
  }

  const processAccount = (account: any) => {
    const { lends = [], debts = [] } = account.positions
    const wbtcCollateral = lends.find((lend: any) => lend.denom === wbtcDenom)

    if (!wbtcCollateral) return []

    const btcDebts = debts.filter((debt: any) => {
      const token = tokens.find((t) => t.denom === debt.denom)
      return token && token.symbol.includes('BTC') && token.symbol !== 'WBTC'
    })

    return btcDebts
      .map((debt: any) => createStrategy(account, wbtcCollateral, debt))
      .filter(Boolean)
  }

  const scanCreditAccounts = useCallback(async () => {
    if (!address || !markets?.length) return

    setIsLoading(true)
    setError(null)

    try {
      const client = await getCosmWasmClient()
      if (!client) throw new Error('Failed to get CosmWasm client')

      const allTokens = await getAllTokens(client).catch(() => [])
      const tokensToCheck = allTokens.slice(0, Math.min(allTokens.length, 20))

      if (tokensToCheck.length === 0) {
        setActiveStrategies([])
        return
      }

      const defaultAccounts = await getUserAccounts(client, tokensToCheck)
      const strategies = defaultAccounts.flatMap(processAccount)

      setActiveStrategies(strategies)
    } catch (err) {
      console.error('Failed to scan credit accounts:', err)
      setError(err instanceof Error ? err.message : 'Failed to scan credit accounts')
    } finally {
      setIsLoading(false)
    }
  }, [address, getCosmWasmClient, wbtcDenom, markets])

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
