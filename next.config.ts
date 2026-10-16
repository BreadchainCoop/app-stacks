import type { NextConfig } from "next";
import { CHAIN_PARAM, chainSlug } from "./src/lib/chain-slugs";
import { CHAIN_SITES } from "./src/lib/chain-sites";
import { isConfiguredChain } from "./src/lib/configured-chains";

// A `?chain=` link for a chain another site serves (a Celo link shared before
// Celo moved to the mini site, say) goes to that site. Left alone, a chain this
// deployment doesn't configure falls back to its default chain
// (providers/index.tsx) and opens an unrelated stack with the same id. Chains
// served here are skipped, so a site never redirects to itself.
const chainSiteRedirects = Object.entries(CHAIN_SITES)
  .map(([chainId, origin]) => [Number(chainId), origin] as const)
  .filter(([chainId]) => !isConfiguredChain(chainId))
  .map(([chainId, origin]) => ({
    source: "/:path*",
    has: [
      { type: "query" as const, key: CHAIN_PARAM, value: chainSlug(chainId) },
    ],
    destination: `${origin}/:path*`,
    permanent: false,
  }));

const nextConfig: NextConfig = {
  experimental: {
    // @breadcoop/ui's root is a barrel that re-exports its Privy/RainbowKit
    // components; without this, importing typography pulls that wallet code
    // into the importing page's client bundle.
    optimizePackageImports: ["@breadcoop/ui"],
  },
  async redirects() {
    return [
      {
        source: "/my-account",
        destination: "/account",
        permanent: true,
      },
      ...chainSiteRedirects,
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;
