import { Address } from "viem";
import { useConfig } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { useActiveChainId } from "@/components/providers/active-chain";
import { waitForReadConsistency } from "@/utils/wait-for-read-consistency";

export const useWaitForTxReceipt = () => {
  // Whichever config the mounted provider stack supplies — the Privy one on
  // the web build, the injected-wallet one inside MiniPay.
  const config = useConfig();
  const chainId = useActiveChainId();

  const waitForTxReceipt = async (hash: Address) => {
    const receipt = await waitForTransactionReceipt(config, {
      hash,
      chainId,
    });

    // Having a receipt does not mean the node serving reads has applied that
    // block yet. Every caller invalidates the query cache straight after this
    // resolves, so returning early is what made those refetches read
    // pre-transaction state.
    await waitForReadConsistency(config, chainId, receipt.blockNumber);

    return receipt;
  };

  return { waitForTxReceipt };
};
