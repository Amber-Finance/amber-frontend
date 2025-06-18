import React from "react";

/**
 * AssetItemSkeleton - Loading skeleton for AssetItem component
 */
const AssetItemSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-end">
      <div className="text-base font-medium text-gray-900 dark:text-white mb-0.5">
        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
  );
};

export default AssetItemSkeleton;
