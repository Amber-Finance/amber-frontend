import React from "react";

/**
 * MarketPageSkeleton - Loading skeleton for Markets page
 */
const MarketPageSkeleton: React.FC = () => {
  return (
    <div className="w-full lg:container lg:px-4 py-8 mx-auto">
      {/* Instance Header Skeleton */}
      <div className="mb-6 flex justify-between items-center">
        <div className="animate-pulse h-8 w-48 bg-gray-200 rounded dark:bg-gray-700"></div>
        <div className="animate-pulse h-10 w-40 bg-gray-200 rounded dark:bg-gray-700"></div>
      </div>

      {/* Market Stats Skeleton */}
      <div className="mb-8 grid grid-cols-3 gap-6 p-6 rounded-lg bg-white shadow dark:bg-gray-900">
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded dark:bg-gray-700 mb-3"></div>
          <div className="h-6 w-40 bg-gray-200 rounded dark:bg-gray-700"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded dark:bg-gray-700 mb-3"></div>
          <div className="h-6 w-40 bg-gray-200 rounded dark:bg-gray-700"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded dark:bg-gray-700 mb-3"></div>
          <div className="h-6 w-40 bg-gray-200 rounded dark:bg-gray-700"></div>
        </div>
      </div>

      {/* Market Table Skeleton */}
      <div className="overflow-hidden rounded-lg shadow bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div className="animate-pulse h-4 w-32 bg-gray-200 rounded dark:bg-gray-700"></div>
          <div className="animate-pulse h-10 w-64 bg-gray-200 rounded dark:bg-gray-700"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {[
                  "Asset",
                  "Supplied",
                  "Supply APY",
                  "Borrowed",
                  "Borrow APY",
                ].map((header, i) => (
                  <th
                    key={i}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    <div className="animate-pulse h-4 w-16 bg-gray-200 rounded dark:bg-gray-700"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-800">
              {[...Array(6)].map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="animate-pulse h-8 w-8 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                      <div className="ml-4">
                        <div className="animate-pulse h-4 w-24 bg-gray-200 rounded dark:bg-gray-700"></div>
                      </div>
                    </div>
                  </td>
                  {[...Array(4)].map((_, i) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 w-20 bg-gray-200 rounded dark:bg-gray-700"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketPageSkeleton;
