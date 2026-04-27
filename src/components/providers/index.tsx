"use client";

import { ComponentProps, ReactNode, useEffect, useRef } from "react";
import ToolsProviders from "./tools";
import { Web3Provider } from "./web3";
import { SupabaseProvider } from "./supabase";
import { ModalProvider } from "../modal/context";
import { BreadUIKitProvider, ConnectedUserProvider } from "@breadcoop/ui";
import { clientEnv } from "@/lib/env";
import { Address, erc20Abi } from "viem";
import {
  PrivyClientConfig,
  PrivyProvider,
  usePrivy,
  useWallets,
} from "@privy-io/react-auth";
import {
  activeBreadTokenAddress,
  activeChain,
  activeChainId,
} from "@/lib/network";

const tokenConfig: ComponentProps<typeof BreadUIKitProvider>["tokenConfig"] = {
  BREAD: {
    address: activeBreadTokenAddress as Address,
    abi: erc20Abi,
  },
};

const privyConfig: PrivyClientConfig = {
  defaultChain: activeChain,
  supportedChains: [activeChain],
  embeddedWallets: {
    ethereum: {
      createOnLogin: "all-users",
    },
  },
};

const SEPOLIA_CHAIN_ID = 11155111;

function SepoliaEmbeddedAutoFund() {
  const { ready } = usePrivy();
  const { wallets } = useWallets();
  const requestedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    const embeddedWallet = wallets.find((wallet) => {
      const walletType = wallet.walletClientType?.toLowerCase() ?? "";
      return (
        walletType === "privy" ||
        walletType === "embedded_wallet" ||
        walletType.includes("embedded")
      );
    });

    const walletAddress = embeddedWallet?.address;
    if (!walletAddress) return;
    if (requestedFor.current === walletAddress) return;

    void (async () => {
      try {
        const response = await fetch("/api/funding/sepolia-embedded", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress,
            chainId: SEPOLIA_CHAIN_ID,
          }),
        });

        if (!response.ok) {
          let errorBody: unknown = null;
          try {
            errorBody = await response.json();
          } catch {
            errorBody = await response.text().catch(() => null);
          }

          console.error("Sepolia embedded auto-funding failed", {
            status: response.status,
            statusText: response.statusText,
            errorBody,
            walletAddress,
          });
          requestedFor.current = null;
          return;
        }

        requestedFor.current = walletAddress;
      } catch {
        requestedFor.current = null;
      }
    })();
  }, [ready, wallets]);

  return null;
}

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ToolsProviders>
      <PrivyProvider
        appId={clientEnv.NEXT_PUBLIC_PRIVY_APP_ID}
        clientId={clientEnv.NEXT_PUBLIC_PRIVY_CLIENT_ID}
        config={privyConfig}
      >
        <SepoliaEmbeddedAutoFund />
        <SupabaseProvider>
          <Web3Provider>
            <BreadUIKitProvider
              app="stacks"
              chainId={activeChainId}
              tokenConfig={tokenConfig}
              authProvider="privy"
            >
              <ConnectedUserProvider>
                <ModalProvider>{children}</ModalProvider>
              </ConnectedUserProvider>
            </BreadUIKitProvider>
          </Web3Provider>
        </SupabaseProvider>
      </PrivyProvider>
    </ToolsProviders>
  );
};

export default Providers;
