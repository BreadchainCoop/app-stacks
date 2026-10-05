import { Address } from "viem";
import { useConfig } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { useActiveChainId } from "@/components/providers/active-chain";

export const useWaitForTxReceipt = () => {
  // Whichever config the mounted provider stack supplies — the Privy one on
  // the web build, the injected-wallet one inside MiniPay.
  const config = useConfig();
  const chainId = useActiveChainId();

  const waitForTxReceipt = async (hash: Address) => {
    return waitForTransactionReceipt(config, {
      hash,
      chainId,
    });
  };

  return { waitForTxReceipt };
};
