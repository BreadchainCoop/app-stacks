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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { activeChain } from "@/lib/network";

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
  chains: [activeChain],
  transports: {
    [activeChain.id]: http(activeChain.rpcUrls.default.http[0]),
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
