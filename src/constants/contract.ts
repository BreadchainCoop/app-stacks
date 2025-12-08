// Contract addresses for different environments
const CONTRACT_ADDRESSES = {
  // Local Anvil development
  local: "0xe1da8919f262ee86f9be05059c9280142cf23f48" as const,

  // Gnosis Chain mainnet
  gnosis: "0x55F1D6b75C70890a464b6e7D99881707643d6eC5" as const,

  // Add more environments as needed
  // sepolia: "0x..." as const,
  // optimism: "0x..." as const,
} as const;

// Get the current environment (default to local for development)
const getEnvironment = (): keyof typeof CONTRACT_ADDRESSES => {
  if (typeof window !== "undefined") {
    // Client-side: check if we're on localhost
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "local";
    }
    // Add other client-side environment detection as needed
  }

  // Server-side or fallback: use environment variable
  const env = process.env.NODE_ENV;
  if (env === "development") return "local";
  if (env === "production") return "gnosis";

  // Default to local for development
  return "local";
};

// Export the contract address for the current environment
export const CONTRACT_ADDRESS = CONTRACT_ADDRESSES[getEnvironment()];

// Export all addresses for reference
export const CONTRACT_ADDRESSES_ALL = CONTRACT_ADDRESSES;

// Export the current environment
export const CURRENT_ENVIRONMENT = getEnvironment();
