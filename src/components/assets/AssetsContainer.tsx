"use client";

import React from "react";

interface Props {
  title: string;
  children: React.ReactNode;
}

const AssetsContainer: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="mb-6 overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-transparent shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between p-4 px-6 border-b border-gray-200 dark:border-zinc-800">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>

      <div className="px-6">{children}</div>
    </div>
  );
};

export default AssetsContainer;
