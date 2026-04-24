import { clientEnv } from "@/lib/env";
import { networks } from "./network";

const network =
  networks[clientEnv.NEXT_PUBLIC_CHAIN_ID as keyof typeof networks];

export const getDefaultChainId = () => clientEnv.NEXT_PUBLIC_CHAIN_ID;

export const getDefaultChainDetail = () => network.chain;
