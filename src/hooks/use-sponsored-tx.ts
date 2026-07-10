import { TxSender, useTxSender } from "@/components/providers/tx-sender";
import { getDefaultChainId } from "@/utils/chain";

export const useSponsoredTx = () => {
  const sendTx = useTxSender();

  const sendSponsoredTransaction: TxSender = async (input, options) => {
    return sendTx({ ...input, chainId: getDefaultChainId() }, options);
  };

  return { sendSponsoredTransaction };
};
