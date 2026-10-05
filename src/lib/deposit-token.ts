import { formatUnits, parseUnits } from "viem";

// The deposit currency is per-chain (BREAD on Gnosis, USDT/USDC/USDm on Celo),
// so decimals are passed in rather than read from a module constant. In a
// component tree that's `useDepositToken().decimals`; in a pure helper, take
// it as a parameter rather than reaching for the active chain.
export const formatDepositAmount = (value: bigint, decimals: number): string =>
  formatUnits(value, decimals);

export const parseDepositAmount = (value: string, decimals: number): bigint =>
  parseUnits(value, decimals);
