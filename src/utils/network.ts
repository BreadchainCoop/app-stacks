import { foundryChain } from "@/lib/wagmi";
import { getDefaultChainId } from "@/utils/chain";
import { gnosis, sepolia } from "viem/chains";

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
};

// The stored `explorerUrl` values already point at the `/address` path; strip it
// to recover the explorer origin so we can build both address and tx links.
const explorerBase = () => {
  const url =
    networks[getDefaultChainId() as keyof typeof networks]?.explorerUrl;
  return (url ?? "https://gnosisscan.io/address").replace(/\/address$/, "");
};

export const explorerAddressUrl = (address: string) =>
  `${explorerBase()}/address/${address}`;

export const explorerTxUrl = (txHash: string) =>
  `${explorerBase()}/tx/${txHash}`;
