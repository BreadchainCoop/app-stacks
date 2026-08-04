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
  createConfig as createWagmiOnlyConfig,
  WagmiProvider as WagmiOnlyProvider,
} from "wagmi";
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
import {
  WagmiProvider as PrivyWagmiProvider,
  createConfig,
} from "@privy-io/wagmi";
import { hashFn } from "wagmi/query";
import { IS_E2E_WALLET } from "@/lib/e2e";

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

// The Privy wagmi adapter keeps only `mock` connectors and turns off EIP-6963
// discovery, because wagmi is meant to mirror the Privy wallet. The local E2E
// wallet mode needs the opposite, so it uses wagmi's own config and provider —
// the only way an injected wallet can reach wagmi. See src/lib/e2e.ts.
const createWagmiConfig = IS_E2E_WALLET ? createWagmiOnlyConfig : createConfig;
const WagmiProvider = IS_E2E_WALLET ? WagmiOnlyProvider : PrivyWagmiProvider;

export const wagmiConfig = createWagmiConfig({
  connectors,
  // @ts-expect-error Correct
  chains: (() => {
    const _chains = [gnosis, sepolia, mainnet, arbitrum, base, bsc, optimism];
    if (process.env.NODE_ENV === "development" || IS_E2E_WALLET)
      // @ts-expect-error Correct
      _chains.push(foundryChain);

    return _chains;
  })(),
  transports: {
    [gnosis.id]: http(),
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
