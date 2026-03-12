"use client";

import { ComponentProps, ReactNode, useEffect, useRef } from "react";
import ToolsProviders from "./tools";
import { Web3Provider } from "./web3";
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
import { getDefaultChainDetail, getDefaultChainId } from "@/utils/chain";

const tokenConfig: ComponentProps<typeof BreadUIKitProvider>["tokenConfig"] = {
  BREAD: {
    address: clientEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS as Address,
    abi: erc20Abi,
  },
};

const _chain = getDefaultChainDetail();

const privyConfig: PrivyClientConfig = {
  defaultChain: _chain,
  supportedChains: [_chain],
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
    if (clientEnv.NEXT_PUBLIC_TARGET_NETWORK !== "sepolia") return;

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
          requestedFor.current = null;
          return;
        }

        requestedFor.current = walletAddress;
      } catch {
        // Allow a future retry if request fails due to transient network issues.
        requestedFor.current = null;
      }
    })();
  }, [ready, wallets]);

  return null;
}

const Providers = ({ children }: { children: ReactNode }) => {
  const isProd = clientEnv.NEXT_PUBLIC_TARGET_NETWORK === "gnosis";
  const appChainId = getDefaultChainId();

  return (
    <ToolsProviders>
      <PrivyProvider
        appId={clientEnv.NEXT_PUBLIC_PRIVY_APP_ID}
        clientId={clientEnv.NEXT_PUBLIC_PRIVY_CLIENT_ID}
        config={privyConfig}
      >
        <SepoliaEmbeddedAutoFund />
        <Web3Provider>
          <BreadUIKitProvider
            app="stacks"
            isProd={isProd}
            chainId={appChainId}
            supportedChainIds={[appChainId]}
            tokenConfig={tokenConfig}
            authProvider="privy"
          >
            <ConnectedUserProvider isProd={isProd}>
              <ModalProvider>{children}</ModalProvider>
            </ConnectedUserProvider>
          </BreadUIKitProvider>
        </Web3Provider>
      </PrivyProvider>
    </ToolsProviders>
  );
};

export default Providers;
