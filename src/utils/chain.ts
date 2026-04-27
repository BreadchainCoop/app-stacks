import { clientEnv } from "@/lib/env";
// import { foundryChain } from "@/lib/wagmi";
// import { gnosis } from "viem/chains";
import { networks } from "./network";

// export const getDefaultChainId = () =>
//   clientEnv.NEXT_PUBLIC_NODE_ENV === "local" ? foundryChain.id : gnosis.id;

const network =
  networks[clientEnv.NEXT_PUBLIC_CHAIN_ID as keyof typeof networks];

export const getDefaultChainId = () => clientEnv.NEXT_PUBLIC_CHAIN_ID;

// export const getDefaultChainDetail = () =>
//   clientEnv.NEXT_PUBLIC_NODE_ENV === "local" ? foundryChain : gnosis;
export const getDefaultChainDetail = () => network.chain;
