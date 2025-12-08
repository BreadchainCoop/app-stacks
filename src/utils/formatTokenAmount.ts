import { formatUnits } from "viem";

/**
 * Formats a bigint amount to a regular base 10 number string using viem's formatUnits
 * @param amount - The amount as bigint
 * @param decimals - Number of decimal places (defaults to 18 for most tokens)
 * @returns Formatted amount as a string
 */
export function formatTokenAmount(
  amount: bigint,
  decimals: number = 18
): string {
  return formatUnits(amount, decimals);
}
