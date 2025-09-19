import { useCallback, useMemo, useState } from 'react'

import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Slider } from '@/components/ui/slider'
import { useStrategyLeverageModification } from '@/hooks/useStrategyLeverageModification'
import { calculateCurrentLeverage } from '@/utils/leverageCalculations'

// Helper function to determine health factor color
const getHealthFactorColor = (healthFactor: number): string => {
  if (healthFactor > 1.1) return 'text-green-600'
  if (healthFactor > 1.05) return 'text-yellow-600'
  return 'text-red-600'
}

interface LeverageAdjustmentProps {
  strategy: Strategy
  activeStrategy: ActiveStrategy
  isExpanded?: boolean
  onToggle?: () => void
}

export function LeverageAdjustment({
  strategy,
  activeStrategy,
  isExpanded = false,
  onToggle,
}: LeverageAdjustmentProps) {
  const currentLeverage = useMemo(
    () =>
      calculateCurrentLeverage(
        activeStrategy.collateralAsset.usdValue,
        activeStrategy.debtAsset.usdValue,
      ),
    [activeStrategy.collateralAsset.usdValue, activeStrategy.debtAsset.usdValue],
  )

  const { modifyLeverage, validateLeverageModification, getMaxSafeLeverage, isProcessing } =
    useStrategyLeverageModification({
      strategy,
      accountId: activeStrategy.accountId,
      activeStrategy,
    })

  const [targetLeverage, setTargetLeverage] = useState(currentLeverage)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const maxSafeLeverage = useMemo(() => getMaxSafeLeverage(), [getMaxSafeLeverage])

  const validation = useMemo(
    () => validateLeverageModification(targetLeverage),
    [validateLeverageModification, targetLeverage],
  )

  const leverageChange = targetLeverage - currentLeverage
  const isIncreasing = leverageChange > 0
  const hasChanged = Math.abs(leverageChange) > 0.01

  const handleLeverageChange = useCallback((value: number[]) => {
    setTargetLeverage(value[0])
    setShowConfirmation(false)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!validation.isValid) return

    const result = await modifyLeverage(targetLeverage)
    if (result.success) {
      setShowConfirmation(false)
      onToggle?.() // Close the expanded view
    }
  }, [modifyLeverage, targetLeverage, validation.isValid, onToggle])

  const handleReset = useCallback(() => {
    setTargetLeverage(currentLeverage)
    setShowConfirmation(false)
  }, [currentLeverage])

  const formatLeverage = (leverage: number) => leverage.toFixed(2)

  if (!isExpanded) {
    return (
      <div className='flex items-center justify-between py-2'>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground text-sm'>Current Leverage</span>
          <span className='font-medium'>{formatLeverage(currentLeverage)}x</span>
        </div>
        <Button variant='outline' size='sm' onClick={onToggle} className='text-xs px-3'>
          Adjust
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-4 p-4 bg-secondary/10 rounded-lg border border-border/20'>
      <div className='flex items-center justify-between'>
        <h4 className='font-medium text-foreground'>Adjust Leverage</h4>
        <Button variant='ghost' size='sm' onClick={onToggle} className='text-xs'>
          Cancel
        </Button>
      </div>

      {/* Leverage Slider */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-muted-foreground'>Target Leverage</span>
          <div className='flex items-center gap-2'>
            {isIncreasing ? (
              <TrendingUp className='w-4 h-4 text-green-500' />
            ) : (
              <TrendingDown className='w-4 h-4 text-red-500' />
            )}
            <span className='font-medium'>{formatLeverage(targetLeverage)}x</span>
          </div>
        </div>

        <Slider
          value={[targetLeverage]}
          onValueChange={handleLeverageChange}
          min={1}
          max={maxSafeLeverage}
          step={0.1}
          className='w-full'
          disabled={isProcessing}
        />

        <div className='flex justify-between text-xs text-muted-foreground'>
          <span>1.0x</span>
          <span className='flex items-center gap-1'>
            Max Safe: {formatLeverage(maxSafeLeverage)}x
            <Tooltip>
              <TooltipTrigger>
                <AlertTriangle className='w-3 h-3' />
              </TooltipTrigger>
              <TooltipContent>
                <p className='text-xs max-w-xs'>
                  Maximum safe leverage maintains health factor above 1.05 to prevent liquidation
                </p>
              </TooltipContent>
            </Tooltip>
          </span>
        </div>
      </div>

      {/* Impact Preview */}
      {hasChanged && (
        <div className='space-y-2 p-3 bg-background/50 rounded border border-border/10'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>Leverage Change</span>
            <span className={`font-medium ${isIncreasing ? 'text-green-600' : 'text-red-600'}`}>
              {isIncreasing ? '+' : ''}
              {formatLeverage(leverageChange)}x
            </span>
          </div>

          {validation.newHealthFactor && (
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>New Health Factor</span>
              <span className={`font-medium ${getHealthFactorColor(validation.newHealthFactor)}`}>
                {validation.newHealthFactor.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Validation Error */}
      {!validation.isValid && hasChanged && (
        <div className='p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-600 dark:text-red-400'>
          <div className='flex items-center gap-2'>
            <AlertTriangle className='w-4 h-4' />
            <span>{validation.error}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={handleReset}
          disabled={!hasChanged || isProcessing}
          className='flex-1'
        >
          Reset
        </Button>

        {!showConfirmation ? (
          <Button
            variant='default'
            size='sm'
            onClick={() => setShowConfirmation(true)}
            disabled={!hasChanged || !validation.isValid || isProcessing}
            className='flex-1'
          >
            {isIncreasing ? 'Increase' : 'Decrease'} Leverage
          </Button>
        ) : (
          <Button
            variant='destructive'
            size='sm'
            onClick={handleConfirm}
            disabled={isProcessing}
            className='flex-1'
          >
            {isProcessing ? 'Processing...' : 'Confirm'}
          </Button>
        )}
      </div>

      {/* Warning for high leverage */}
      {targetLeverage > 8 && (
        <div className='p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-yellow-600 dark:text-yellow-400'>
          <div className='flex items-center gap-2'>
            <AlertTriangle className='w-4 h-4' />
            <span>High leverage increases liquidation risk. Monitor your position closely.</span>
          </div>
        </div>
      )}
    </div>
  )
}
