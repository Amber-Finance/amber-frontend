"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type InterestRateModelParams = {
  optimal_utilization_rate: string;
  base: string;
  slope_1: string;
  slope_2: string;
};

interface InterestRateChartProps {
  interestRateModel: InterestRateModelParams;
  reserveFactor: number;
  currentUtilization: number;
}

// Define tooltip types
type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
    color: string;
  }>;
  label?: string | number;
};

/**
 * Convert APR to APY
 * Uses the standard compound interest formula: APY = (1 + APR/n)^n - 1
 * Where n is the number of compounding periods per year (using 365 for daily compounding)
 * @param apr Annual Percentage Rate as a percentage (e.g., 5 for 5%)
 * @returns Annual Percentage Yield as a percentage
 */
const convertFromAprToApy = (apr: number): number => {
  const compoundingPeriods = 365; // Daily compounding
  // Convert APR from percentage to decimal for the calculation
  const aprDecimal = apr / 100;
  // Apply compound interest formula
  const apy =
    (Math.pow(1 + aprDecimal / compoundingPeriods, compoundingPeriods) - 1) *
    100;
  // Return with 2 decimal places
  return parseFloat(apy.toFixed(2));
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border rounded-md shadow-lg p-3">
        <p className="font-medium text-popover-foreground mb-1">
          Utilization: {label}%
        </p>
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            <span className="text-muted-foreground">Borrow APY: </span>
            <span className="ml-1 font-medium text-yellow-600 dark:text-yellow-400">
              {payload[2]?.value}%
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-amber-200 rounded-full mr-2"></span>
            <span className="text-muted-foreground">Borrow APR: </span>
            <span className="ml-1 font-medium text-amber-300 dark:text-amber-200">
              {payload[0]?.value}%
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span className="text-muted-foreground">Supply APY: </span>
            <span className="ml-1 font-medium text-green-600 dark:text-green-400">
              {payload[3]?.value}%
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-200 rounded-full mr-2"></span>
            <span className="text-muted-foreground">Supply APR: </span>
            <span className="ml-1 font-medium text-green-300 dark:text-green-200">
              {payload[1]?.value}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function InterestRateChart({
  interestRateModel,
  reserveFactor,
  currentUtilization,
}: InterestRateChartProps) {
  // Generate interest rate model data points
  const interestRateData = useMemo(() => {
    const dataPoints = [];

    // Get interest rate model parameters
    const optimalUtilizationRate =
      parseFloat(interestRateModel.optimal_utilization_rate) * 100;
    const base = parseFloat(interestRateModel.base) * 100;
    const slope1 = parseFloat(interestRateModel.slope_1) * 100;
    const slope2 = parseFloat(interestRateModel.slope_2) * 100;
    const reserveFactorValue = reserveFactor;

    // Generate data points from 0% to 100% utilization with higher density (every 1%)
    for (let i = 0; i <= 100; i += 1) {
      let borrowRate;
      if (i <= optimalUtilizationRate) {
        // Before optimal: base + slope1 * (utilization / optimal)
        borrowRate = base + (i / optimalUtilizationRate) * slope1;
      } else {
        // After optimal: base + slope1 + slope2 * (utilization - optimal) / (1 - optimal)
        borrowRate =
          base +
          slope1 +
          ((i - optimalUtilizationRate) / (100 - optimalUtilizationRate)) *
            slope2;
      }

      // Supply rate = borrow rate * utilization * (1 - reserve factor)
      const supplyRate = borrowRate * (i / 100) * (1 - reserveFactorValue);

      // Convert APR to APY for both rates
      const borrowApy = convertFromAprToApy(borrowRate);
      const supplyApy = convertFromAprToApy(supplyRate);

      // Store both APR and APY values
      dataPoints.push({
        utilization: i,
        borrowApr: parseFloat(borrowRate.toFixed(2)),
        supplyApr: parseFloat(supplyRate.toFixed(2)),
        borrowRate: borrowApy,
        supplyRate: supplyApy,
      });
    }

    // Add exact points for current utilization and optimal utilization to ensure alignment with reference lines
    const exactCurrentUtil = parseFloat(currentUtilization.toFixed(2));
    if (!dataPoints.some((p) => p.utilization === exactCurrentUtil)) {
      let borrowRate;
      if (exactCurrentUtil <= optimalUtilizationRate) {
        borrowRate =
          base + (exactCurrentUtil / optimalUtilizationRate) * slope1;
      } else {
        borrowRate =
          base +
          slope1 +
          ((exactCurrentUtil - optimalUtilizationRate) /
            (100 - optimalUtilizationRate)) *
            slope2;
      }
      const supplyRate =
        borrowRate * (exactCurrentUtil / 100) * (1 - reserveFactorValue);

      // Convert APR to APY for the current utilization point
      const borrowApy = convertFromAprToApy(borrowRate);
      const supplyApy = convertFromAprToApy(supplyRate);

      dataPoints.push({
        utilization: exactCurrentUtil,
        borrowApr: parseFloat(borrowRate.toFixed(2)),
        supplyApr: parseFloat(supplyRate.toFixed(2)),
        borrowRate: borrowApy,
        supplyRate: supplyApy,
      });
    }

    // Sort data points by utilization to ensure proper line drawing
    return dataPoints.sort((a, b) => a.utilization - b.utilization);
  }, [interestRateModel, reserveFactor, currentUtilization]);

  // Convert current utilization to number and ensure it's properly formatted
  const currentUtilizationValue = parseFloat(currentUtilization.toFixed(2));

  // Get optimal utilization for reference line
  const optimalUtilizationRate =
    parseFloat(interestRateModel.optimal_utilization_rate) * 100;

  return (
    <div className="h-80 bg-card/80 backdrop-blur-sm rounded-lg">
      <div className="px-4 pt-2 pb-0 flex justify-center">
        <div className="flex items-center gap-4 text-xs flex-wrap">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            <span>Borrow APY</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-amber-200 rounded-full mr-2"></span>
            <span>Borrow APR</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span>Supply APY</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-200 rounded-full mr-2"></span>
            <span>Supply APR</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={interestRateData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="utilization"
            label={{
              value: "Utilization Rate (%)",
              position: "insideBottom",
              offset: -10,
              style: { fontSize: 11 },
            }}
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 10 }}
            domain={[0, 100]}
            type="number"
            allowDecimals={false}
            tickCount={11} // Show ticks at 0%, 10%, 20%, etc.
          />
          <YAxis
            label={{
              value: "Interest Rate (%)",
              angle: -90,
              position: "insideLeft",
              offset: 0,
              style: { fontSize: 11 },
            }}
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 10 }}
            allowDecimals={true}
            tickCount={8}
            domain={[0, "auto"]}
          />
          <Tooltip
            content={<CustomTooltip />}
            isAnimationActive={false}
            cursor={{ stroke: "#666", strokeWidth: 1, strokeDasharray: "5 5" }}
          />

          {/* Current utilization reference line */}
          <ReferenceLine
            x={currentUtilizationValue}
            stroke="currentColor"
            className="text-black dark:text-white"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            ifOverflow="extendDomain"
            isFront={true}
            label={{
              value: `Current: ${currentUtilizationValue}%`,
              position: "top",
              fill: "currentColor",
              className: "text-black dark:text-white",
              style: {
                fontSize: 11,
                fontWeight: "bold",
              },
            }}
          />

          {/* Optimal utilization reference line */}
          <ReferenceLine
            x={optimalUtilizationRate}
            stroke="#8884d8"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            ifOverflow="extendDomain"
            isFront={true}
            label={{
              value: `Optimal: ${optimalUtilizationRate.toFixed(0)}%`,
              position: "top",
              fill: "#8884d8",
              style: {
                fontSize: 11,
                fontWeight: "bold",
              },
            }}
          />

          {/* APR Lines (lighter colors, slightly thinner) */}
          <Line
            type="monotone"
            dataKey="borrowApr"
            stroke="#FDE68A" // Much lighter amber
            name="Borrow APR"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 6, stroke: "#FDE68A", strokeWidth: 1 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="supplyApr"
            stroke="#A7F3D0" // Much lighter green
            name="Supply APR"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 6, stroke: "#A7F3D0", strokeWidth: 1 }}
            isAnimationActive={false}
          />

          {/* APY Lines (normal colors, thicker) */}
          <Line
            type="monotone"
            dataKey="borrowRate"
            stroke="#F59E0B"
            name="Borrow APY"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, stroke: "#F59E0B", strokeWidth: 1 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="supplyRate"
            stroke="#10B981"
            name="Supply APY"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 1 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
