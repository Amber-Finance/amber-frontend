"use client";

import React from "react";

const InstanceHeader: React.FC = () => {
  return (
    <div className="mb-6 px-4 lg:px-0">
      <div className="mb-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Lend and Borrow Bitcoin Derivatives
        </h1>
      </div>

      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        This is the Bitcoin Outpost of the Mars Protocol. It is using audited
        Smart Contracts ensuring the highest security standard in Cosmos.
      </p>
    </div>
  );
};

export default InstanceHeader;
