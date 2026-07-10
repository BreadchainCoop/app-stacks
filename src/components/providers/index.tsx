"use client";

import { ComponentProps, ReactNode, useEffect, useState } from "react";
// import ToolsProviders from "./tools";
import { Web3Provider } from "./web3";
import { SupabaseProvider } from "./supabase";
import { ModalProvider } from "../modal/context";
import { BreadUIKitProvider, ConnectedUserProvider } from "@breadcoop/ui";
import { clientEnv } from "@/lib/env";
import { Address, erc20Abi } from "viem";
import {
  PrivyClientConfig,
  PrivyProvider,
  WalletListEntry,
} from "@privy-io/react-auth";
import SepoliaAutoFund from "./sepolia-auto-fund";
import { networks } from "@/utils/network";
import { MiniPayProviders } from "./minipay";
import { PrivyTxSenderProvider } from "./tx-sender";
import { PrivyUserIdentityProvider } from "./user-identity";
import { isMiniPayBrowser } from "@/utils/minipay";
import { isCeloChain } from "@/utils/celo";
import LoginTracker from "@/components/login-tracker";
import { OnboardVisitorTracker } from "@/components/onboard/visitor-tracker";

const tokenConfig: ComponentProps<typeof BreadUIKitProvider>["tokenConfig"] = {
  BREAD: {
    address: clientEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS as Address,
    abi: erc20Abi,
  },
};

// TODO: Provide our RPC_URL -> gnosis / sepolia / depending on the NEXT_PUBLIC_CHAIN_ID
// const gnosisOverride = addRpcUrlOverrideToChain(gnosis, "")

const _chain =
  networks[clientEnv.NEXT_PUBLIC_CHAIN_ID as keyof typeof networks].chain;

const walletLists: WalletListEntry[] = [
  "metamask",
  "coinbase_wallet",
  "rainbow",
];

const privyConfig = (isMobile: boolean): PrivyClientConfig => ({
  defaultChain: _chain,
  supportedChains: [_chain],
  embeddedWallets: {
    ethereum: {
      createOnLogin: "all-users",
    },
  },
  walletConnectCloudProjectId: clientEnv.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  appearance: {
    walletList: isMobile
      ? [...walletLists, "wallet_connect"]
      : [...walletLists, "detected_ethereum_wallets", "wallet_connect_qr"],
  },
});

const PrivyProviders = ({
  children,
  isMobile,
}: {
  children: ReactNode;
  isMobile: boolean;
}) => {
  return (
    <>
      <PrivyProvider
        appId={clientEnv.NEXT_PUBLIC_PRIVY_APP_ID}
        clientId={clientEnv.NEXT_PUBLIC_PRIVY_CLIENT_ID}
        config={privyConfig(isMobile)}
      >
        <SupabaseProvider>
          <Web3Provider>
            <BreadUIKitProvider
              app="stacks"
              chainId={clientEnv.NEXT_PUBLIC_CHAIN_ID}
              tokenConfig={tokenConfig}
              authProvider="privy"
            >
              <ConnectedUserProvider>
                <SepoliaAutoFund />
                <ModalProvider>
                  <PrivyUserIdentityProvider>
                    <PrivyTxSenderProvider>
                      <OnboardVisitorTracker />
                      <LoginTracker />
                      {children}
                    </PrivyTxSenderProvider>
                  </PrivyUserIdentityProvider>
                </ModalProvider>
              </ConnectedUserProvider>
            </BreadUIKitProvider>
          </Web3Provider>
        </SupabaseProvider>
      </PrivyProvider>
    </>
  );
};

// The MiniPay stack only makes sense on a Celo-configured deployment; a
// Gnosis deployment opened inside MiniPay's browser keeps the Privy stack.
const miniPaySupported = isCeloChain(clientEnv.NEXT_PUBLIC_CHAIN_ID);

const Providers = ({
  children,
  isMobile,
  isMiniPay,
}: {
  children: ReactNode;
  isMobile: boolean;
  isMiniPay: boolean;
}) => {
  // Server-side UA hint keeps hydration consistent; the injected
  // window.ethereum.isMiniPay flag is authoritative and corrects the hint
  // after mount (MiniPay's UA and injected flag agree in practice).
  const [miniPay, setMiniPay] = useState(isMiniPay);

  useEffect(() => {
    setMiniPay(isMiniPayBrowser());
  }, []);

  if (miniPay && miniPaySupported) {
    return <MiniPayProviders>{children}</MiniPayProviders>;
  }

  return <PrivyProviders isMobile={isMobile}>{children}</PrivyProviders>;
};

export default Providers;
