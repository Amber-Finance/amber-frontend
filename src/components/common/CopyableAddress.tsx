"use client";

import Tooltip from "@/components/ui/Tooltip";
import { formatAddress } from "@/utils/address";
import { copyToClipboard } from "@/utils/clipboard";
import React, { useState } from "react";

interface CopyableAddressProps {
  address: string;
  /**
   * Display format of the address
   * - full: shows the entire address
   * - truncated: shows beginning and end with ellipsis
   * - custom: uses the displayAddress prop
   */
  displayFormat?: "full" | "truncated" | "custom";
  /** Custom address display (used with displayFormat="custom") */
  displayAddress?: string;
  /** CSS class name */
  className?: string;
}

const CopyableAddress: React.FC<CopyableAddressProps> = ({
  address,
  displayFormat = "truncated",
  displayAddress,
  className = "",
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCopyClick = async () => {
    const success = await copyToClipboard(address);
    if (success) {
      setShowTooltip(true);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleCopyClick}
        className={`font-mono text-orange-500 hover:text-orange-600 transition-colors cursor-pointer ${className}`}
      >
        {formatAddress(address, displayFormat, displayAddress)}
      </button>
      <Tooltip
        show={showTooltip}
        message="Copied to clipboard"
        onDismiss={() => setShowTooltip(false)}
        position="top"
      />
    </div>
  );
};

export default CopyableAddress;
