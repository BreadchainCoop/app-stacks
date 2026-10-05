"use client";

import { ComponentProps, ReactNode } from "react";
import { Web3Provider } from "./web3";
import { SupabaseProvider } from "./supabase";
import { ModalProvider } from "../modal/context";
import { BreadUIKitProvider, ConnectedUserProvider } from "@breadcoop/ui";
import { clientEnv } from "@/lib/env";
import { Address, Chain, erc20Abi } from "viem";
import {
  PrivyClientConfig,
  PrivyProvider,
  WalletListEntry,
} from "@privy-io/react-auth";
import SepoliaAutoFund from "./sepolia-auto-fund";
import { getChainDetail } from "@/utils/chain";
import { useActiveChainId, useDepositToken } from "./active-chain";
import { PrivyTxSenderProvider } from "./tx-sender";
import { PrivyUserIdentityProvider } from "./user-identity";
import LoginTracker from "@/components/login-tracker";
import { OnboardVisitorTracker } from "@/components/onboard/visitor-tracker";

const tokenConfig = (
  address: Address
): ComponentProps<typeof BreadUIKitProvider>["tokenConfig"] => ({
  BREAD: {
    address,
    abi: erc20Abi,
  },
});

// TODO: Provide our RPC_URL -> gnosis / sepolia / depending on the NEXT_PUBLIC_CHAIN_ID
// const gnosisOverride = addRpcUrlOverrideToChain(gnosis, "")

const walletLists: WalletListEntry[] = [
  "metamask",
  "coinbase_wallet",
  "rainbow",
  "detected_ethereum_wallets",
];

const privyConfig = (isMobile: boolean, chain: Chain): PrivyClientConfig => ({
  defaultChain: chain,
  supportedChains: [chain],
  embeddedWallets: {
    showWalletUIs: false,
    ethereum: {
      createOnLogin: "users-without-wallets",
    },
  },
  walletConnectCloudProjectId: clientEnv.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  appearance: {
    walletList: isMobile
      ? [...walletLists, "wallet_connect"]
      : [...walletLists, "wallet_connect_qr"],
  },
});

const PrivyProviders = ({
  children,
  isMobile,
}: {
  children: ReactNode;
  isMobile: boolean;
}) => {
  const chainId = useActiveChainId();
  const depositToken = useDepositToken();

  return (
    <>
      <PrivyProvider
        appId={clientEnv.NEXT_PUBLIC_PRIVY_APP_ID}
        clientId={clientEnv.NEXT_PUBLIC_PRIVY_CLIENT_ID}
        config={privyConfig(isMobile, getChainDetail(chainId))}
      >
        <SupabaseProvider>
          <Web3Provider>
            <BreadUIKitProvider
              app="stacks"
              chainId={chainId}
              tokenConfig={tokenConfig(depositToken.address)}
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

export default PrivyProviders;
