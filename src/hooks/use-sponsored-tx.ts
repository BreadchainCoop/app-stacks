import { clientEnv } from "@/lib/env";
import { getDefaultChainId } from "@/utils/chain";
import { useSendTransaction as usePrivySendTransaction } from "@privy-io/react-auth";
import {
  useChainId,
  useSendTransaction as useWagmiSendTransaction,
  useSwitchChain,
} from "wagmi";
import { useIsEmbeddedWallet } from "./use-is-embedded-wallet";

export const useSponsoredTx = () => {
  const { sendTransaction } = usePrivySendTransaction();
  const { sendTransactionAsync } = useWagmiSendTransaction();
  const { switchChainAsync } = useSwitchChain();
  const currentChainId = useChainId();
  const isEmbedded = useIsEmbeddedWallet();

  const sendSponsoredTransaction: typeof sendTransaction = async (
    input,
    options
  ) => {
    const chainId = getDefaultChainId();

    if (isEmbedded) {
      return sendTransaction(
        { ...input, chainId },
        { ...options, sponsor: clientEnv.NEXT_PUBLIC_CHAIN_ID === 100 }
      );
    }

    if (currentChainId !== chainId) {
      await switchChainAsync({ chainId });
    }

    const hash = await sendTransactionAsync({
      to: input.to as `0x${string}` | undefined,
      data: input.data as `0x${string}` | undefined,
      value: input.value as bigint | undefined,
      chainId,
    });

    return { hash };
  };

  return { sendSponsoredTransaction };
};
