import React from "react";

interface SortIndicatorProps {
  column: string;
  currentSortColumn: string;
  sortDirection: "asc" | "desc";
}

/**
 * SortIndicator component that displays up/down arrows to indicate sort direction
 */
const SortIndicator: React.FC<SortIndicatorProps> = ({
  column,
  currentSortColumn,
  sortDirection,
}) => {
  const isActive = column === currentSortColumn;

  return (
    <div className="inline-flex flex-col ml-1 h-3">
      <svg
        width="8"
        height="4"
        viewBox="0 0 8 4"
        fill="none"
        className={`${
          isActive && sortDirection === "asc"
            ? "text-gray-900 dark:text-white"
            : "text-gray-400 dark:text-gray-600"
        } mb-0.5`}
      >
        <path d="M4 0L8 4H0L4 0Z" fill="currentColor" />
      </svg>
      <svg
        width="8"
        height="4"
        viewBox="0 0 8 4"
        fill="none"
        className={`${
          isActive && sortDirection === "desc"
            ? "text-gray-900 dark:text-white"
            : "text-gray-400 dark:text-gray-600"
        }`}
      >
        <path d="M4 4L0 0H8L4 4Z" fill="currentColor" />
      </svg>
    </div>
  );
};

export default SortIndicator;
