import { Address } from "viem";

export interface AutomaticDepositsModalState {
  type: "AUTOMATIC_DEPOSITS";
  stackId: string;
  currentValue: boolean;
  depositAmount: bigint;
  remainingRounds: number;
  depositInterval: bigint;
  tokenAddress: Address;
  address: Address;
  balance: bigint;
  /** Skip the intro when the caller has already made the pitch. */
  startAtSummary?: boolean;
}
