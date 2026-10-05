import { TxSender, useTxSender } from "@/components/providers/tx-sender";
import { useActiveChainId } from "@/components/providers/active-chain";

export const useSponsoredTx = () => {
  const sendTx = useTxSender();
  const chainId = useActiveChainId();

  const sendSponsoredTransaction: TxSender = async (input, options) => {
    return sendTx({ ...input, chainId }, options);
  };

  return { sendSponsoredTransaction };
};
