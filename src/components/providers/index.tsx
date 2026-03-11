"use client";

import { ComponentProps, ReactNode } from "react";
import ToolsProviders from "./tools";
import { Web3Provider } from "./web3";
import { ModalProvider } from "../modal/context";
import { BreadUIKitProvider, ConnectedUserProvider } from "@breadcoop/ui";
import { clientEnv } from "@/lib/env";
import { Address, erc20Abi } from "viem";
import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { getDefaultChainDetail } from "@/utils/chain";

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

const Providers = ({ children }: { children: ReactNode }) => {
  const isProd = clientEnv.NEXT_PUBLIC_TARGET_NETWORK === "gnosis";

  return (
    <ToolsProviders>
      <PrivyProvider
        appId={clientEnv.NEXT_PUBLIC_PRIVY_APP_ID}
        clientId={clientEnv.NEXT_PUBLIC_PRIVY_CLIENT_ID}
        config={privyConfig}
      >
        <Web3Provider>
          <BreadUIKitProvider
            app="stacks"
            isProd={isProd}
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
