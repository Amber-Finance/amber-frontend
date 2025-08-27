import { useChain } from '@cosmos-kit/react'
import { executeRoute } from '@skip-go/client'
import { BigNumber } from 'bignumber.js'
import { toast } from 'react-toastify'
import { mutate } from 'swr'

import chainConfig from '@/config/chain'
import { track } from '@/utils/analytics'

// Types
export type TransactionType = 'deposit' | 'withdraw' | 'borrow' | 'repay' | 'swap' | 'strategy'

export interface BaseTransactionParams {
  amount: string
  denom: string
  decimals: number
  symbol?: string
}

export interface DepositParams extends BaseTransactionParams {
  type: 'deposit'
}

export interface WithdrawParams extends BaseTransactionParams {
  type: 'withdraw'
}

export interface BorrowParams extends BaseTransactionParams {
  type: 'borrow'
  recipient?: string
}

export interface RepayParams extends BaseTransactionParams {
  type: 'repay'
  onBehalfOf?: string
}

export interface SwapParams {
  type: 'swap'
  fromToken: SwapToken
  toToken: SwapToken
  amount: string
  routeInfo: SwapRouteInfo
  slippage?: number
}

export interface StrategyParams {
  type: 'strategy'
  strategyType: 'create' | 'update' | 'close' | 'delete'
  accountId?: string
  accountKind?: 'default' | 'high_levered_strategy'
  actions: any[] // Action array from credit manager
  collateralAmount?: string
  multiplier?: number
}

export type TransactionParams =
  | DepositParams
  | WithdrawParams
  | BorrowParams
  | RepayParams
  | SwapParams
  | StrategyParams

// Hook for broadcast transactions
export function useBroadcast() {
  const { getSigningCosmWasmClient, address } = useChain(chainConfig.name)

  // Common transaction execution wrapper
  const executeTransaction = async (
    params: TransactionParams,
    customToastMessages?: {
      pending?: string
      success?: string
      error?: string
    },
  ) => {
    if (!address) {
      toast.error('Wallet not connected')
      return { success: false, error: 'Wallet not connected' }
    }

    const defaultMessages = {
      pending: 'Transaction pending...',
      success: 'Transaction successful',
      error: 'Transaction failed',
    }

    const messages = { ...defaultMessages, ...customToastMessages }
    const pendingToastId = toast.loading(messages.pending, { autoClose: false })

    try {
      let result

      switch (params.type) {
        case 'deposit':
          result = await executeDeposit(params)
          break
        case 'withdraw':
          result = await executeWithdraw(params)
          break
        case 'borrow':
          result = await executeBorrow(params)
          break
        case 'repay':
          result = await executeRepay(params)
          break
        case 'swap':
          result = await executeSwap(params)
          break
        case 'strategy':
          result = await executeStrategy(params)
          break
        default:
          throw new Error(`Unsupported transaction type: ${(params as any).type}`)
      }

      // Success handling
      toast.update(pendingToastId, {
        render: result.successMessage || messages.success,
        type: 'success',
        isLoading: false,
        autoClose: 4000,
      })

      // Refresh relevant data
      await refreshData(params)

      // Analytics tracking
      track(result.trackingEvent || `${params.type} success`)

      return { success: true, result }
    } catch (error) {
      console.error(`${params.type} transaction error:`, error)

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      toast.update(pendingToastId, {
        render: `${messages.error}: ${errorMessage}`,
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      })

      // Analytics tracking
      track(`${params.type} failed`, { error: errorMessage })

      return { success: false, error: errorMessage }
    }
  }

  // Red Bank deposit transaction
  const executeDeposit = async (params: DepositParams) => {
    const client = await getSigningCosmWasmClient()
    if (!client) throw new Error('Failed to connect to wallet')

    const formattedAmount = new BigNumber(params.amount)
      .shiftedBy(params.decimals)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString()

    const msg = { deposit: {} }
    const funds = [{ amount: formattedAmount, denom: params.denom }]

    await client.execute(address!, chainConfig.contracts.redBank, msg, 'auto', undefined, funds)

    return {
      successMessage: `Successfully deposited ${params.amount} ${params.symbol || params.denom}`,
      trackingEvent: `deposit ${params.amount} ${params.symbol || params.denom}`,
    }
  }

  // Red Bank withdraw transaction
  const executeWithdraw = async (params: WithdrawParams) => {
    const client = await getSigningCosmWasmClient()
    if (!client) throw new Error('Failed to connect to wallet')

    const formattedAmount = new BigNumber(params.amount)
      .shiftedBy(params.decimals)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString()

    const msg = {
      withdraw: {
        amount: formattedAmount,
        denom: params.denom,
      },
    }

    await client.execute(address!, chainConfig.contracts.redBank, msg, 'auto')

    return {
      successMessage: `Successfully withdrew ${params.amount} ${params.symbol || params.denom}`,
      trackingEvent: `withdraw ${params.amount} ${params.symbol || params.denom}`,
    }
  }

  // Red Bank borrow transaction
  const executeBorrow = async (params: BorrowParams) => {
    const client = await getSigningCosmWasmClient()
    if (!client) throw new Error('Failed to connect to wallet')

    const formattedAmount = new BigNumber(params.amount)
      .shiftedBy(params.decimals)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString()

    const msg = {
      borrow: {
        amount: formattedAmount,
        denom: params.denom,
        recipient: params.recipient,
      },
    }

    await client.execute(address!, chainConfig.contracts.redBank, msg, 'auto')

    return {
      successMessage: `Successfully borrowed ${params.amount} ${params.symbol || params.denom}`,
      trackingEvent: `borrow ${params.amount} ${params.symbol || params.denom}`,
    }
  }

  // Red Bank repay transaction
  const executeRepay = async (params: RepayParams) => {
    const client = await getSigningCosmWasmClient()
    if (!client) throw new Error('Failed to connect to wallet')

    const formattedAmount = new BigNumber(params.amount)
      .shiftedBy(params.decimals)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString()

    const msg = {
      repay: {
        on_behalf_of: params.onBehalfOf,
      },
    }

    const funds = [{ amount: formattedAmount, denom: params.denom }]

    await client.execute(address!, chainConfig.contracts.redBank, msg, 'auto', undefined, funds)

    return {
      successMessage: `Successfully repaid ${params.amount} ${params.symbol || params.denom}`,
      trackingEvent: `repay ${params.amount} ${params.symbol || params.denom}`,
    }
  }

  // Swap transaction using Skip Protocol
  const executeSwap = async (params: SwapParams) => {
    const getCosmosSigner = async (chainId: string) => {
      if (chainId !== chainConfig.id) {
        throw new Error(`Unsupported chain: ${chainId}`)
      }

      const client = await getSigningCosmWasmClient()
      if (!client) {
        throw new Error('Failed to get signing client')
      }

      return (client as any).signer || client
    }

    const userAddresses = params.routeInfo.route.requiredChainAddresses.map((chainId: string) => ({
      chainId,
      address: address!,
    }))

    await executeRoute({
      route: params.routeInfo.route,
      userAddresses,
      getCosmosSigner,
      slippageTolerancePercent: params.slippage?.toString() ?? '0.5',
    })

    return {
      successMessage: `Swap successful! ${params.amount} ${params.fromToken.symbol} → ${params.toToken.symbol}`,
      trackingEvent: `swap ${params.fromToken.symbol} to ${params.toToken.symbol}`,
    }
  }

  // Strategy transactions using Credit Manager
  const executeStrategy = async (params: StrategyParams) => {
    const client = await getSigningCosmWasmClient()
    if (!client) throw new Error('Failed to connect to wallet')

    let msg: any
    let funds: { amount: string; denom: string }[] = []

    switch (params.strategyType) {
      case 'create':
        msg = {
          create_credit_account: params.accountKind || 'high_levered_strategy',
        }
        break

      case 'update':
        if (!params.accountId) throw new Error('Account ID required for strategy update')
        msg = {
          update_credit_account: {
            account_id: params.accountId,
            account_kind: params.accountKind,
            actions: params.actions,
          },
        }

        // Add funds if collateral is being supplied
        if (params.collateralAmount && params.actions) {
          // Find deposit action to get collateral funds
          const depositAction = params.actions.find((action: any) => action.deposit)
          if (depositAction && depositAction.deposit) {
            funds = [
              {
                amount: depositAction.deposit.amount,
                denom: depositAction.deposit.denom,
              },
            ]
          }
        }
        break

      case 'close':
        if (!params.accountId) throw new Error('Account ID required for strategy close')
        // Close would typically be an update with specific close actions
        msg = {
          update_credit_account: {
            account_id: params.accountId,
            actions: params.actions, // Close actions
          },
        }
        break

      case 'delete':
        if (!params.accountId) throw new Error('Account ID required for strategy delete')
        // Delete strategy account and burn NFT
        const creditManagerMsg = {
          update_credit_account: {
            account_id: params.accountId,
            actions: params.actions, // Reclaim and refund actions
          },
        }

        const accountNftMsg = {
          burn: {
            token_id: params.accountId,
          },
        }

        // Execute both messages in sequence
        const cmResponse = await client.execute(
          address!,
          chainConfig.contracts.creditManager,
          creditManagerMsg,
          'auto',
          '',
          funds,
        )

        const nftResponse = await client.execute(
          address!,
          chainConfig.contracts.accountNft,
          accountNftMsg,
          'auto',
        )

        return {
          success: true,
          result: {
            creditManager: cmResponse,
            accountNft: nftResponse,
          },
        }

      default:
        throw new Error(`Unsupported strategy type: ${params.strategyType}`)
    }

    // Execute the strategy transaction (delete returns early)
    await client.execute(
      address!,
      chainConfig.contracts.creditManager,
      msg,
      'auto',
      undefined,
      funds,
    )

    const leverageText = params.multiplier ? ` at ${params.multiplier}x leverage` : ''
    const trackingLeverageText = params.multiplier ? ` ${params.multiplier}x` : ''

    return {
      successMessage: `Strategy ${params.strategyType} successful${leverageText}`,
      trackingEvent: `strategy ${params.strategyType}${trackingLeverageText}`,
    }
  }

  // Data refresh helper
  const refreshData = async (params: TransactionParams) => {
    const refreshPromises = [mutate('metricsRefresh'), mutate(`${address}/balances`)]

    // Add specific refreshes based on transaction type
    if (params.type === 'deposit' || params.type === 'withdraw') {
      refreshPromises.push(
        mutate(`${address}/positions`),
        mutate(`${address}/deposit/${params.denom}`),
      )
    }

    if (params.type === 'strategy') {
      refreshPromises.push(mutate(`${address}/positions`), mutate(`${address}/credit-accounts`))
    }

    await Promise.all(refreshPromises)
  }

  return {
    executeTransaction,
    executeDeposit,
    executeWithdraw,
    executeBorrow,
    executeRepay,
    executeSwap,
    executeStrategy,
  }
}
