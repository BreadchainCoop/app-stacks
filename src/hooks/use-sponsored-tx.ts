import { clientEnv } from "@/lib/env";
import { IS_E2E_WALLET } from "@/lib/e2e";
import { getDefaultChainId } from "@/utils/chain";
import { useSendTransaction } from "@privy-io/react-auth";
import { useSendTransaction as useWagmiSendTransaction } from "wagmi";
import { Address, Hex } from "viem";

export const useSponsoredTx = () => {
  const { sendTransaction } = useSendTransaction();
  const { sendTransactionAsync } = useWagmiSendTransaction();

  const sendSponsoredTransaction: typeof sendTransaction = async (
    input,
    options
  ) => {
    // Local E2E wallet: sign with the injected wallet through wagmi. There is
    // no gas sponsorship on anvil, so this is a plain transaction.
    if (IS_E2E_WALLET) {
      const hash = await sendTransactionAsync({
        to: input.to as Address,
        data: input.data as Hex | undefined,
        value: input.value === undefined ? undefined : BigInt(input.value),
        chainId: getDefaultChainId(),
      });

      return { hash };
    }

    return sendTransaction(
      { ...input, chainId: getDefaultChainId() },
      { ...options, sponsor: clientEnv.NEXT_PUBLIC_CHAIN_ID === 100 }
    );
  };

  return { sendSponsoredTransaction };
};
