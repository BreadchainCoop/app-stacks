import { usePrivy, WalletWithMetadata } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { Address } from "viem";

const isEmbeddedWallet = (walletClientType: string | undefined) =>
  walletClientType === "privy" ||
  walletClientType === "privy-v2" ||
  walletClientType === "embedded_wallet" ||
  Boolean(walletClientType?.includes("embedded"));

/** The user's Privy embedded wallet, if they have one. */
export const useEmbeddedWalletAddress = () => {
  const { user } = usePrivy();

  const embedded = user?.linkedAccounts.find(
    (account): account is WalletWithMetadata =>
      account.type === "wallet" && isEmbeddedWallet(account.walletClientType)
  );

  return embedded?.address as Address | undefined;
};

/**
 * The user's actively connected external wallet (e.g. MetaMask via
 * RainbowKit). Read from wagmi rather than Privy's linkedAccounts — this app
 * never calls Privy's own wallet-linking flow, so an external wallet only
 * ever shows up as the active wagmi connection, the same way
 * withdraw-bread.tsx's "Use connected" button resolves it.
 *
 * @privy-io/wagmi auto-connects the embedded wallet as a wagmi connector too,
 * so a plain `isConnected` check is true even with no external wallet at
 * all — only treat it as external when the address actually differs from
 * the embedded wallet's.
 */
export const useLinkedExternalWallet = () => {
  const { address, isConnected } = useAccount();
  const embeddedAddress = useEmbeddedWalletAddress();

  if (!isConnected || !address) return undefined;
  if (embeddedAddress?.toLowerCase() === address.toLowerCase()) {
    return undefined;
  }

  return address;
};
