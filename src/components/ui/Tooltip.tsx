"use client";

import React, { useEffect, useRef, useState } from "react";

interface TooltipProps {
  show: boolean;
  message: string;
  onDismiss?: () => void;
  duration?: number;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  show,
  message,
  onDismiss,
  duration = 2000,
  position = "top",
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // If the tooltip should be shown
    if (show) {
      setIsVisible(true);

      // Set a timeout to hide it after the specified duration
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
      }, duration);
    } else {
      setIsVisible(false);
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [show, duration, onDismiss]);

  if (!isVisible) return null;

  // Determine position-based classes
  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  return (
    <div
      className={`absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-black-800 rounded-md shadow-sm transition-opacity ${positionClasses[position]} ${className}`}
      role="tooltip"
    >
      {message}
      <div
        className={`tooltip-arrow absolute h-2 w-2 bg-gray-900 dark:bg-black-800 transform rotate-45 ${
          position === "top"
            ? "top-full -translate-y-1/2"
            : position === "bottom"
            ? "bottom-full translate-y-1/2"
            : position === "left"
            ? "left-full -translate-x-1/2"
            : "right-full translate-x-1/2"
        }`}
      />
    </div>
  );
};

export default Tooltip;
