import { createPublicClient, fallback, http } from "viem";
import { serverEnv } from "@/lib/envs/server";
import { networks } from "@/utils/network";

const SEPOLIA_CHAIN_ID = 11155111;

export const getServerPublicClient = () => {
  const chain =
    networks[serverEnv.NEXT_PUBLIC_CHAIN_ID as keyof typeof networks].chain;

  const transport =
    chain.id === SEPOLIA_CHAIN_ID
      ? fallback([http(serverEnv.SEPOLIA_RPC_URL), http()])
      : http();

  return createPublicClient({ chain, transport });
};
