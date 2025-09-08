'use client'

import { useRef } from 'react'

import { useSearchParams } from 'next/navigation'

import { useChain } from '@cosmos-kit/react'
import BigNumber from 'bignumber.js'
import { ArrowUpDown } from 'lucide-react'

import { TokenSelectorModal } from '@/components/common/TokenSelectorModal'
import SwapBeamDesktop from '@/components/swap/SwapBeamDesktop'
import SwapBeamMobile from '@/components/swap/SwapBeamMobile'
import { SwapButton } from '@/components/swap/SwapButton'
import { SwapRouteInfo } from '@/components/swap/SwapRouteInfo'
import { SwapSettings } from '@/components/swap/SwapSettings'
import { SwapTokenInput } from '@/components/swap/SwapTokenInput'
import { AuroraText } from '@/components/ui/AuroraText'
import { Card, CardContent } from '@/components/ui/card'
import chainConfig from '@/config/chain'
import { useSwap } from '@/hooks/swap/useSwap'
import { useSwapButton } from '@/hooks/swap/useSwapButton'
import { useSwapEffects } from '@/hooks/swap/useSwapEffects'
import { useSwapLogic } from '@/hooks/swap/useSwapLogic'
import { useSwapState } from '@/hooks/swap/useSwapState'

export default function SwapClient() {
  const searchParams = useSearchParams()
  const { address } = useChain(chainConfig.name)
  const fromInputRef = useRef<HTMLInputElement>(null)

  // Functional state management
  const { state, actions } = useSwapState()

  // Business logic
  const logic = useSwapLogic({ state, actions, address })

  // Button state
  const { label: swapButtonLabel, isDisabled: isSwapButtonDisabled } = useSwapButton({
    state,
    isWalletConnected: logic.isWalletConnected,
    showInsufficientFunds: logic.showInsufficientFunds || false,
    fromToken: logic.fromToken,
    toToken: logic.toToken,
    routeInfo: logic.routeInfo,
    isRouteLoading: logic.isRouteLoading,
    isDebouncePending: logic.isDebouncePending,
  })

  // Effects (depends on logic)
  useSwapEffects({
    actions,
    address,
    searchParams,
    swapTokens: logic.swapTokens,
    bestToken: logic.bestToken,
    shouldInitialize: logic.shouldInitialize,
    markInitialized: logic.markInitialized,
  })

  const { executeSwap } = useSwap()

  const handleSwap = async () => {
    if (!logic.routeInfo || !logic.fromToken || !logic.toToken) return

    actions.setIsSwapInProgress(true)
    try {
      const success = await executeSwap(
        logic.routeInfo,
        logic.fromToken,
        logic.toToken,
        state.fromAmount,
        state.slippage,
      )
      if (success) {
        actions.resetAmounts()
        actions.setEditingDirection('from')
      }
    } catch (error) {
      console.error('Swap failed:', error)
    } finally {
      actions.setIsSwapInProgress(false)
    }
  }

  return (
    <>
      <div className='relative w-full py-8 sm:py-10 px-4 max-w-6xl mx-auto'>
        <div className='flex flex-col items-center gap-4'>
          <h1 className='text-3xl lg:text-5xl font-funnel leading-tight'>
            Swap <AuroraText>Bitcoin Related</AuroraText> Tokens
          </h1>
          <p className='text-xs sm:text-base text-muted-foreground max-w-md text-center'>
            Trade between BRTs with minimal slippage and competitive rates.
          </p>
        </div>
      </div>
      <div className='w-full max-w-lg mx-auto pb-0 sm:pb-16'>
        <Card className='bg-card rounded-2xl shadow-xl border border-border/30 py-2'>
          <CardContent className='sm:py-2 px-2'>
            <div className='flex items-center justify-end pb-2 text-xs text-muted-foreground'>
              <SwapSettings
                slippage={state.slippage}
                customSlippage={state.customSlippage}
                showSlippagePopover={state.showSlippagePopover}
                onSlippageChange={actions.setSlippage}
                onCustomSlippageChange={actions.setCustomSlippage}
                onPopoverToggle={actions.setShowSlippagePopover}
              />
            </div>

            {/* From Section */}
            <SwapTokenInput
              type='from'
              token={logic.fromToken}
              amount={state.fromAmount}
              usdValue={logic.fromUsdValue}
              balance={logic.fromToken?.balance || '0'}
              showInsufficientFunds={logic.showInsufficientFunds || false}
              onAmountChange={(amount) => {
                actions.setFromAmount(amount)
                actions.setEditingDirection('from')
                setTimeout(() => {
                  if (fromInputRef.current) {
                    fromInputRef.current.selectionStart = fromInputRef.current.value.length
                    fromInputRef.current.selectionEnd = fromInputRef.current.value.length
                  }
                }, 0)
              }}
              onTokenSelect={() => {
                actions.setSelectingFrom(true)
                actions.setTokenModalOpen(true)
              }}
              onQuickAmountSelect={(percent) => {
                if (logic.fromToken && parseFloat(logic.fromToken.balance) > 0) {
                  const calculatedAmount = parseFloat(logic.fromToken.balance) * percent
                  actions.setFromAmount(calculatedAmount.toFixed(8))
                  actions.setEditingDirection('from')
                }
              }}
              inputRef={fromInputRef as React.RefObject<HTMLInputElement>}
            />

            {/* Switch Button */}
            <div className='relative flex items-center justify-center mb-2'>
              <button
                onClick={actions.swapTokens}
                className='absolute left-1/2 -translate-x-1/2 bg-background border border-border rounded-full p-2 shadow-lg hover:bg-muted/40 z-10 cursor-pointer transition-transform duration-300 hover:rotate-180'
              >
                <ArrowUpDown className='w-5 h-5 text-primary' />
              </button>
            </div>

            {/* To Section */}
            <SwapTokenInput
              type='to'
              token={logic.toToken}
              amount={state.toAmount}
              usdValue={logic.toUsdValue}
              balance={logic.toToken?.balance || '0'}
              onAmountChange={(amount) => {
                actions.setToAmount(amount)
                actions.setEditingDirection('to')
              }}
              onTokenSelect={() => {
                actions.setSelectingFrom(false)
                actions.setTokenModalOpen(true)
              }}
            />

            {/* Swap Info */}
            {logic.fromToken && logic.toToken && (state.fromAmount || state.toAmount) && (
              <SwapRouteInfo
                amountIn={state.fromAmount}
                amountOut={logic.routeInfo?.amountOut || new BigNumber(0)}
                priceImpact={logic.routeInfo?.priceImpact?.toNumber() || 0}
                fromToken={logic.fromToken}
                toToken={logic.toToken}
                slippage={state.slippage}
                isRouteLoading={logic.isRouteLoading}
                route={logic.routeInfo?.route}
                isDebouncePending={logic.isDebouncePending}
                routeError={logic.routeError}
              />
            )}

            <SwapButton
              label={swapButtonLabel}
              disabled={isSwapButtonDisabled}
              onClick={() => {
                if (!logic.isWalletConnected) return
                handleSwap()
              }}
            />
          </CardContent>
        </Card>
        <TokenSelectorModal
          open={state.isTokenModalOpen}
          onOpenChange={actions.setTokenModalOpen}
          tokens={logic.swapTokens}
          selectedToken={state.selectingFrom ? logic.fromToken : logic.toToken}
          onSelect={(token) => {
            if (state.selectingFrom) {
              actions.setFromTokenDenom(token.denom)
            } else {
              actions.setToTokenDenom(token.denom)
            }
          }}
          isWalletConnected={logic.isWalletConnected}
          disabledTokens={logic.disabledTokens}
        />
      </div>
      <div className='hidden md:block'>
        <SwapBeamDesktop fromToken={logic.fromToken?.symbol} toToken={logic.toToken?.symbol} />
      </div>
      <div className='md:hidden'>
        <SwapBeamMobile
          fromToken={logic.fromToken ? logic.fromToken.symbol : null}
          toToken={logic.toToken ? logic.toToken.symbol : null}
        />
      </div>
    </>
  )
}
