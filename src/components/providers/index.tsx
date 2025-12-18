import { ReactNode } from "react";
import ToolsProviders from "./tools";
import { Web3Provider } from "./web3";
import { ModalProvider } from "../modal/context";

const Providers = ({ children }: { children: ReactNode }) => {
	return (
		<ToolsProviders>
			<Web3Provider>
				<ModalProvider>{children}</ModalProvider>
			</Web3Provider>
		</ToolsProviders>
	);
};

export default Providers;
