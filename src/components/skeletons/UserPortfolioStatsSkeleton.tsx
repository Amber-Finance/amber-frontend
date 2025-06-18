import React from "react";

/**
 * UserPortfolioStatsSkeleton - Loading skeleton for UserPortfolioStats component
 */
const UserPortfolioStatsSkeleton: React.FC = () => {
  return (
    <div className="mb-6 px-4 lg:px-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-4 sm:space-y-0">
          {/* Net Worth Loading */}
          <div>
            <div className="mb-1 text-sm text-gray-500 dark:text-gray-500">
              Net worth
            </div>
            <div className="text-xl font-medium">
              <div className="animate-pulse h-6 w-32 bg-gray-200 rounded dark:bg-gray-700"></div>
            </div>
          </div>

          {/* Net APY Loading */}
          <div>
            <div className="mb-1 text-sm text-gray-500 dark:text-gray-500">
              Net APY
            </div>
            <div className="text-xl font-medium">
              <div className="animate-pulse h-6 w-24 bg-gray-200 rounded dark:bg-gray-700"></div>
            </div>
          </div>
        </div>

        {/* Button Loading */}
        <div className="animate-pulse h-8 w-36 bg-gray-200 rounded dark:bg-gray-700 mt-4 sm:mt-0"></div>
      </div>
    </div>
  );
};

export default UserPortfolioStatsSkeleton;
