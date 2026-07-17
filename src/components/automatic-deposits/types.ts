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
}
