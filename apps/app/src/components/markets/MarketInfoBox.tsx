"use client";

import React, { ReactNode } from "react";

interface MarketInfoBoxProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const MarketInfoBox: React.FC<MarketInfoBoxProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <div
      className={`bg-white dark:bg-zinc-800 rounded-lg p-3 sm:p-4 mb-4 ${className}`}
    >
      <h3 className="text-lg font-semibold mb-3 sm:mb-4 flex items-center">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
};

export default MarketInfoBox;
