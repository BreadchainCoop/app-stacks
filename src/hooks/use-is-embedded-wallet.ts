import { usePrivy } from "@privy-io/react-auth";

// Privy embedded wallets report one of these as their walletClientType.
// Everything else (metamask, coinbase_wallet, rainbow, wallet_connect, ...) is
// an external wallet the user controls.
const EMBEDDED_WALLET_CLIENTS = ["privy", "privy-v2"];

/**
 * Whether the connected user is signing with a Privy embedded wallet.
 *
 * Embedded wallets support gas sponsorship and silent signing; external wallets
 * do not (the user pays gas and must confirm in their own wallet UI). Every
 * transaction/signing path in the app branches on this.
 */
export const useIsEmbeddedWallet = () => {
  const { user } = usePrivy();

  return EMBEDDED_WALLET_CLIENTS.includes(user?.wallet?.walletClientType ?? "");
};
