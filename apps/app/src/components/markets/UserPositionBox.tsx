"use client";

import TokenBalance from "@/components/common/TokenBalance";
import UnifiedAssetModal, {
  AssetActionType,
} from "@/components/modals/UnifiedAssetModal";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/store/useStore";
import React, { useMemo, useState } from "react";

interface UserPositionBoxProps {
  title: string;
  borderClassName: string;
  denom: string;
  primaryAction: AssetActionType;
}

const UserPositionBox: React.FC<UserPositionBoxProps> = ({
  title,
  borderClassName,
  denom,
  primaryAction,
}) => {
  // Local state for modal management - defined before any conditionals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] =
    useState<AssetActionType>(primaryAction);
  const markets = useStore((s) => s.markets);

  const market = useMemo(() => {
    return markets?.find((m) => m.asset.denom === denom);
  }, [markets, denom]);

  // Early return check after hooks are defined
  if (!market || !market.asset) return null;

  // Determine if this is a supply or borrow position box
  const isSupply = primaryAction === "supply";

  // Get the user position amount based on whether it's a supply or borrow position
  const positionAmount = isSupply ? market.deposit || "0" : market.debt || "0";

  // Determine if there is an existing position (user has supplied or borrowed)
  const hasPosition = parseFloat(positionAmount) > 0;

  // Determine the secondary action based on the primary action and if there's a position
  const secondaryAction: AssetActionType = isSupply ? "withdraw" : "repay";

  // Configure button properties for the actions
  const buttonConfig = {
    primary: {
      label: primaryAction.charAt(0).toUpperCase() + primaryAction.slice(1),
      action: primaryAction,
      color: isSupply ? "green" : "yellow",
    },
    secondary: {
      label: secondaryAction.charAt(0).toUpperCase() + secondaryAction.slice(1),
      action: secondaryAction,
      show: hasPosition,
    },
  };

  // Function to handle opening the modal
  const handleOpenModal = (action: AssetActionType) => {
    setModalAction(action);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        className={`bg-white dark:bg-zinc-800 rounded-lg p-3 sm:p-4 border-l-4 ${borderClassName}`}
      >
        <h3 className="text-lg font-semibold mb-3 sm:mb-4">{title}</h3>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {`Your ${
                title.toLowerCase().includes("supply") ? "supplied" : "borrowed"
              } ${market.asset.symbol}`}
            </span>
            <span className="text-sm">
              <TokenBalance
                coin={{
                  amount: positionAmount,
                  denom: market.asset.denom,
                }}
              />
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2 mt-4">
          <Button
            onClick={() => handleOpenModal(buttonConfig.primary.action)}
            className="flex-1"
            variant={isSupply ? "secondary" : "default"}
          >
            {buttonConfig.primary.label}
          </Button>
          {buttonConfig.secondary.show && (
            <Button
              onClick={() => handleOpenModal(buttonConfig.secondary.action)}
              className="flex-1"
              variant={isSupply ? "secondary" : "default"}
            >
              {buttonConfig.secondary.label}
            </Button>
          )}
        </div>
      </div>

      {/* Modal for asset actions */}
      <UnifiedAssetModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        market={market}
        actionType={modalAction}
      />
    </>
  );
};

export default UserPositionBox;
