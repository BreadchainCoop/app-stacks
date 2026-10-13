import type { NextConfig } from "next";

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
