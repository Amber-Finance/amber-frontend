"use client";

import { FormattedValue } from "@/components/common";
import React from "react";

const MetricRow: React.FC<MetricRowProps> = ({
  label,
  value,
  isCurrency = false,
  suffix = "",
  valueClassName = "",
  maxDecimals,
  useCompactNotation = true,
}) => {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className={`text-sm ${valueClassName}`}>
        <FormattedValue
          value={value}
          isCurrency={isCurrency}
          suffix={suffix}
          maxDecimals={maxDecimals}
          useCompactNotation={useCompactNotation}
        />
      </span>
    </div>
  );
};

export default MetricRow;
