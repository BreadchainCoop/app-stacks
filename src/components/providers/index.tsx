"use client";

import { ComponentProps, ReactNode } from "react";
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
  "detected_ethereum_wallets",
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
      : [...walletLists, "wallet_connect_qr"],
  },
});

const Providers = ({
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
                <ModalProvider>{children}</ModalProvider>
              </ConnectedUserProvider>
            </BreadUIKitProvider>
          </Web3Provider>
        </SupabaseProvider>
      </PrivyProvider>
    </>
  );
};

export default Providers;
