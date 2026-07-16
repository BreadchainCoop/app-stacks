import { foundryChain } from "@/lib/wagmi";
import { celo, celoSepolia, gnosis, sepolia } from "viem/chains";

export const networks = {
  11155111: {
    explorerUrl: "https://sepolia.etherscan.io/address",
    chain: sepolia,
  },
  31337: {
    explorerUrl: "https://gnosisscan.io/address",
    chain: foundryChain,
  },
  100: {
    explorerUrl: "https://gnosisscan.io/address",
    chain: gnosis,
  },
  42220: {
    explorerUrl: "https://celoscan.io/address",
    chain: celo,
  },
  11142220: {
    explorerUrl: "https://celo-sepolia.blockscout.com/address",
    chain: celoSepolia,
  },
};
