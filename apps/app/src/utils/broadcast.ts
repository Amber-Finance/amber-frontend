/**
 * Transaction Broadcasting Module
 *
 * This module handles two distinct types of blockchain operations:
 *
 * 1. RED BANK OPERATIONS (Simple lending pool interactions)
 *    - Direct deposits/withdrawals to/from Mars Red Bank lending pools
 *    - Simple borrow/repay operations
 *    - Uses RedBank contract address
 *    - Message structure follows MarsRedBank.types.ts
 *
 * 2. STRATEGY OPERATIONS (Complex credit account interactions)
 *    - Multi-step leveraged strategy deployments
 *    - Credit account management (deploy, manage, modify leverage)
 *    - Uses Credit Manager contract address
 *    - Message structure follows MarsCreditManager.types.ts
 *    - Involves borrowing, swapping, and complex position management
 */
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
import { getErrorSeverity, parseErrorMessage } from '@/utils/errorParsing'
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
      amount: { exact: config.coinIn.amount.toString() },
      denom: config.coinIn.denom,
    },
    denom_out: config.denomOut,
    min_receive: minReceive,
    route: config.routeInfo.route,
  })
}

const createDepositAction = (denom: string, amount: string) =>
  createAction('deposit', { amount, denom })

const createBorrowAction = (denom: string, amount: string) =>
  createAction('borrow', { amount, denom })

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

const buildModifyLeverageActions = (config: ModifyLeverageConfig) => {
  if (config.actionType === 'increase') {
    // Increase leverage: borrow more debt, swap to collateral, deposit
    const formattedDebt = formatAmount(config.debt.amount, config.debt.decimals)

    return [
      createBorrowAction(config.debt.denom, formattedDebt),
      createSwapAction({
        coinIn: { denom: config.debt.denom, amount: formattedDebt },
        denomOut: config.collateral.denom,
        slippage: config.swap.slippage || '0.5',
        routeInfo: config.swap.routeInfo,
      }),
      // The swapped collateral will automatically be deposited as lent position
    ]
  } else {
    // Decrease leverage: swap collateral to debt, repay debt
    // No withdrawal needed - the swap and repay achieve the desired leverage reduction
    // Use the collateral amount from reverse routing (already calculated precisely)
    const formattedCollateral = formatAmount(config.collateral.amount, config.collateral.decimals)

    return [
      createSwapAction({
        coinIn: { denom: config.collateral.denom, amount: formattedCollateral },
        denomOut: config.debt.denom,
        slippage: config.swap.slippage || '0.5',
        routeInfo: config.swap.routeInfo,
      }),
      createRepayAction(config.accountId, config.debt.denom),
    ]
  }
}

const generateSuccessMessage = (config: TransactionConfig): string => {
  switch (config.type) {
    case 'modify_leverage': {
      const action = config.actionType === 'increase' ? 'increased' : 'decreased'
      return `Leverage ${action} successfully to ${config.targetLeverage.toFixed(2)}x!`
    }

    case 'strategy': {
      switch (config.strategyType) {
        case 'create':
          return `Strategy deployed successfully at ${(config as any).multiplier?.toFixed(2) || 'N/A'}x leverage!`
        case 'increase':
          return `Strategy leverage increased successfully to ${(config as any).multiplier?.toFixed(2) || 'N/A'}x!`
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
  if (config.type === 'strategy') {
    return `strategy_${config.strategyType}`
  } else {
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

  const executeModifyLeverage = async (config: ModifyLeverageConfig) => {
    const client = await getWalletClient()

    const actions = buildModifyLeverageActions(config)
    const funds: any[] = []

    // For increasing leverage, no funds needed (borrowing from protocol)
    // For decreasing leverage, no funds needed (using existing collateral)

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

  const executeStrategy = async (config: StrategyParams | DeployStrategyConfig) => {
    const client = await getWalletClient()

    let actions: any[]
    let contractAddress: string
    let message: any
    const funds: any[] = []

    // Handle different config types
    if ('actions' in config) {
      // Standard StrategyParams with actions
      actions = config.actions
    } else {
      // DeployStrategyConfig - convert to actions
      actions = buildDeployActions(config)
    }

    switch (config.strategyType) {
      case 'create':
        // New strategy deployment - create account and execute actions in one transaction
        contractAddress = chainConfig.contracts.creditManager

        // For deployment, we need to include the collateral as funds
        if ('collateral' in config) {
          const collateralAmount = formatAmount(
            config.collateral.amount,
            config.collateral.decimals,
          )
          funds.push({
            denom: config.collateral.denom,
            amount: collateralAmount,
          })
        }

        message = {
          update_credit_account: {
            actions,
          },
        }
        break

      case 'increase':
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
        amount: formattedAmount,
        denom: config.denom,
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
      // Strategy operations (Credit Manager contract)
      modify_leverage: () => executeModifyLeverage(config as ModifyLeverageConfig),
      strategy: () => executeStrategy(config as StrategyParams),

      // Red Bank operations (Red Bank contract)
      deposit: () => executeDeposit(config as DepositConfig),
      withdraw: () => executeWithdraw(config as WithdrawConfig),
      borrow: () => executeBorrow(config as BorrowConfig),
      repay: () => executeRepay(config as RepayConfig),

      // Swap operations (Skip Protocol)
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
      modify_leverage: [
        `${address}/positions`,
        `${address}/credit-accounts`,
        `activeStrategies-${address}`,
      ],
      strategy: [
        `${address}/positions`,
        `${address}/credit-accounts`,
        `activeStrategies-${address}`,
      ],
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
      const rawErrorMessage = error instanceof Error ? error.message : 'Unknown error'

      // Parse the error into a user-friendly message
      const userFriendlyMessage = parseErrorMessage(rawErrorMessage)
      const errorSeverity = getErrorSeverity(rawErrorMessage)

      // Determine toast type based on severity
      const toastType = errorSeverity === 'warning' ? 'warning' : 'error'

      toast.update(pendingToastId, {
        render: userFriendlyMessage,
        type: toastType,
        isLoading: false,
        autoClose: errorSeverity === 'warning' ? 6000 : 4000, // Longer for warnings so users can read
      })

      // Track with both raw and parsed error for debugging
      track(`${config.type}_failed`, {
        rawError: rawErrorMessage,
        parsedError: userFriendlyMessage,
        severity: errorSeverity,
      })

      return { success: false, error: rawErrorMessage }
    }
  }

  return {
    executeTransaction,
    executeModifyLeverage,
    executeStrategy,
    executeDeposit,
    executeWithdraw,
    executeBorrow,
    executeRepay,
    executeSwap,
  }
}
