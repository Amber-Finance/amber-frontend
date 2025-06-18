"use client";

import { FormattedValue } from "@/components/common";
import React from "react";

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  isCurrency = false,
  suffix = "",
  useCompactNotation = true,
}) => {
  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-6 sm:rounded-lg shadow">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {label}
      </div>
      <div className="text-2xl font-semibold">
        <FormattedValue
          value={value}
          isCurrency={isCurrency}
          suffix={suffix}
          useCompactNotation={useCompactNotation}
        />
      </div>
    </div>
  );
};

export default MetricCard;
