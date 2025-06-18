"use client";

export default function MarketDetailsSkeleton() {
  return (
    <div className="container mx-auto p-6">
      {/* Back button skeleton */}
      <div className="mb-4">
        <div className="flex items-center">
          <div className="h-4 w-4 mr-2 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
        </div>
      </div>

      {/* Market Header skeleton */}
      <div className="flex items-center mb-8 bg-white dark:bg-zinc-900 p-6 rounded-lg">
        <div className="mr-4">
          <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
        </div>
        <div>
          <div className="h-8 w-48 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse mb-2"></div>
          <div className="h-6 w-24 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
        </div>
      </div>

      {/* Main Metrics skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-zinc-800 p-4 rounded-lg">
            <div className="h-5 w-32 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse mb-3"></div>
            <div className="h-8 w-24 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Market status & configuration skeleton */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 mb-8">
        <div className="h-7 w-64 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse mb-4"></div>

        {/* Supply and Borrow Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* Supply Section */}
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-gray-300 dark:bg-zinc-600 rounded-full mr-2"></div>
              <div className="h-6 w-32 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
            </div>
            <div className="space-y-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="h-5 w-28 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
                  <div className="h-5 w-20 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Borrow Section */}
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-gray-300 dark:bg-zinc-600 rounded-full mr-2"></div>
              <div className="h-6 w-32 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="h-5 w-28 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
                  <div className="h-5 w-20 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Collateral Usage skeleton */}
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-gray-300 dark:bg-zinc-600 rounded-full mr-2"></div>
            <div className="h-6 w-40 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="h-5 w-28 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
                  <div className="h-5 w-20 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-5 w-28 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
                <div className="h-5 w-20 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interest Rate Model skeleton */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 mb-8">
        <div className="h-7 w-48 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse mb-4"></div>

        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg">
          <div className="mb-6">
            <div className="h-6 w-32 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse mb-2"></div>
          </div>

          {/* Interest Rate Chart skeleton */}
          <div className="h-64 w-full rounded bg-gray-200 dark:bg-zinc-700 animate-pulse mb-6"></div>

          {/* Model explanation skeleton */}
          <div>
            <div className="h-6 w-56 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse mb-3"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="h-4 w-full rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
