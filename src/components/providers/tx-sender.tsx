"use client";

import { createContext, ReactNode, useCallback, useContext } from "react";
import { useSendTransaction } from "@privy-io/react-auth";
import { useConnectedUser } from "@breadcoop/ui";
import { useActiveChainId } from "./active-chain";
import { useEmbeddedWalletAddress } from "@/hooks/use-linked-external-wallet";

// The transaction sender for the mounted provider stack. Contract writes all
// funnel through useSponsoredTx -> this context, so the Privy stack (embedded
// wallet, Gnosis gas sponsorship) and the MiniPay stack (injected wallet,
// CIP-64 stablecoin gas) each plug in their own sender without the tx hooks
// having to know which stack is mounted.
export type TxSender = (
  input: Parameters<
    ReturnType<typeof useSendTransaction>["sendTransaction"]
  >[0],
  options?: Parameters<
    ReturnType<typeof useSendTransaction>["sendTransaction"]
  >[1]
) => Promise<{ hash: `0x${string}` }>;

const TxSenderContext = createContext<TxSender | null>(null);

export const TxSenderProvider = TxSenderContext.Provider;

export const useTxSender = (): TxSender => {
  const sender = useContext(TxSenderContext);

  if (!sender) {
    throw new Error("useTxSender must be used within a provider stack");
  }

  return sender;
};

/** Privy stack: embedded-wallet send, sponsored on Gnosis. */
export const PrivyTxSenderProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { sendTransaction } = useSendTransaction();
  const { user } = useConnectedUser();
  const connectedAddress =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;

  const chainId = useActiveChainId();
  const embeddedAddress = useEmbeddedWalletAddress();

  const sender = useCallback<TxSender>(
    (input, options) => {
      const signer = options?.address ?? connectedAddress;

      const isEmbeddedSigner =
        Boolean(signer) &&
        signer?.toLowerCase() === embeddedAddress?.toLowerCase();

      return sendTransaction(input, {
        address: connectedAddress,
        ...options,
        sponsor: chainId === 100 && isEmbeddedSigner,
        uiOptions: { showWalletUIs: false, ...options?.uiOptions },
      });
    },
    [sendTransaction, connectedAddress, embeddedAddress, chainId]
  );

  return <TxSenderProvider value={sender}>{children}</TxSenderProvider>;
};
