'use client'

import { useSearchParams } from 'next/navigation'

import { useChain } from '@cosmos-kit/react'

import { DeployStrategy } from '@/components/strategy/DeployStrategy'
import { ModifyStrategy } from '@/components/strategy/ModifyStrategy'
import chainConfig from '@/config/chain'
import { useActiveStrategies } from '@/hooks/usePortfolioData'

interface StrategyDeployClientProps {
  strategy: Strategy
}

export default function StrategyDeployClient({ strategy }: StrategyDeployClientProps) {
  const searchParams = useSearchParams()
  const { address } = useChain(chainConfig.name)
  const activeStrategies = useActiveStrategies()

  // Check for explicit URL parameters first (backwards compatibility)
  const forceModifying = searchParams.get('modify') === 'true'
  const explicitAccountId = searchParams.get('accountId')

  // Find existing active strategy for this collateral/debt pair
  const existingStrategy = activeStrategies?.find(
    (active: ActiveStrategy) =>
      active.collateralAsset.symbol === strategy.collateralAsset.symbol &&
      active.debtAsset.symbol === strategy.debtAsset.symbol,
  )

  // Determine mode and accountId
  let shouldShowModify = false
  let accountId = ''

  if (forceModifying && explicitAccountId) {
    // Explicit URL parameters take precedence (backwards compatibility)
    shouldShowModify = true
    accountId = explicitAccountId
  } else if (address && existingStrategy) {
    // Auto-detect: user is connected and has existing position
    shouldShowModify = true
    accountId = existingStrategy.accountId
  }

  // Render appropriate component
  if (shouldShowModify) {
    return <ModifyStrategy strategy={strategy} />
  }

  return <DeployStrategy strategy={strategy} />
}
