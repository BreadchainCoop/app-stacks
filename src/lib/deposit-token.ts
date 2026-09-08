import { Address, formatUnits, parseUnits } from "viem";
import { clientEnv } from "./env";

// The deposit currency for this deployment: BREAD on Gnosis (18 decimals),
// USDT/USDC/USDm on Celo (6/6/18 decimals). The address stays in
// NEXT_PUBLIC_BREAD_TOKEN_ADDRESS so the existing `make deploy` env flow
// keeps working; symbol and decimals come from their own env vars.
export const DEPOSIT_TOKEN = {
  address: clientEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS as Address,
  symbol: clientEnv.NEXT_PUBLIC_DEPOSIT_TOKEN_SYMBOL,
  decimals: clientEnv.NEXT_PUBLIC_DEPOSIT_TOKEN_DECIMALS,
} as const;

export const formatDepositAmount = (value: bigint): string =>
  formatUnits(value, DEPOSIT_TOKEN.decimals);

export const parseDepositAmount = (value: string): bigint =>
  parseUnits(value, DEPOSIT_TOKEN.decimals);
