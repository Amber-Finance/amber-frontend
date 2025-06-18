import FormattedValueStatic from "@/components/ui/FormattedValueStatic";
import React from "react";

interface TokenBalanceStaticProps {
  tokenAmount: string;
  usdValue?: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "right" | "center";
  className?: string;
}

/**
 * TokenBalanceStatic component is a server component that displays a token amount
 * with its USD value underneath.
 *
 * Unlike the client TokenBalance component, this requires pre-calculated values
 * and doesn't access the store or perform calculations.
 */
const TokenBalanceStatic: React.FC<TokenBalanceStaticProps> = ({
  tokenAmount,
  usdValue,
  size = "md",
  align = "right",
  className = "",
}) => {
  // Set font sizes based on size prop
  const amountTextSize =
    size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base";

  const valueTextSize =
    size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  // Set alignment classes
  const alignmentClass =
    align === "left"
      ? "text-left"
      : align === "center"
      ? "text-center"
      : "text-right";

  // Only show USD value if it's provided and not zero
  const showUsdValue = usdValue && usdValue !== "0";

  return (
    <div className={`${alignmentClass} ${className}`}>
      <div
        className={`${amountTextSize} text-gray-900 dark:text-white font-medium`}
      >
        <FormattedValueStatic value={tokenAmount} isCurrency={false} />
      </div>
      {showUsdValue && (
        <div
          className={`${valueTextSize} text-gray-500 dark:text-gray-400 opacity-50`}
        >
          <FormattedValueStatic value={usdValue} isCurrency={true} />
        </div>
      )}
    </div>
  );
};

export default TokenBalanceStatic;
