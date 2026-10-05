import { ChainConfig } from "@/interfaces/chain-config";
import { clientEnv } from "./env";

// Every chain this deployment can serve, keyed by chain id. Zod has already
// validated the shape and narrowed the block number to bigint
// (NEXT_PUBLIC_CHAINS in ./env), so the only thing the cast adds is `Address`
// on the strings it regex-checked.
export const CHAINS = Object.fromEntries(
  Object.entries(clientEnv.NEXT_PUBLIC_CHAINS).map(([id, config]) => [
    Number(id),
    config,
  ])
) as Record<number, ChainConfig>;

const configuredChainIds = Object.keys(CHAINS).join(", ");

export const getChainConfig = (chainId: number): ChainConfig => {
  const config = CHAINS[chainId];

  if (!config) {
    throw new Error(
      `No chain config for chain ${chainId} (configured: ${configuredChainIds})`
    );
  }

  return config;
};
