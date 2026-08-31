import { clientEnv } from "@/lib/env";
import { networks } from "./network";

export const getDefaultChainId = () => clientEnv.NEXT_PUBLIC_CHAIN_ID;

// Computed lazily (not at module top level) since `./network` imports back
// from this module — evaluating `networks[...]` at import time can run
// before `network.ts` has finished initializing.
export const getDefaultChainDetail = () =>
  networks[clientEnv.NEXT_PUBLIC_CHAIN_ID as keyof typeof networks].chain;
