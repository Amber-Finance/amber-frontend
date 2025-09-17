import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { GasPrice } from '@cosmjs/stargate'
import { useChain } from '@cosmos-kit/react'
import { executeRoute } from '@skip-go/client'
import { BigNumber } from 'bignumber.js'
import { toast } from 'react-toastify'
import { mutate } from 'swr'

import chainConfig from '@/config/chain'
import type { Action } from '@/types/generated/mars-credit-manager/MarsCreditManager.types'
import { track } from '@/utils/analytics'
import { getMinAmountOutFromRouteInfo } from '@/utils/swap'

const formatAmount = (amount: number, decimals: number): string => {
  return new BigNumber(amount).shiftedBy(decimals).integerValue(BigNumber.ROUND_DOWN).toString()
}

const createAction = (actionType: string, payload: any): Action =>
  ({
    [actionType]: payload,
  }) as Action

const createSwapAction = (config: {
  coinIn: { denom: string; amount: string }
  denomOut: string
  slippage: string
  routeInfo: SwapRouteInfo
}) => {
  const slippageNum = parseFloat(config.slippage)
  const minReceive = getMinAmountOutFromRouteInfo(config.routeInfo, slippageNum)
    .integerValue()
    .toString()

  return createAction('swap_exact_in', {
    coin_in: {
      denom: config.coinIn.denom,
      amount: { exact: config.coinIn.amount },
    },
    denom_out: config.denomOut,
    min_receive: minReceive,
    route: config.routeInfo.route,
  })
}

const createDepositAction = (denom: string, amount: string) =>
  createAction('deposit', { denom, amount })

const createBorrowAction = (denom: string, amount: string) =>
  createAction('borrow', { denom, amount })

const createRepayAction = (accountId: string, denom: string) =>
  createAction('repay', {
    coin: {
      denom: denom,
      amount: 'account_balance',
    },
    recipient_account_id: accountId,
  })

const createRefundAction = () => createAction('refund_all_coin_balances', {})

const buildDeployActions = (config: DeployStrategyConfig) => {
  const formattedCollateral = formatAmount(config.collateral.amount, config.collateral.decimals)
  const formattedDebt = formatAmount(config.debt.amount, config.debt.decimals)

  return [
    createDepositAction(config.collateral.denom, formattedCollateral),
    createBorrowAction(config.debt.denom, formattedDebt),
    createSwapAction({
      coinIn: { denom: config.debt.denom, amount: formattedDebt },
      denomOut: config.swap.destDenom,
      slippage: config.swap.slippage || '0.5',
      routeInfo: config.swap.routeInfo,
    }),
  ]
}

const buildManageActions = (config: ManageStrategyConfig) => {
  const formattedCollateral = formatAmount(config.collateral.amount, config.collateral.decimals)

  return [
    createSwapAction({
      coinIn: { denom: config.collateral.denom, amount: formattedCollateral },
      denomOut: config.debt.denom,
      slippage: config.swap.slippage || '0.5',
      routeInfo: config.swap.routeInfo,
    }),
    createRepayAction(config.accountId, config.debt.denom),
    createRefundAction(),
  ]
}

const generateSuccessMessage = (config: TransactionConfig): string => {
  switch (config.type) {
    case 'deploy_strategy': {
      const action = config.strategyType === 'create' ? 'Deploying' : 'Increasing'
      return `${action} strategy successful at ${config.multiplier.toFixed(2)}x leverage!`
    }

    case 'manage_strategy': {
      const closure = config.actionType === 'close_full' ? 'fully closed' : 'partially closed'
      return `Strategy ${closure} successfully! Collateral swapped back, debt repaid, and balances refunded.`
    }

    case 'strategy': {
      switch (config.strategyType) {
        case 'update':
          return 'Strategy withdrawal successful!'
        case 'decrease':
          return 'Strategy position closed successfully!'
        case 'delete':
          return 'Strategy account deleted successfully!'
        default:
          return 'Strategy operation successful!'
      }
    }

    case 'deposit':
      return `Successfully deposited ${config.amount} ${config.symbol || config.denom}`

    case 'withdraw':
      return `Successfully withdrew ${config.amount} ${config.symbol || config.denom}`

    case 'borrow':
      return `Successfully borrowed ${config.amount} ${config.symbol || config.denom}`

    case 'repay':
      return `Successfully repaid ${config.amount} ${config.symbol || config.denom}`

    case 'swap':
      return `Swap successful! ${config.amount} ${config.fromToken.symbol} → ${config.toToken.symbol}`

    default:
      return 'Transaction successful'
  }
}

const generateTrackingEvent = (config: TransactionConfig): string => {
  switch (config.type) {
    case 'deploy_strategy':
      return `strategy_${config.strategyType}_${config.multiplier}x`

    case 'manage_strategy':
      return `strategy_${config.actionType}`

    case 'strategy':
      return `strategy_${config.strategyType}`

    default:
      return `${config.type}_success`
  }
}

export function useBroadcast() {
  const { address, isWalletConnected, getOfflineSigner } = useChain(chainConfig.name)

  const getWalletClient = async () => {
    const offlineSigner = getOfflineSigner()
    if (!offlineSigner) {
      throw new Error('Wallet not connected. Please connect your wallet first.')
    }

    return await SigningCosmWasmClient.connectWithSigner(
      chainConfig.endpoints.rpcUrl,
      offlineSigner,
      {
        gasPrice: GasPrice.fromString('0.025untrn'),
      },
    )
  }

  // Pure function for message creation
  const createMessages = (customMessages?: ToastMessages): ToastMessages => ({
    pending: 'Processing transaction...',
    success: 'Transaction successful',
    error: 'Transaction failed',
    ...customMessages,
  })

  const executeDeployStrategy = async (config: DeployStrategyConfig) => {
    const client = await getWalletClient()

    const actions = buildDeployActions(config)
    const funds = [
      {
        amount: formatAmount(config.collateral.amount, config.collateral.decimals),
        denom: config.collateral.denom,
      },
    ]

    const msg = {
      update_credit_account: {
        account_id: config.strategyType === 'create' ? undefined : config.accountId,
        actions,
      },
    }
    console.log('executeDeployStrategy', msg)

    await client.execute(
      address!,
      chainConfig.contracts.creditManager,
      msg,
      'auto',
      undefined,
      funds,
    )

    return {
      successMessage: generateSuccessMessage(config),
      trackingEvent: generateTrackingEvent(config),
    }
  }

  const executeManageStrategy = async (config: ManageStrategyConfig) => {
    const client = await getWalletClient()

    const actions = buildManageActions(config)
    const funds = [
      {
        amount: formatAmount(config.debt.amount, config.debt.decimals),
        denom: config.debt.denom,
      },
    ]

    const msg = {
      update_credit_account: {
        account_id: config.accountId,
        actions,
      },
    }

    await client.execute(
      address!,
      chainConfig.contracts.creditManager,
      msg,
      'auto',
      undefined,
      funds,
    )

    return {
      successMessage: generateSuccessMessage(config),
      trackingEvent: generateTrackingEvent(config),
    }
  }

  const executeStrategy = async (config: StrategyParams) => {
    const client = await getWalletClient()

    // For strategy operations, actions are provided directly
    const actions = config.actions
    const funds: any[] = [] // Strategy operations typically don't require funds

    let contractAddress: string
    let message: any

    switch (config.strategyType) {
      case 'update':
      case 'decrease':
        contractAddress = chainConfig.contracts.creditManager
        message = {
          update_credit_account: {
            account_id: config.accountId,
            actions,
          },
        }
        break
      case 'delete':
        contractAddress = chainConfig.contracts.accountNft
        message = {
          burn: {
            token_id: config.accountId,
          },
        }
        break
      default:
        throw new Error(`Unsupported strategy type: ${config.strategyType}`)
    }

    const result = await client.execute(
      address!,
      contractAddress,
      message,
      'auto',
      undefined,
      funds,
    )
    console.log('result', result)

    return {
      result,
      successMessage: generateSuccessMessage(config),
      trackingEvent: generateTrackingEvent(config),
    }
  }

  const executeDeposit = async (config: DepositConfig) => {
    const client = await getWalletClient()

    const formattedAmount = formatAmount(Number(config.amount), config.decimals)
    const msg = {
      deposit: {
        account_id: null,
        on_behalf_of: null,
      },
    }
    const funds = [{ amount: formattedAmount, denom: config.denom }]

    await client.execute(address!, chainConfig.contracts.redBank, msg, 'auto', undefined, funds)

    return {
      successMessage: generateSuccessMessage(config),
      trackingEvent: generateTrackingEvent(config),
    }
  }

  const executeWithdraw = async (config: WithdrawConfig) => {
    const client = await getWalletClient()

    const formattedAmount = formatAmount(Number(config.amount), config.decimals)
    const msg = {
      withdraw: {
        account_id: null,
        amount: formattedAmount,
        denom: config.denom,
        liquidation_related: null,
        recipient: null,
      },
    }

    await client.execute(address!, chainConfig.contracts.redBank, msg, 'auto')

    return {
      successMessage: generateSuccessMessage(config),
      trackingEvent: generateTrackingEvent(config),
    }
  }

  const executeBorrow = async (config: BorrowConfig) => {
    const client = await getWalletClient()

    const formattedAmount = formatAmount(Number(config.amount), config.decimals)
    const msg = {
      borrow: {
        amount: formattedAmount,
        denom: config.denom,
        recipient: config.recipient || null,
      },
    }

    await client.execute(address!, chainConfig.contracts.redBank, msg, 'auto')

    return {
      successMessage: generateSuccessMessage(config),
      trackingEvent: generateTrackingEvent(config),
    }
  }

  const executeRepay = async (config: RepayConfig) => {
    const client = await getWalletClient()

    const formattedAmount = formatAmount(Number(config.amount), config.decimals)
    const msg = {
      repay: {
        on_behalf_of: config.onBehalfOf || null,
      },
    }
    const funds = [{ amount: formattedAmount, denom: config.denom }]

    await client.execute(address!, chainConfig.contracts.redBank, msg, 'auto', undefined, funds)

    return {
      successMessage: generateSuccessMessage(config),
      trackingEvent: generateTrackingEvent(config),
    }
  }

  const executeSwap = async (config: SwapTransactionConfig) => {
    const getCosmosSigner = async (chainId: string) => {
      if (chainId !== chainConfig.id) {
        throw new Error(`Unsupported chain: ${chainId}`)
      }

      const client = await getWalletClient()
      return (client as any).signer || client
    }

    const userAddresses = config.routeInfo.route.requiredChainAddresses.map((chainId: string) => ({
      chainId,
      address: address!,
    }))

    await executeRoute({
      route: config.routeInfo.route,
      userAddresses,
      getCosmosSigner,
      slippageTolerancePercent: config.slippage?.toString() ?? '0.5',
    })

    return {
      successMessage: generateSuccessMessage(config),
      trackingEvent: generateTrackingEvent(config),
    }
  }

  const createExecutor = (config: TransactionConfig) => {
    const executorMap = {
      deploy_strategy: () => executeDeployStrategy(config as DeployStrategyConfig),
      manage_strategy: () => executeManageStrategy(config as ManageStrategyConfig),
      strategy: () => executeStrategy(config as StrategyParams),
      deposit: () => executeDeposit(config as DepositConfig),
      withdraw: () => executeWithdraw(config as WithdrawConfig),
      borrow: () => executeBorrow(config as BorrowConfig),
      repay: () => executeRepay(config as RepayConfig),
      swap: () => executeSwap(config as SwapTransactionConfig),
    }

    return (
      executorMap[config.type] ||
      (() => {
        throw new Error(`Unsupported transaction type: ${config.type}`)
      })
    )
  }

  const refreshData = async (config: TransactionConfig) => {
    const baseRefreshes = [mutate('metricsRefresh'), mutate(`${address}/balances`)]

    const refreshMap: Record<string, string[]> = {
      deposit: [`${address}/positions`, `${address}/deposit/${(config as DepositConfig).denom}`],
      withdraw: [`${address}/positions`, `${address}/deposit/${(config as WithdrawConfig).denom}`],
      deploy_strategy: [`${address}/positions`, `${address}/credit-accounts`],
      manage_strategy: [`${address}/positions`, `${address}/credit-accounts`],
      strategy: [`${address}/positions`, `${address}/credit-accounts`],
    }

    const additionalRefreshes = refreshMap[config.type] || []
    const allRefreshes = baseRefreshes.concat(additionalRefreshes.map((key) => mutate(key)))

    await Promise.all(allRefreshes)
  }

  const executeTransaction = async (
    config: TransactionConfig,
    customMessages?: ToastMessages,
  ): Promise<TransactionResult> => {
    if (!address || !isWalletConnected) {
      toast.error('Wallet not connected')
      return { success: false, error: 'Wallet not connected' }
    }

    const messages = createMessages(customMessages)
    const pendingToastId = toast.loading(messages.pending, { autoClose: false })

    try {
      const executor = createExecutor(config)
      const result = await executor()

      const successMessage = result?.successMessage || generateSuccessMessage(config)
      const trackingEvent = result?.trackingEvent || generateTrackingEvent(config)

      toast.update(pendingToastId, {
        render: successMessage,
        type: 'success',
        isLoading: false,
        autoClose: 4000,
      })

      await refreshData(config)
      track(trackingEvent)

      return { success: true, result }
    } catch (error) {
      console.error(`${config.type} transaction error:`, error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      toast.update(pendingToastId, {
        render: `${messages.error}: ${errorMessage}`,
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      })

      track(`${config.type}_failed`, { error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  return {
    executeTransaction,
    executeDeployStrategy,
    executeManageStrategy,
    executeStrategy,
    executeDeposit,
    executeWithdraw,
    executeBorrow,
    executeRepay,
    executeSwap,
  }
}
