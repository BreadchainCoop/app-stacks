"use client";

import { createContext, ReactNode, useCallback, useContext } from "react";
import { useSendTransaction } from "@privy-io/react-auth";
import { clientEnv } from "@/lib/env";

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

  const sender = useCallback<TxSender>(
    (input, options) =>
      sendTransaction(input, {
        ...options,
        sponsor: clientEnv.NEXT_PUBLIC_CHAIN_ID === 100,
      }),
    [sendTransaction]
  );

  return <TxSenderProvider value={sender}>{children}</TxSenderProvider>;
};
