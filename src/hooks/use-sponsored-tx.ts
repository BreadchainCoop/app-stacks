import { clientEnv } from "@/lib/env";
import { getDefaultChainId } from "@/utils/chain";
import { useSendTransaction } from "@privy-io/react-auth";
import { useConnectedUser } from "@breadcoop/ui";

export const useSponsoredTx = () => {
  const { sendTransaction } = useSendTransaction();
  const { user } = useConnectedUser();
  const connectedAddress =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;

  const sendSponsoredTransaction: typeof sendTransaction = async (
    input,
    options
  ) => {
    return sendTransaction(
      { ...input, chainId: getDefaultChainId() },
      {
        // Privy's own default (when address is omitted) doesn't necessarily
        // match whichever wallet is actually connected via wagmi/RainbowKit —
        // default to it here so every caller gets this right without having
        // to pass it explicitly. Callers that must sign from a specific,
        // different wallet (e.g. an embedded wallet acting as msg.sender)
        // still override it via options.address.
        address: connectedAddress,
        ...options,
        sponsor: clientEnv.NEXT_PUBLIC_CHAIN_ID === 100,
        uiOptions: { showWalletUIs: false, ...options?.uiOptions },
      }
    );
  };

  return { sendSponsoredTransaction };
};
