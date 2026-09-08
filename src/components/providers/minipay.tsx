"use client";

import { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import { Address, erc20Abi, Hex } from "viem";
import { celo, celoSepolia } from "viem/chains";
import {
  createConfig,
  http,
  useAccount,
  useConnect,
  WagmiProvider,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { sendTransaction } from "@wagmi/core";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { hashFn } from "wagmi/query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { BreadUIKitProvider, ConnectedUserProvider } from "@breadcoop/ui";
import { clientEnv } from "@/lib/env";
import { SupabaseProvider } from "./supabase";
import { ModalProvider, useModal } from "../modal/context";
import { TxSender, TxSenderProvider } from "./tx-sender";
import { UserIdentityProvider } from "./user-identity";
import { isMiniPayBrowser, minipayUserId } from "@/utils/minipay";
import { getFeeCurrency } from "@/utils/celo";
import { getDefaultChainId } from "@/utils/chain";

// MiniPay provider stack: no Privy (MiniPay *is* the wallet), no RainbowKit.
// The injected wallet auto-connects, identity is the injected address (issue
// #154 § 2 option 1), and transactions go out with a CIP-64 feeCurrency so
// gas is paid in stablecoins.
export const minipayWagmiConfig = createConfig({
  chains: [celo, celoSepolia],
  connectors: [injected()],
  transports: {
    [celo.id]: http(),
    [celoSepolia.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      queryKeyHashFn: hashFn,
    },
  },
});

const tokenConfig = {
  BREAD: {
    address: clientEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS as Address,
    abi: erc20Abi,
  },
};

/** Zero-click connect: inside MiniPay the wallet is already there. */
const MiniPayAutoConnect = () => {
  const { status } = useAccount();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    if (status === "disconnected" && isMiniPayBrowser()) {
      connect({ connector: connectors[0] });
    }
  }, [status, connect, connectors]);

  return null;
};

const MiniPayTxSenderProvider = ({ children }: { children: ReactNode }) => {
  const sender = useCallback<TxSender>(async (input) => {
    const chainId = getDefaultChainId();
    const value =
      input.value === undefined
        ? undefined
        : typeof input.value === "bigint"
          ? input.value
          : BigInt(input.value);

    // CIP-64: feeCurrency is a hint MiniPay may override with the user's
    // largest stablecoin balance. MiniPay only accepts legacy transactions —
    // never set maxFeePerGas / maxPriorityFeePerGas here.
    const hash = await sendTransaction(minipayWagmiConfig, {
      to: input.to as Address,
      data: input.data as Hex | undefined,
      value,
      chainId,
      feeCurrency: getFeeCurrency(chainId),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    return { hash };
  }, []);

  return <TxSenderProvider value={sender}>{children}</TxSenderProvider>;
};

const isTokenExpired = (token: string): boolean => {
  try {
    // JWT segments are base64url ("-"/"_", no padding); atob wants base64
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(base64)) as { exp?: number };
    return typeof exp !== "number" || Date.now() / 1000 > exp - 60;
  } catch {
    return true;
  }
};

/**
 * Trusts the injected address as identity (no message signing exists in
 * MiniPay): exchanges it for a server-minted session token and onboards the
 * user, mirroring what LoginTracker does for Privy logins.
 */
const MiniPayIdentityProvider = ({ children }: { children: ReactNode }) => {
  const { address, status } = useAccount();
  const { setModal } = useModal();
  const aliasModalShown = useRef(false);

  const sessionQuery = useQuery({
    queryKey: ["minipay-session", address?.toLowerCase()],
    enabled: !!address,
    staleTime: Infinity,
    retry: 2,
    queryFn: async () => {
      const res = await fetch("/api/minipay/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      if (!res.ok) throw new Error("Failed to establish MiniPay session");

      return (await res.json()) as { token: string; isNewUser: boolean };
    },
  });

  const { data: session, refetch } = sessionQuery;

  useEffect(() => {
    if (session?.isNewUser && !aliasModalShown.current) {
      aliasModalShown.current = true;
      setModal({ type: "SET_ALIAS", skippable: true });
    }
  }, [session?.isNewUser, setModal]);

  const getAuthToken = useCallback(async () => {
    // Tokens live 7 days; re-mint when missing or (nearly) expired so a
    // long-lived webview session keeps working
    if (session?.token && !isTokenExpired(session.token)) return session.token;
    const { data } = await refetch();
    return data?.token ?? null;
  }, [session?.token, refetch]);

  const identity = useMemo(
    () => ({
      ready: status !== "connecting" && status !== "reconnecting",
      userId: address ? minipayUserId(address) : undefined,
      getAuthToken,
    }),
    [status, address, getAuthToken]
  );

  return (
    <UserIdentityProvider value={identity}>{children}</UserIdentityProvider>
  );
};

export const MiniPayProviders = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={minipayWagmiConfig}>
        {/* RainbowKit only backs the ui-kit's "general" connect/switch-chain
            modals (e.g. wallet on Celo Sepolia vs a mainnet deployment) */}
        <RainbowKitProvider>
          <SupabaseProvider>
            <BreadUIKitProvider
              app="stacks"
              chainId={clientEnv.NEXT_PUBLIC_CHAIN_ID}
              tokenConfig={tokenConfig}
              authProvider="general"
            >
              <ConnectedUserProvider>
                <MiniPayAutoConnect />
                <ModalProvider>
                  <MiniPayIdentityProvider>
                    <MiniPayTxSenderProvider>
                      {children}
                    </MiniPayTxSenderProvider>
                  </MiniPayIdentityProvider>
                </ModalProvider>
              </ConnectedUserProvider>
            </BreadUIKitProvider>
          </SupabaseProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
};
