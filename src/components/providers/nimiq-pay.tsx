"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Address, erc20Abi, Hex } from "viem";
import {
  arbitrum,
  base,
  bsc,
  gnosis,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "viem/chains";
import {
  createConfig,
  http,
  useAccount,
  useSignTypedData,
  WagmiProvider,
} from "wagmi";
import { getAccount, sendTransaction, switchChain } from "@wagmi/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { hashFn } from "wagmi/query";
import {
  connectorsForWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { BreadUIKitProvider, ConnectedUserProvider } from "@breadcoop/ui";
import { SupabaseProvider } from "./supabase";
import { ModalProvider, useModal } from "../modal/context";
import { TxSender, TxSenderProvider } from "./tx-sender";
import { UserIdentityProvider } from "./user-identity";
import SepoliaAutoFund from "./sepolia-auto-fund";
import { nimiqPayUserId } from "@/utils/nimiq-pay";
import { isTokenExpired } from "@/utils/jwt";
import { nimiqPaySignInTypedData } from "@/lib/nimiq-pay-sign-in";
import { useActiveChainId, useDepositToken } from "./active-chain";

// Nimiq Pay provider stack: no Privy — Nimiq Pay's injected wallet is the
// wallet. Unlike MiniPay it neither auto-connects nor trusts the bare address:
// connecting and signing in each open a native Nimiq Pay dialog, so each
// follows a tap (the ui-kit LoginButton, then the sign-in modal), and the
// session is minted from a signed nonce. Gas is paid by the user in the
// chain's native token — there is no sponsorship outside Privy.
export const nimiqPayWagmiConfig = createConfig({
  // Polygon (the nimiq site's USDT stacks) and the Privy-chain stacks, plus the
  // chains the LI.FI widget in the fund modal bridges from
  // (src/components/lifi/config.ts)
  chains: [polygon, gnosis, sepolia, mainnet, arbitrum, base, bsc, optimism],
  // Through RainbowKit rather than wagmi's bare injected(): the ui-kit's
  // LoginButton opens RainbowKit's connect modal, which lists only connectors
  // RainbowKit built (and EIP-6963 announcements) — a bare one leaves it empty.
  connectors: connectorsForWallets(
    [{ groupName: "Nimiq Pay", wallets: [injectedWallet] }],
    {
      appName: "Stacks",
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    }
  ),
  transports: {
    [polygon.id]: http(),
    [gnosis.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
    [optimism.id]: http(),
  },
  ssr: true,
});

type NimiqPayChainId = (typeof nimiqPayWagmiConfig)["chains"][number]["id"];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      queryKeyHashFn: hashFn,
    },
  },
});

const tokenConfig = (address: Address) => ({
  BREAD: {
    address,
    abi: erc20Abi,
  },
});

const NimiqPayTxSenderProvider = ({ children }: { children: ReactNode }) => {
  const chainId = useActiveChainId() as NimiqPayChainId;

  const sender = useCallback<TxSender>(
    async (input) => {
      const value =
        input.value === undefined
          ? undefined
          : typeof input.value === "bigint"
            ? input.value
            : BigInt(input.value);

      // The wallet can be on any chain (Nimiq Pay opens on Ethereum), and
      // wagmi won't send on a chain the wallet isn't on. Switching asks the
      // user — and for a chain Nimiq Pay doesn't list, such as Gnosis, the
      // injected connector adds it first.
      if (getAccount(nimiqPayWagmiConfig).chainId !== chainId) {
        await switchChain(nimiqPayWagmiConfig, { chainId });
      }

      const hash = await sendTransaction(nimiqPayWagmiConfig, {
        to: input.to as Address,
        data: input.data as Hex | undefined,
        value,
        chainId,
      });

      return { hash };
    },
    [chainId]
  );

  return <TxSenderProvider value={sender}>{children}</TxSenderProvider>;
};

// A session outlives the page — tokens last 7 days — so a returning user isn't
// asked to sign again on every open. Storage can be unavailable in a WebView;
// then the user simply signs in again.
const SESSION_STORAGE_PREFIX = "stacks:nimiq-pay-session:";

const readStoredToken = (address: string): string | null => {
  try {
    const token = localStorage.getItem(
      SESSION_STORAGE_PREFIX + address.toLowerCase()
    );
    return token && !isTokenExpired(token) ? token : null;
  } catch {
    return null;
  }
};

const storeToken = (address: string, token: string) => {
  try {
    localStorage.setItem(SESSION_STORAGE_PREFIX + address.toLowerCase(), token);
  } catch {
    void 0;
  }
};

/**
 * Signs a connected Nimiq Pay user in: the wallet signs a server-issued nonce
 * (src/lib/nimiq-pay-sign-in.ts), and the server returns a session token for
 * the address it proved. Until then the user is connected but signed out:
 * contract reads and writes work, authenticated API routes don't.
 */
const NimiqPayIdentityProvider = ({ children }: { children: ReactNode }) => {
  const { address, status } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const { modalState, setModal } = useModal();
  const [session, setSession] = useState<{
    address: string;
    token: string;
  } | null>(null);
  const promptedFor = useRef<string | null>(null);

  const token =
    session &&
    address &&
    session.address === address.toLowerCase() &&
    !isTokenExpired(session.token)
      ? session.token
      : null;

  const signIn = useCallback(async () => {
    if (!address) throw new Error("Connect your wallet first.");

    const nonceRes = await fetch("/api/nimiq-pay/nonce", { method: "POST" });
    if (!nonceRes.ok) {
      throw new Error("Couldn't start sign-in. Please try again.");
    }
    const { nonce } = (await nonceRes.json()) as { nonce: string };

    const signature = await signTypedDataAsync(
      nimiqPaySignInTypedData(address, nonce)
    );

    const res = await fetch("/api/nimiq-pay/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, nonce, signature }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      token?: string;
      isNewUser?: boolean;
      error?: string;
    };

    if (!res.ok || !body.token) {
      throw new Error(body.error ?? "Sign-in failed. Please try again.");
    }

    storeToken(address, body.token);
    setSession({ address: address.toLowerCase(), token: body.token });
    // Replaces the sign-in modal, mirroring MiniPay's first-visit alias prompt
    setModal(body.isNewUser ? { type: "SET_ALIAS", skippable: true } : null);
  }, [address, signTypedDataAsync, setModal]);

  // A returning user's still-valid session, picked up on connect
  useEffect(() => {
    if (!address) return;

    const stored = readStoredToken(address);
    if (stored) setSession({ address: address.toLowerCase(), token: stored });
  }, [address]);

  // Ask once per address per page load, and never over another modal; "Not
  // now" leaves the user browsing signed out until the app is reopened.
  useEffect(() => {
    if (status !== "connected" || !address || token || modalState) return;
    if (readStoredToken(address)) return; // being picked up above

    const key = address.toLowerCase();
    if (promptedFor.current === key) return;
    promptedFor.current = key;

    setModal({ type: "NIMIQ_PAY_SIGN_IN", onSignIn: signIn });
  }, [status, address, token, modalState, setModal, signIn]);

  const getAuthToken = useCallback(
    async () => (token && !isTokenExpired(token) ? token : null),
    [token]
  );

  const identity = useMemo(
    () => ({
      ready: status !== "connecting" && status !== "reconnecting",
      // Only once signed in: the id is what API routes trust, and it is
      // proven only by the session.
      userId: address && token ? nimiqPayUserId(address) : undefined,
      getAuthToken,
    }),
    [status, address, token, getAuthToken]
  );

  return (
    <UserIdentityProvider value={identity}>{children}</UserIdentityProvider>
  );
};

export const NimiqPayProviders = ({ children }: { children: ReactNode }) => {
  const chainId = useActiveChainId();
  const depositToken = useDepositToken();

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={nimiqPayWagmiConfig}>
        {/* RainbowKit backs the ui-kit's "general" connect and switch-chain
            modals; Nimiq Pay shows up there through EIP-6963 */}
        <RainbowKitProvider>
          <SupabaseProvider>
            <BreadUIKitProvider
              app="stacks"
              chainId={chainId}
              tokenConfig={tokenConfig(depositToken.address)}
              authProvider="general"
            >
              <ConnectedUserProvider>
                <SepoliaAutoFund />
                <ModalProvider>
                  <NimiqPayIdentityProvider>
                    <NimiqPayTxSenderProvider>
                      {children}
                    </NimiqPayTxSenderProvider>
                  </NimiqPayIdentityProvider>
                </ModalProvider>
              </ConnectedUserProvider>
            </BreadUIKitProvider>
          </SupabaseProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
};
