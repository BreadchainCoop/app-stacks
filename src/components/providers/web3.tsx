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
import { WagmiProvider, createConfig, http } from "wagmi";
import { foundry, gnosis } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { defineChain } from "viem";

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

const foundryChain = defineChain({
	...foundry,
	id: 31337,
	// contracts: {
	// 	multicall3: {
	// 		address: "0xcA11bde05977b3631167028862bE2a173976CA11",
	// 		blockCreated: 21_022_491,
	// 	},
	// },
});

export const wagmiConfig = createConfig({
	connectors,
	// @ts-expect-error Correct
	chains: (() => {
		const _chains = [gnosis];
		// @ts-expect-error Correct
		if (process.env.NODE_ENV === "development") _chains.push(foundryChain);

		return _chains;
	})(),
	transports: {
		[gnosis.id]: http(),
		[foundryChain.id]: http(),
	},
	ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
	return (
		<WagmiProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider>{children}</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
