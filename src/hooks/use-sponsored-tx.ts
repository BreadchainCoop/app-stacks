import { clientEnv } from "@/lib/env";
import { getDefaultChainId } from "@/utils/chain";
import { useSendTransaction } from "@privy-io/react-auth";

export const useSponsoredTx = () => {
  const { sendTransaction } = useSendTransaction();

  const sendSponsoredTransaction: typeof sendTransaction = async (
    input,
    options
  ) => {
    return sendTransaction(
      { ...input, chainId: getDefaultChainId() },
      { ...options, sponsor: clientEnv.NEXT_PUBLIC_NODE_ENV === "production" }
    );
  };

  return { sendSponsoredTransaction };
};
