"use client";

import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  frameWallet,
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
  safeWallet,
  // walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import {
  http,
  WagmiProvider as BaseWagmiProvider,
  createConfig as createBaseConfig,
} from "wagmi";
import { mock } from "wagmi/connectors";
import {
  arbitrum,
  base,
  bsc,
  gnosis,
  mainnet,
  optimism,
  sepolia,
} from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { foundryChain } from "@/lib/wagmi";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { hashFn } from "wagmi/query";
import { clientEnv } from "@/lib/env";
import {
  LOCAL_ANVIL_ACCOUNTS,
  getLocalAccountIndex,
  isLocalMode,
} from "@/lib/network-mode";
import type { Address } from "viem";
import type { Config } from "wagmi";

// https://github.com/rainbow-me/rainbowkit/issues/2476#issuecomment-3117608183
export function getWallets() {
  const wallets = [
    injectedWallet,
    frameWallet,
    rabbyWallet,
    coinbaseWallet,
    safeWallet,
  ];

  if (typeof indexedDB !== "undefined") {
    // @ts-expect-error Correct
    wallets.unshift(metaMaskWallet);
    // wallets.unshift(metaMaskWallet, walletConnectWallet);
  }

  return wallets;
}

const connectors = connectorsForWallets(
  [
    {
      groupName: "Suggested",
      wallets: getWallets(),
    },
  ],
  {
    appName: "Stacks",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  }
);

const privyWagmiConfig = createConfig({
  connectors,
  chains: [gnosis, sepolia, mainnet, arbitrum, base, bsc, optimism],
  transports: {
    [gnosis.id]: http(),
    [sepolia.id]: http(),
    // for lifi
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
    [optimism.id]: http(),
  },
  ssr: true,
});

// Active account first so the mock connector connects as it; Anvil signs
// server-side (accounts are unlocked), no private keys in the app.
const localAccounts = (() => {
  const active = getLocalAccountIndex();
  return [
    LOCAL_ANVIL_ACCOUNTS[active],
    ...LOCAL_ANVIL_ACCOUNTS.filter((_, i) => i !== active),
  ] as unknown as readonly [Address, ...Address[]];
})();

const localWagmiConfig = createBaseConfig({
  chains: [foundryChain],
  connectors: [
    mock({
      accounts: localAccounts,
      features: { defaultConnected: true, reconnect: true },
    }),
  ],
  transports: {
    [foundryChain.id]: http(clientEnv.NEXT_PUBLIC_LOCAL_RPC_URL),
  },
  ssr: true,
});

export const wagmiConfig = (
  isLocalMode() ? localWagmiConfig : privyWagmiConfig
) as Config;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      queryKeyHashFn: hashFn,
    },
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  if (isLocalMode()) {
    // Plain wagmi provider: @privy-io/wagmi's wallet-sync effect wipes
    // non-Privy connector state, which would disconnect the mock connector.
    return (
      <QueryClientProvider client={queryClient}>
        <BaseWagmiProvider config={localWagmiConfig}>
          {children}
        </BaseWagmiProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={privyWagmiConfig}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
