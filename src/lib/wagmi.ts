import { defineChain } from "viem";
import { foundry } from "wagmi/chains";

export const foundryChain = defineChain({
	...foundry,
	id: 31337,
	// contracts: {
	// 	multicall3: {
	// 		address: "0xcA11bde05977b3631167028862bE2a173976CA11",
	// 		blockCreated: 21_022_491,
	// 	},
	// },
});
