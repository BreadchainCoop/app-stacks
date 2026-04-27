import { clientEnv } from "@/lib/env";
import { Address, Chain, defineChain } from "viem";
import { foundryChain } from "@/lib/wagmi";
import { gnosis, sepolia } from "viem/chains";

export type AppTargetNetwork = "gnosis" | "sepolia" | "local";

const HARD_CODED_SEPOLIA_BREAD_TOKEN_ADDRESS =
  "0x30142762922fa1594eA0b9e2e9a3b167F5FF31B0";

function withRpcOverride(chain: Chain, rpcUrl?: string): Chain {
  if (!rpcUrl) return chain;

  return defineChain({
    ...chain,
    rpcUrls: {
      default: {
        http: [rpcUrl],
      },
      public: {
        http: [rpcUrl],
      },
    },
  });
}

function valueOrFallback(value: string | undefined, fallback: string) {
  return value && value.trim().length > 0 ? value : fallback;
}

const targetNetwork = clientEnv.NEXT_PUBLIC_TARGET_NETWORK as AppTargetNetwork;

const localChain = withRpcOverride(
  foundryChain,
  clientEnv.NEXT_PUBLIC_LOCAL_RPC_URL
);
const gnosisChain = withRpcOverride(
  gnosis,
  clientEnv.NEXT_PUBLIC_GNOSIS_RPC_URL
);
const sepoliaChain = withRpcOverride(
  sepolia,
  clientEnv.NEXT_PUBLIC_SEPOLIA_RPC_URL
);

const networks = {
  gnosis: {
    chain: gnosisChain,
    explorerAddressUrl: "https://gnosisscan.io/address",
    savingCirclesAddress: valueOrFallback(
      clientEnv.NEXT_PUBLIC_GNOSIS_SAVING_CIRCLES_CONTRACT_ADDRESS,
      clientEnv.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS
    ),
    savingCirclesViewerAddress: valueOrFallback(
      clientEnv.NEXT_PUBLIC_GNOSIS_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
      clientEnv.NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS
    ),
    breadTokenAddress: valueOrFallback(
      clientEnv.NEXT_PUBLIC_GNOSIS_BREAD_TOKEN_ADDRESS,
      clientEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS
    ),
    savingCirclesCreationBlock: valueOrFallback(
      clientEnv.NEXT_PUBLIC_GNOSIS_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK,
      clientEnv.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK
    ),
  },
  sepolia: {
    chain: sepoliaChain,
    explorerAddressUrl: "https://sepolia.etherscan.io/address",
    savingCirclesAddress:
      clientEnv.NEXT_PUBLIC_SEPOLIA_SAVING_CIRCLES_CONTRACT_ADDRESS ?? "",
    savingCirclesViewerAddress:
      clientEnv.NEXT_PUBLIC_SEPOLIA_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS ??
      "",
    breadTokenAddress: valueOrFallback(
      clientEnv.NEXT_PUBLIC_SEPOLIA_BREAD_TOKEN_ADDRESS,
      HARD_CODED_SEPOLIA_BREAD_TOKEN_ADDRESS
    ),
    savingCirclesCreationBlock:
      clientEnv.NEXT_PUBLIC_SEPOLIA_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK ??
      "",
  },
  local: {
    chain: localChain,
    explorerAddressUrl: "",
    savingCirclesAddress: valueOrFallback(
      clientEnv.NEXT_PUBLIC_LOCAL_SAVING_CIRCLES_CONTRACT_ADDRESS,
      clientEnv.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS
    ),
    savingCirclesViewerAddress: valueOrFallback(
      clientEnv.NEXT_PUBLIC_LOCAL_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
      clientEnv.NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS
    ),
    breadTokenAddress: valueOrFallback(
      clientEnv.NEXT_PUBLIC_LOCAL_BREAD_TOKEN_ADDRESS,
      clientEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS
    ),
    savingCirclesCreationBlock: valueOrFallback(
      clientEnv.NEXT_PUBLIC_LOCAL_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK,
      clientEnv.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK
    ),
  },
} as const;

export const activeNetwork = networks[targetNetwork];
export const activeTargetNetwork = targetNetwork;
export const activeChain = activeNetwork.chain;
export const activeChainId = activeChain.id;
export const activeExplorerAddressUrl = activeNetwork.explorerAddressUrl;
export const activeSavingCirclesContractAddress =
  activeNetwork.savingCirclesAddress as Address;
export const activeSavingCirclesViewerContractAddress =
  activeNetwork.savingCirclesViewerAddress as Address;
export const activeBreadTokenAddress =
  activeNetwork.breadTokenAddress as Address;
export const activeSavingCirclesCreationBlock =
  activeNetwork.savingCirclesCreationBlock;
