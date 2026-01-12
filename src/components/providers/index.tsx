"use client";

import { ComponentProps, ReactNode } from "react";
import ToolsProviders from "./tools";
import { Web3Provider } from "./web3";
import { ModalProvider } from "../modal/context";
import { BreadUIKitProvider, ConnectedUserProvider } from "@breadcoop/ui";
import { clientEnv } from "@/lib/env";
import { Address, erc20Abi } from "viem";

const tokenConfig: ComponentProps<typeof BreadUIKitProvider>["tokenConfig"] = {
	BREAD: {
		address: clientEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS as Address,
		abi: erc20Abi,
	},
};

const Providers = ({ children }: { children: ReactNode }) => {
	return (
		<ToolsProviders>
			<Web3Provider>
				<BreadUIKitProvider
					app="stacks"
					isProd={clientEnv.NEXT_PUBLIC_NODE_ENV === "production"}
					tokenConfig={tokenConfig}
				>
					<ConnectedUserProvider
						isProd={clientEnv.NEXT_PUBLIC_NODE_ENV === "production"}
					>
						<ModalProvider>{children}</ModalProvider>
					</ConnectedUserProvider>
				</BreadUIKitProvider>
			</Web3Provider>
		</ToolsProviders>
	);
};

export default Providers;
