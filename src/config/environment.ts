// Environment configuration for different deployment environments
export const ENVIRONMENT_CONFIG = {
  local: {
    contractAddress: "0xe1da8919f262ee86f9be05059c9280142cf23f48",
    chainId: 31337,
    rpcUrl: "http://localhost:8545",
    name: "Local Anvil",
  },
  gnosis: {
    contractAddress: "0x55F1D6b75C70890a464b6e7D99881707643d6eC5",
    chainId: 100,
    rpcUrl: "https://rpc.gnosis.gateway.fm",
    name: "Gnosis Chain",
  },
} as const;

export type Environment = keyof typeof ENVIRONMENT_CONFIG;

// Get current environment
export const getCurrentEnvironment = (): Environment => {
  if (typeof window !== "undefined") {
    // Client-side: check if we're on localhost
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "local";
    }
  }

  // Server-side or fallback
  const env = process.env.NODE_ENV;
  if (env === "development") return "local";
  if (env === "production") return "gnosis";

  return "local";
};

// Get current config
export const getCurrentConfig = () => {
  return ENVIRONMENT_CONFIG[getCurrentEnvironment()];
};




