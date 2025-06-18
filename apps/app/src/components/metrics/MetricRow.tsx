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
    <div className="flex justify-between items-center py-2 border-b">
      <span className="text-sm text-muted-foreground">{label}</span>
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
