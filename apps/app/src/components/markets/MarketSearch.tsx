"use client";

import React from "react";

interface MarketSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const MarketSearch: React.FC<MarketSearchProps> = ({
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="relative">
        <input
          type="text"
          placeholder="Search asset name, symbol, or address"
          className="w-full px-10 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MarketSearch;
