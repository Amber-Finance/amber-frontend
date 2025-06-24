'use client'

import TokenBalance from '@/components/common/TokenBalance'
import React from 'react'

/**
 * Example component showing how to use the TokenBalance
 * that gets USD value from the store automatically
 */
const TokenBalanceExample: React.FC = () => {
  // Example coin data - in a real component, this would come from API data or props
  const exampleCoin = {
    denom: 'untrn', // The denomination identifier that matches the market data in the store
    amount: '1000000', // Amount in base units (usually need to be converted from natural units)
  }

  return (
    <div className='p-4 border rounded-lg'>
      <h2 className='mb-4 text-lg font-semibold'>Token Balance Example</h2>

      <div className='space-y-4'>
        <div>
          <h3 className='text-sm font-medium text-gray-500'>Standard Size:</h3>
          <TokenBalance coin={exampleCoin} size='md' />
        </div>

        <div>
          <h3 className='text-sm font-medium text-gray-500'>Small Size:</h3>
          <TokenBalance coin={exampleCoin} size='sm' />
        </div>

        <div>
          <h3 className='text-sm font-medium text-gray-500'>Large Size:</h3>
          <TokenBalance coin={exampleCoin} size='lg' />
        </div>

        <div>
          <h3 className='text-sm font-medium text-gray-500'>Left Aligned:</h3>
          <TokenBalance coin={exampleCoin} align='left' />
        </div>
      </div>

      <div className='mt-6 text-sm text-gray-600'>
        <p>Note: The USD value is automatically calculated using:</p>
        <ul className='ml-5 list-disc'>
          <li>The coin&apos;s denom to find the matching market</li>
          <li>The market&apos;s price data from the store</li>
          <li>The appropriate token decimals from the market&apos;s asset data</li>
        </ul>
      </div>
    </div>
  )
}

export default TokenBalanceExample
