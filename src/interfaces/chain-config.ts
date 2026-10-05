import { Address } from "viem";

export interface DepositTokenConfig {
  address: Address;
  symbol: string;
  decimals: number;
}

// Everything that varies per chain: the Saving Circles deployment and the
// deposit currency. Populated from NEXT_PUBLIC_CHAINS (src/lib/env.ts) and
// read through src/lib/chains.ts — never from clientEnv directly.
export interface ChainConfig {
  savingCircles: Address;
  savingCirclesViewer: Address;
  automaticSavingCircles: Address;
  // Goal savings is newer than the others, so a chain may not have it; the zero
  // address means "not deployed here". The `goalSavings` feature flag is
  // per-deployment rather than per-chain, so see the note in
  // src/lib/envs/chain-schema.ts before enabling it on a mixed deployment.
  goalSavings: Address;
  // Block the Saving Circles proxy was deployed at: the floor for event scans.
  contractCreationBlock: bigint;
  depositToken: DepositTokenConfig;
}
