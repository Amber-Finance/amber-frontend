import { BigNumber } from "bignumber.js";

/**
 * Handles numeric input changes with decimal validation and max amount enforcement
 * Returns the processed input value and raw amount
 *
 * @param value The input value from the input field
 * @param maxAmount The maximum allowed amount
 * @param decimals The number of decimals for the token
 * @returns Object containing the processed inputValue and amountRaw
 */
export const handleNumericInputChange = (
  value: string,
  maxAmount: BigNumber,
  decimals: number
): { inputValue: string; amountRaw: string } => {
  // Convert commas to decimal points for international number formats
  value = value.replace(",", ".");

  // Allow empty input
  if (value === "") {
    return { inputValue: "", amountRaw: "" };
  }

  // Handle the special case of just a decimal point
  if (value === ".") {
    return {
      inputValue: "0.",
      amountRaw: "0",
    };
  }

  // Allow only numbers and one decimal point
  // This regex allows:
  // - Optional digits before decimal (0 or more)
  // - Optional decimal point
  // - Optional digits after decimal (0 or more)
  if (!/^(\d*\.?\d*|\.\d*)$/.test(value)) {
    return { inputValue: "", amountRaw: "" };
  }

  // If the value is just "0" or begins with "0" but isn't a decimal (e.g. "01"),
  // normalize it to just "0" or "0." if it's the beginning of a decimal
  if (value === "0" || (value.startsWith("0") && !value.startsWith("0."))) {
    if (value === "0") {
      return { inputValue: "0", amountRaw: "0" };
    }
    // If user typed something like "01", normalize to "1"
    if (value.length > 1 && !value.includes(".")) {
      value = value.replace(/^0+/, "");
    }
  }

  // Limit input to maximum number of decimals
  const decimalPart = value.split(".")[1];
  if (decimalPart && decimalPart.length > decimals) {
    value = new BigNumber(value)
      .decimalPlaces(decimals, BigNumber.ROUND_DOWN)
      .toString();
  }

  // For values like ".1", convert to proper BigNumber format
  const valueForCalculation = value.startsWith(".") ? `0${value}` : value;

  // Convert to raw amount (with decimals)
  const rawAmount = new BigNumber(valueForCalculation)
    .shiftedBy(decimals)
    .toString();

  // If the raw amount exceeds the max amount, set to max
  if (maxAmount.gt(0) && new BigNumber(rawAmount).gt(maxAmount)) {
    const newValue = maxAmount
      .shiftedBy(-decimals)
      .decimalPlaces(decimals, BigNumber.ROUND_DOWN)
      .toString();
    return {
      inputValue: newValue,
      amountRaw: maxAmount.toString(),
    };
  }

  return {
    // For display in the input field, preserve what the user typed
    inputValue: value,
    // For calculations, use the normalized value
    amountRaw: rawAmount,
  };
};

/**
 * Formats a max amount to a displayable value
 *
 * @param maxAmount The maximum amount as a BigNumber
 * @param decimals The number of decimals for the token
 * @returns The formatted amount as a string
 */
export const formatMaxAmount = (
  maxAmount: BigNumber,
  decimals: number
): string => {
  return maxAmount
    .shiftedBy(-decimals)
    .decimalPlaces(decimals, BigNumber.ROUND_DOWN)
    .toString();
};
