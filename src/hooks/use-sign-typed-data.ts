import { useSignTypedData as usePrivySignTypedData } from "@privy-io/react-auth";
import { useSignTypedData as useWagmiSignTypedData } from "wagmi";
import { useIsEmbeddedWallet } from "./use-is-embedded-wallet";

/**
 * EIP-712 signing that works for both embedded and external wallets.
 *
 * Embedded wallets sign silently via Privy; external wallets sign through their
 * own UI (one prompt per signature — `showWalletUIs: false` cannot suppress it).
 * Drop-in replacement for Privy's `useSignTypedData` — same `{ signature }` shape.
 */
export const useSignTypedData = () => {
  const { signTypedData: signTypedDataPrivy } = usePrivySignTypedData();
  const { signTypedDataAsync } = useWagmiSignTypedData();
  const isEmbedded = useIsEmbeddedWallet();

  const signTypedData: typeof signTypedDataPrivy = async (input, options) => {
    if (isEmbedded) {
      return signTypedDataPrivy(input, options);
    }

    // External wallet: `options` (e.g. showWalletUIs) doesn't apply.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signature = await signTypedDataAsync(input as any);

    return { signature };
  };

  return { signTypedData };
};
