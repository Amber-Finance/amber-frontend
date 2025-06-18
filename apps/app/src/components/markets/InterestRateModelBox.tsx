"use client";

import { InterestRateChart } from "@/components/metrics";
import React from "react";

// Define the model type based on the data structure
interface InterestRateModel {
  optimal_utilization_rate: string;
  base: string;
  slope_1: string;
  slope_2: string;
}

interface InterestRateModelBoxProps {
  interestRateModel: InterestRateModel;
  reserveFactor: number;
  currentUtilization: number;
  optimalUtilizationRate: string;
}

const InterestRateModelBox: React.FC<InterestRateModelBoxProps> = ({
  interestRateModel,
  reserveFactor,
  currentUtilization,
  optimalUtilizationRate,
}) => {
  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sm:rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 shadow">
      <h2 className="text-xl font-bold mb-3 sm:mb-4">Interest rate model</h2>

      <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 sm:p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Utilization Rate</h3>
        </div>

        {/* Interest Rate Chart */}
        <div className="mb-4">
          <InterestRateChart
            interestRateModel={interestRateModel}
            reserveFactor={reserveFactor / 100}
            currentUtilization={currentUtilization}
          />
        </div>

        {/* Model explanation */}
        <div className="prose prose-sm dark:prose-invert">
          <h4 className="text-md font-semibold">
            How the interest rate model works
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Interest rates are determined dynamically based on the utilization
            rate of the asset. The utilization rate is the ratio between the
            total borrowed amount and the total supplied amount.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            When utilization is below the optimal level (
            {(parseFloat(optimalUtilizationRate) * 100).toFixed(0)}
            %), interest rates increase gradually to incentivize borrowing.
            Above the optimal level, rates increase more steeply to encourage
            more deposits and less borrowing, ensuring liquidity for
            withdrawals.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            The model adjusts dynamically to market conditions, targeting an
            equilibrium that maximizes capital efficiency while maintaining
            adequate liquidity. The reserve factor ({reserveFactor}
            %) determines how much of the interest paid by borrowers is kept as
            protocol reserves versus distributed to suppliers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterestRateModelBox;
