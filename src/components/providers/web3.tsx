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
import { http } from "wagmi";
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

// Route the primary chain's reads through the app's own /api/rpc proxy when an
// app URL is configured, so VPN/DNS/CORS filtering of the public RPC can't
// break on-chain reads (the browser only talks to our own origin). Needs an
// ABSOLUTE base so it works during SSR prefetch too; falls back to a direct
// http() transport when NEXT_PUBLIC_APP_URL is unset (behavior unchanged).
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const gnosisTransport = appUrl
  ? http(`${appUrl.replace(/\/$/, "")}/api/rpc?chainId=${gnosis.id}`)
  : http();

export const wagmiConfig = createConfig({
  connectors,
  // @ts-expect-error Correct
  chains: (() => {
    const _chains = [gnosis, sepolia, mainnet, arbitrum, base, bsc, optimism];
    // @ts-expect-error Correct
    if (process.env.NODE_ENV === "development") _chains.push(foundryChain);

    return _chains;
  })(),
  transports: {
    [gnosis.id]: gnosisTransport,
    [foundryChain.id]: http(),
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      queryKeyHashFn: hashFn,
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
