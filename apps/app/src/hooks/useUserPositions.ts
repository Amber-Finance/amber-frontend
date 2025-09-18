import { useEffect, useRef } from 'react'

import { useChain } from '@cosmos-kit/react'
import useSWR from 'swr'

import chainConfig from '@/config/chain'
import { useStore } from '@/store/useStore'

/**
 * Hook to fetch user positions and update the markets store.
 * No longer returns position data directly as it's stored in the markets.
 * @returns isLoading - Whether positions are being loaded
 * @returns isReady - Whether the wallet is connected and ready to load positions
 */
export default function useUserPositions() {
  const { address } = useChain(chainConfig.name)
  const { updateMarketPositions } = useStore()

  // Track previous positions with a ref to avoid unnecessary updates
  const prevPositionsRef = useRef<{
    deposits: UserPosition[]
    debts: UserPosition[]
  } | null>(null)

  useEffect(() => {
    prevPositionsRef.current = null
  }, [address])

  // Only create a key when user is connected
  const swrKey = address ? `${address}/positions` : null

  const { isLoading } = useSWR(
    swrKey,
    () => getUserPositions(chainConfig.contracts.redBank, address!),
    {
      fallbackData: { deposits: [], debts: [] },
      revalidateOnMount: true,
      revalidateOnFocus: true,
      onSuccess: (data) => {
        if (data && hasPositionsChanged(prevPositionsRef.current, data)) {
          updateMarketPositions(data)
          prevPositionsRef.current = data
        }
      },
    },
  )

  // Helper function to check if positions data has changed
  const hasPositionsChanged = (
    prevPositions: { deposits: UserPosition[]; debts: UserPosition[] } | null,
    newPositions: { deposits: UserPosition[]; debts: UserPosition[] },
  ): boolean => {
    if (!prevPositions) return true

    // Check if number of deposits or debts has changed
    if (
      prevPositions.deposits.length !== newPositions.deposits.length ||
      prevPositions.debts.length !== newPositions.debts.length
    ) {
      return true
    }

    // Check if any deposit amounts have changed
    const depositsChanged = newPositions.deposits.some((newDeposit) => {
      const prevDeposit = prevPositions.deposits.find((d) => d.denom === newDeposit.denom)
      return !prevDeposit || prevDeposit.amount !== newDeposit.amount
    })

    if (depositsChanged) return true

    // Check if any debt amounts have changed
    const debtsChanged = newPositions.debts.some((newDebt) => {
      const prevDebt = prevPositions.debts.find((d) => d.denom === newDebt.denom)
      return !prevDebt || prevDebt.amount !== newDebt.amount
    })

    return debtsChanged
  }

  // We're no longer using the useEffect since we're handling updates in onSuccess

  return {
    isLoading: address ? isLoading : false,
    isReady: !!address,
  }
}

async function getUserPositions(
  redbankContract: string,
  address: string,
): Promise<{ deposits: UserPosition[]; debts: UserPosition[] }> {
  try {
    // Query for user collaterals (deposits)
    const depositsQuery = btoa(
      JSON.stringify({
        user_collaterals_v2: {
          user: address,
          limit: 10,
        },
      }),
    )

    const depositsUrl = `${chainConfig.endpoints.restUrl}/cosmwasm/wasm/v1/contract/${redbankContract}/smart/${depositsQuery}`
    const depositsResponse = await fetch(depositsUrl)

    // Query for user debts
    const debtsQuery = btoa(
      JSON.stringify({
        user_debts: {
          user: address,
          limit: 10,
        },
      }),
    )

    const debtsUrl = `${chainConfig.endpoints.restUrl}/cosmwasm/wasm/v1/contract/${redbankContract}/smart/${debtsQuery}`
    const debtsResponse = await fetch(debtsUrl)

    // Process the responses
    let deposits: UserPosition[] = []
    let debts: UserPosition[] = []

    if (depositsResponse.ok) {
      const data: CollateralResponse = await depositsResponse.json()
      deposits = data.data.data
    }

    if (debtsResponse.ok) {
      const data: DebtResponse = await debtsResponse.json()
      debts = data.data
    }

    return { deposits, debts }
  } catch (error) {
    console.error('Error fetching user positions:', error)
    return { deposits: [], debts: [] }
  }
}
