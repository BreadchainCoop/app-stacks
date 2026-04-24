import { activeBreadTokenAddress, activeChainId } from "@/lib/network";
import { clientEnv } from "@/lib/env";
import {
  getEmbeddedConnectedWallet,
  useCreateWallet,
  useFundWallet,
  usePrivy,
  useWallets,
} from "@privy-io/react-auth";
import { usePostNativeFundingBake } from "./use-post-native-funding-bake";
import { useState } from "react";
import { Address, getAddress, isAddress } from "viem";
import { useBalance } from "wagmi";

const SUPPORTED_CHAIN_IDS = [100, 11155111] as const;
const APP_CHAIN_ID = activeChainId;
const IS_SUPPORTED_CHAIN_ID = SUPPORTED_CHAIN_IDS.includes(
  APP_CHAIN_ID as (typeof SUPPORTED_CHAIN_IDS)[number]
);
const BREAD_TOKEN_ADDRESS = activeBreadTokenAddress as Address;
const ZERO = BigInt(0);
const IS_DEBUG_ENV =
  clientEnv.NEXT_PUBLIC_NODE_ENV === "development" ||
  clientEnv.NEXT_PUBLIC_NODE_ENV === "local";

function hasPositiveBalance(value?: bigint) {
  return (value ?? ZERO) > ZERO;
}

function debugInfo(message: string, data?: unknown) {
  if (!IS_DEBUG_ENV) return;
  console.info(message, data);
}

function debugWarn(message: string, data?: unknown) {
  if (!IS_DEBUG_ENV) return;
  console.warn(message, data);
}

function normalizeAddress(value: unknown): Address | undefined {
  if (typeof value !== "string") return undefined;
  if (!isAddress(value, { strict: false })) return undefined;
  return getAddress(value);
}

type LinkedWalletInfo = {
  chainType?: string;
  walletClientType?: string;
  connectorType?: string;
  address?: Address;
};

function isEvmLinkedWallet(chainType?: string) {
  if (!chainType) return true;
  return chainType === "ethereum" || chainType === "evm";
}

function getLinkedWalletInfo(account: unknown): LinkedWalletInfo | undefined {
  if (!account || typeof account !== "object") return undefined;

  const maybe = account as Record<string, unknown>;
  if (maybe.type !== "wallet") return undefined;

  const chainTypeRaw = maybe.chainType ?? maybe.chain_type;
  const walletClientTypeRaw =
    maybe.walletClientType ?? maybe.wallet_client_type;
  const connectorTypeRaw = maybe.connectorType ?? maybe.connector_type;

  return {
    chainType: typeof chainTypeRaw === "string" ? chainTypeRaw : undefined,
    walletClientType:
      typeof walletClientTypeRaw === "string" ? walletClientTypeRaw : undefined,
    connectorType:
      typeof connectorTypeRaw === "string" ? connectorTypeRaw : undefined,
    address: normalizeAddress(maybe.address),
  };
}

function findLinkedWalletAddress(
  linkedAccounts: unknown[] | undefined,
  predicate: (wallet: LinkedWalletInfo) => boolean
): Address | undefined {
  if (!linkedAccounts) return undefined;

  for (const account of linkedAccounts) {
    const wallet = getLinkedWalletInfo(account);
    if (!wallet) continue;
    if (predicate(wallet) && wallet.address) return wallet.address;
  }

  return undefined;
}

export function useWalletFunding() {
  const { user, ready: privyReady, authenticated } = usePrivy();
  const { wallets, ready } = useWallets();
  const [isFunding, setIsFunding] = useState(false);
  const { createWallet } = useCreateWallet();
  const embeddedWallet = getEmbeddedConnectedWallet(wallets);
  const linkedEmbeddedWalletAddress = findLinkedWalletAddress(
    user?.linkedAccounts,
    (wallet) =>
      isEvmLinkedWallet(wallet.chainType) &&
      (wallet.walletClientType === "privy" ||
        wallet.connectorType === "embedded")
  );
  const embeddedWalletAddress =
    embeddedWallet?.address ?? linkedEmbeddedWalletAddress;
  const normalizedEmbeddedWalletAddress = normalizeAddress(
    embeddedWalletAddress
  );
  const embeddedBreadBalance = useBalance({
    address: normalizedEmbeddedWalletAddress,
    token: BREAD_TOKEN_ADDRESS,
    chainId: APP_CHAIN_ID,
    query: { enabled: Boolean(normalizedEmbeddedWalletAddress) },
  });
  const embeddedNativeBalance = useBalance({
    address: normalizedEmbeddedWalletAddress,
    chainId: APP_CHAIN_ID,
    query: { enabled: Boolean(normalizedEmbeddedWalletAddress) },
  });
  const embeddedHasBread = hasPositiveBalance(embeddedBreadBalance.data?.value);
  const balancesLoading =
    embeddedBreadBalance.isLoading || embeddedNativeBalance.isLoading;
  const helperCopy = embeddedHasBread
    ? "Stacks wallet has BREAD. You can fund it with xDAI to bake more."
    : IS_SUPPORTED_CHAIN_ID
      ? "Fund the Stacks wallet with xDAI to bake BREAD."
      : "Funding unavailable: unsupported chain configuration.";
  const { handlePostNativeFundingBake } = usePostNativeFundingBake();
  const { fundWallet } = useFundWallet({
    onUserExited: ({ address, fundingMethod }) => {
      debugInfo("[Privy] Fund wallet modal closed", {
        address,
        fundingMethod,
      });
    },
  });

  const handleFundWallet = async () => {
    debugInfo("[Privy] Fund wallet click", {
      privyReady,
      authenticated,
      walletsReady: ready,
      walletCount: wallets.length,
      embeddedWalletConnectedAddress: embeddedWallet?.address,
      embeddedWalletLinkedAddress: linkedEmbeddedWalletAddress,
    });

    if (!privyReady || !authenticated) {
      debugWarn("[Privy] Fund wallet blocked: user not authenticated/ready");
      return false;
    }
    if (!IS_SUPPORTED_CHAIN_ID) {
      console.error(
        `[Privy] Fund wallet blocked: unsupported active chain id (${APP_CHAIN_ID}). Supported values: ${SUPPORTED_CHAIN_IDS.join(", ")}`
      );
      return false;
    }

    try {
      setIsFunding(true);
      let targetAddress = embeddedWalletAddress;

      if (!targetAddress) {
        debugInfo("[Privy] No embedded wallet found, creating one first");
        const createdWallet = await createWallet();
        targetAddress = createdWallet?.address;
      }

      if (!targetAddress) {
        debugWarn(
          "[Privy] Fund wallet blocked: no embedded wallet found/created"
        );
        return false;
      }

      if (!ready) {
        debugWarn("[Privy] Fund wallet blocked: wallets not ready");
        return false;
      }

      const openFunding = async () => {
        const options = {
          chain: { id: APP_CHAIN_ID },
          asset: "native-currency" as const,
        };

        debugInfo("[Privy] Opening native funding modal", {
          address: targetAddress,
        });

        return fundWallet({
          address: targetAddress,
          options,
        });
      };

      const fundNativeAndBake = async () => {
        const fundingResult = await openFunding();
        if (fundingResult.status !== "completed") return false;

        const receiver = normalizeAddress(targetAddress);
        if (!receiver) return false;

        debugInfo("[Privy] Checking embedded wallet for xDAI to auto-bake", {
          address: receiver,
        });

        const result = await handlePostNativeFundingBake({
          receiver,
          refetchEmbeddedBreadBalance: embeddedBreadBalance.refetch,
          refetchEmbeddedNativeBalance: embeddedNativeBalance.refetch,
        });

        debugInfo("[Privy] Post-native funding bake result", {
          address: receiver,
          baked: result.baked,
          embeddedBreadAfterFunding:
            result.embeddedBreadAfterFunding.toString(),
          embeddedNativeAfterFunding:
            result.embeddedNativeAfterFunding.toString(),
        });

        return true;
      };

      const didFund = await fundNativeAndBake();
      if (!didFund) return false;

      void embeddedBreadBalance.refetch();
      void embeddedNativeBalance.refetch();
      return true;
    } catch (error) {
      console.error("[Privy] Fund wallet flow error", error);
      return false;
    } finally {
      setIsFunding(false);
    }
  };

  return {
    helperCopy,
    isFunding,
    handleFundWallet,
    privyReady,
    authenticated,
    walletsReady: ready && IS_SUPPORTED_CHAIN_ID,
    balancesLoading,
    embeddedHasBread,
    embeddedWalletAddress: normalizedEmbeddedWalletAddress,
    embeddedBreadBalance: embeddedBreadBalance.data?.formatted ?? "0",
  };
}
