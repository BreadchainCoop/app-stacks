import { clientEnv } from "@/lib/env";
import { isLocalMode } from "@/lib/network-mode";
import { foundryChain } from "@/lib/wagmi";
import { networks } from "./network";

const local = isLocalMode();

const network =
  networks[clientEnv.NEXT_PUBLIC_CHAIN_ID as keyof typeof networks];

export const getDefaultChainId = () =>
  local ? foundryChain.id : clientEnv.NEXT_PUBLIC_CHAIN_ID;

export const getDefaultChainDetail = () =>
  local ? foundryChain : network.chain;
