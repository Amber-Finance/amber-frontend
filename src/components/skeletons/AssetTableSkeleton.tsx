import React from "react";

interface AssetTableSkeletonProps {
  title?: string;
  columns?: { id: string; label: string }[];
  headerElement?: React.ReactNode;
}

const defaultColumns = [
  { id: "asset", label: "Asset" },
  { id: "balance", label: "Balance" },
  { id: "apy", label: "APY" },
];

/**
 * AssetTableSkeleton - Loading skeleton for AssetTable component
 */
const AssetTableSkeleton: React.FC<AssetTableSkeletonProps> = ({
  columns = defaultColumns,
  headerElement,
}) => {
  // Mobile card skeleton
  const mobileCardSkeleton = (
    <div className="sm:hidden">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="p-3 border-b last:border-b-0 border-gray-200 dark:border-gray-800"
        >
          <div className="flex flex-col">
            {/* Asset info and APY */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="animate-pulse h-10 w-10 bg-gray-200 rounded-full dark:bg-gray-700 mr-3"></div>
                <div className="animate-pulse h-6 w-24 bg-gray-200 rounded dark:bg-gray-700"></div>
              </div>
              <div className="flex flex-col items-end">
                <div className="animate-pulse h-4 w-10 bg-gray-200 rounded dark:bg-gray-700 mb-1"></div>
                <div className="animate-pulse h-5 w-16 bg-gray-200 rounded dark:bg-gray-700"></div>
              </div>
            </div>

            {/* Balance */}
            <div className="flex justify-between items-center mb-4">
              <div className="animate-pulse h-4 w-20 bg-gray-200 rounded dark:bg-gray-700"></div>
              <div className="animate-pulse h-5 w-24 bg-gray-200 rounded dark:bg-gray-700"></div>
            </div>

            {/* Button */}
            <div className="animate-pulse h-10 w-full bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Desktop table skeleton
  const desktopTableSkeleton = (
    <div className="hidden sm:block overflow-x-auto">
      <div className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <div className="bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-4 gap-4 px-4 py-3">
            {columns.map((column) => (
              <div
                key={column.id}
                className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                <div className="animate-pulse h-4 w-16 bg-gray-200 rounded dark:bg-gray-700"></div>
              </div>
            ))}
            <div className="text-right">
              <div className="animate-pulse h-4 w-16 bg-gray-200 rounded dark:bg-gray-700"></div>
            </div>
          </div>
        </div>
        <div className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-800">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-4 gap-4 px-4 py-3 items-center"
            >
              <div className="whitespace-nowrap">
                <div className="flex items-center">
                  <div className="animate-pulse h-8 w-8 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                  <div className="ml-4">
                    <div className="animate-pulse h-4 w-24 bg-gray-200 rounded dark:bg-gray-700"></div>
                  </div>
                </div>
              </div>
              {columns.slice(1).map((column, colIndex) => (
                <div key={colIndex} className="whitespace-nowrap text-right">
                  <div className="animate-pulse h-4 w-16 bg-gray-200 rounded dark:bg-gray-700"></div>
                  {column.id === "balance" && (
                    <div className="animate-pulse h-3 w-12 bg-gray-200 rounded dark:bg-gray-700 mt-1"></div>
                  )}
                </div>
              ))}
              <div className="whitespace-nowrap text-right">
                <div className="animate-pulse h-8 w-20 bg-gray-200 rounded dark:bg-gray-700"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden lg:rounded-lg rounded-none shadow bg-white dark:bg-gray-900">
      <div className="p-2 sm:p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="animate-pulse h-6 w-32 bg-gray-200 rounded dark:bg-gray-700"></div>
          {headerElement && (
            <div className="animate-pulse h-5 w-40 bg-gray-200 rounded dark:bg-gray-700 mt-2 sm:mt-0"></div>
          )}
        </div>
      </div>

      {/* Responsive skeleton views */}
      {mobileCardSkeleton}
      {desktopTableSkeleton}
    </div>
  );
};

export default AssetTableSkeleton;
