import { clientEnv } from "@/lib/env";
import { foundryChain } from "@/lib/wagmi";
import { gnosis, sepolia } from "viem/chains";

const CHAIN_BY_NETWORK = {
  local: foundryChain,
  gnosis,
  sepolia,
} as const;

const APP_NETWORK = clientEnv.NEXT_PUBLIC_TARGET_NETWORK;

export const getDefaultChainDetail = () => CHAIN_BY_NETWORK[APP_NETWORK];

export const getDefaultChainId = () => getDefaultChainDetail().id;
