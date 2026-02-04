"use client";

import type React from "react";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { gnosis } from "viem/chains";
import { http, createConfig, WagmiProvider as BaseWagmiProvider } from "wagmi";

const config = createConfig({
  chains: [gnosis],
  transports: {
    [gnosis.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const disableWalletUIs = pathname === "/new";

  if (!privyAppId) {
    console.warn("NEXT_PUBLIC_PRIVY_APP_ID is not set");
    return (
      <BaseWagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </BaseWagmiProvider>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#1C5BB9",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
          showWalletUIs: !disableWalletUIs,
        },
        defaultChain: gnosis,
        supportedChains: [gnosis],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
