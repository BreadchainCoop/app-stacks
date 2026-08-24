import { clientEnv } from "@/lib/env";
import { isLocalMode } from "@/lib/network-mode";
import { getDefaultChainId } from "@/utils/chain";
import { useSendTransaction } from "@privy-io/react-auth";
import { sendTransaction as sendWagmiTransaction } from "@wagmi/core";
import { wagmiConfig } from "@/components/providers/web3";
import type { Address, Hex } from "viem";

export const useSponsoredTx = () => {
  const { sendTransaction } = useSendTransaction();

  const sendSponsoredTransaction: typeof sendTransaction = async (
    input,
    options
  ) => {
    if (isLocalMode()) {
      // No Privy in local mode: send through the mock connector, Anvil signs
      // with its unlocked account (no sponsorship on a local node).
      const hash = await sendWagmiTransaction(wagmiConfig, {
        to: input.to as Address,
        data: input.data as Hex | undefined,
        value: input.value != null ? BigInt(input.value) : undefined,
        chainId: getDefaultChainId(),
      });

      return { hash } as Awaited<ReturnType<typeof sendTransaction>>;
    }

    return sendTransaction(
      { ...input, chainId: getDefaultChainId() },
      {
        ...options,
        sponsor: clientEnv.NEXT_PUBLIC_CHAIN_ID === 100,
        uiOptions: { showWalletUIs: false, ...options?.uiOptions },
      }
    );
  };

  return { sendSponsoredTransaction };
};
