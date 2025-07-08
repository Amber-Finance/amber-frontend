import { useEffect, useState } from 'react'

import { useChain } from '@cosmos-kit/react'

import chainConfig from '@/config/chain'

export function useUserDeposit(denom: string | undefined) {
  const { address } = useChain(chainConfig.name)
  const [amount, setAmount] = useState<string>('0')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchDeposit() {
      if (!address || !denom) {
        setAmount('0')
        return
      }
      setIsLoading(true)
      try {
        const query = btoa(
          JSON.stringify({
            user_collateral: {
              user: address,
              denom,
            },
          }),
        )
        const url = `${chainConfig.endpoints.restUrl}/cosmwasm/wasm/v1/contract/${chainConfig.constracts.moneyMarketContract}/smart/${query}`
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setAmount(data.data.amount || '0')
        } else {
          setAmount('0')
        }
      } catch {
        setAmount('0')
      } finally {
        setIsLoading(false)
      }
    }
    fetchDeposit()
  }, [address, denom])

  return { amount, isLoading }
}
