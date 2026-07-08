import { Address } from "viem";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/components/providers/web3";
import { getDefaultChainId } from "@/utils/chain";

export const useWaitForTxReceipt = () => {
  const waitForTxReceipt = async (hash: Address) => {
    await waitForTransactionReceipt(wagmiConfig, {
      hash,
      chainId: getDefaultChainId(),
    });
  };

  return { waitForTxReceipt };
};
