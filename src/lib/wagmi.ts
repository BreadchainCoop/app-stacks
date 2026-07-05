import { defineChain } from "viem";
import { foundry } from "wagmi/chains";
import { clientEnv } from "./env";

export const foundryChain = defineChain({
  ...foundry,
  id: 31337,
  // The wagmi mock connector signs by forwarding raw RPC calls to
  // rpcUrls.default, so the local RPC URL must live on the chain itself.
  rpcUrls: {
    default: { http: [clientEnv.NEXT_PUBLIC_LOCAL_RPC_URL] },
  },
  // contracts: {
  // 	multicall3: {
  // 		address: "0xcA11bde05977b3631167028862bE2a173976CA11",
  // 		blockCreated: 21_022_491,
  // 	},
  // },
});
