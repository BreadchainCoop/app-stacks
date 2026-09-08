import { Address } from "viem";
import { useConfig } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { getDefaultChainId } from "@/utils/chain";

export const useWaitForTxReceipt = () => {
  // Whichever config the mounted provider stack supplies — the Privy one on
  // the web build, the injected-wallet one inside MiniPay.
  const config = useConfig();

  const waitForTxReceipt = async (hash: Address) => {
    await waitForTransactionReceipt(config, {
      hash,
      chainId: getDefaultChainId(),
    });
  };

  return { waitForTxReceipt };
};
