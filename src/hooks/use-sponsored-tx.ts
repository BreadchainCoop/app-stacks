import { clientEnv } from "@/lib/env";
import { getDefaultChainId } from "@/utils/chain";
import { useSendTransaction } from "@privy-io/react-auth";

export const useSponsoredTx = () => {
  const { sendTransaction } = useSendTransaction();
  const shouldSponsor = clientEnv.NEXT_PUBLIC_TARGET_NETWORK === "gnosis";

  const sendSponsoredTransaction: typeof sendTransaction = async (
    input,
    options
  ) => {
    return sendTransaction(
      { ...input, chainId: getDefaultChainId() },
      {
        ...options,
        sponsor: shouldSponsor,
      }
    );
  };

  return { sendSponsoredTransaction };
};
