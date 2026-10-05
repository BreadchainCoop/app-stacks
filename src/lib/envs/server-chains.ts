import { ChainConfig } from "@/interfaces/chain-config";
import { serverEnv } from "./server";

// Server-side twin of src/lib/chains.ts. Kept separate because that module
// reads `clientEnv`, which is a "use client" module — importing it into a route
// handler would hand back a client reference rather than the parsed value.
const CHAINS = Object.fromEntries(
  Object.entries(serverEnv.NEXT_PUBLIC_CHAINS).map(([id, config]) => [
    Number(id),
    config,
  ])
) as Record<number, ChainConfig>;

const configuredChainIds = Object.keys(CHAINS).join(", ");

/**
 * Resolve a chain id that arrived on a request.
 *
 * Route handlers must pass the result of this to *both* their on-chain
 * authorization check and their database query. A client may name any
 * configured chain — that is safe only because ownership is then verified on
 * that same chain. Checking one chain and reading another would let a caller
 * who owns circle N on chain A read chain B's rows for circle N.
 */
export const resolveChainId = (raw: unknown): number | null => {
  const chainId =
    typeof raw === "number"
      ? raw
      : typeof raw === "string" && /^\d+$/.test(raw)
        ? Number(raw)
        : null;

  if (chainId === null) return null;

  return chainId in CHAINS ? chainId : null;
};

export const getServerChainConfig = (chainId: number): ChainConfig => {
  const config = CHAINS[chainId];

  if (!config) {
    throw new Error(
      `No chain config for chain ${chainId} (configured: ${configuredChainIds})`
    );
  }

  return config;
};
