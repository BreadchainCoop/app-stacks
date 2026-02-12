import { clientEnv } from "@/lib/env";
import { foundryChain } from "@/lib/wagmi";
import { gnosis } from "viem/chains";

export const getDefaultChainId = () =>
  clientEnv.NEXT_PUBLIC_NODE_ENV === "local" ? foundryChain.id : gnosis.id;

export const getDefaultChainDetail = () =>
  clientEnv.NEXT_PUBLIC_NODE_ENV === "local" ? foundryChain : gnosis;
