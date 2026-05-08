"use client";

import type React from "react";

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
import { http } from "wagmi";
import { arbitrum, base, bsc, gnosis, mainnet, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { foundryChain } from "@/lib/wagmi";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";

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

export const wagmiConfig = createConfig({
  connectors,
  // @ts-expect-error Correct
  chains: (() => {
    const _chains = [gnosis, mainnet, arbitrum, base, bsc, optimism];
    // @ts-expect-error Correct
    if (process.env.NODE_ENV === "development") _chains.push(foundryChain);

    return _chains;
  })(),
  transports: {
    [gnosis.id]: http(),
    [foundryChain.id]: http(),
    // for lifi
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
    [optimism.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// export function Web3Provider({ children }: { children: React.ReactNode }) {
// 	return (
// 		<WagmiProvider config={wagmiConfig}>
// 			<QueryClientProvider client={queryClient}>
// 				<RainbowKitProvider>{children}</RainbowKitProvider>
// 			</QueryClientProvider>
// 		</WagmiProvider>
// 	);
// }

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
