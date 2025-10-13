import { createConfig, http } from "wagmi"
import { gnosis } from "wagmi/chains"

// This config is used for client-side actions like ENS resolution
// It doesn't require a wallet connector
export const wagmiConfig = createConfig({
  chains: [gnosis],
  transports: {
    [gnosis.id]: http(),
  },
})
