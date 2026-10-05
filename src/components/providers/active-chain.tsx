"use client";

import { createContext, ReactNode, useContext } from "react";
import { ChainConfig, DepositTokenConfig } from "@/interfaces/chain-config";
import { getChainConfig } from "@/lib/chains";
import { chainPath } from "@/lib/chain-slugs";

const ActiveChainContext = createContext<number | undefined>(undefined);

export const ActiveChainProvider = ({
  chainId,
  children,
}: {
  chainId: number;
  children: ReactNode;
}) => (
  <ActiveChainContext.Provider value={chainId}>
    {children}
  </ActiveChainContext.Provider>
);

// The chain the current view is scoped to. Seeded once, in
// src/components/providers/index.tsx — read it from here rather than from
// NEXT_PUBLIC_CHAIN_ID so that pointing the app at a route-derived chain is a
// change to that one seed instead of to every consumer.
export const useActiveChainId = (): number => {
  const chainId = useContext(ActiveChainContext);

  if (chainId === undefined) {
    throw new Error(
      "useActiveChainId must be used within an ActiveChainProvider"
    );
  }

  return chainId;
};

// The active chain's contracts and deposit currency. Prefer this over
// importing module-level constants: those are fixed at import time and can't
// follow the active chain.
export const useChainConfig = (): ChainConfig =>
  getChainConfig(useActiveChainId());

export const useDepositToken = (): DepositTokenConfig =>
  useChainConfig().depositToken;

// Build a link that stays on the active chain. Every in-app href goes through
// this — a bare "/new" would leave the chain segment off and bounce through the
// middleware redirect.
export const useChainPath = (): ((path: string) => string) => {
  const chainId = useActiveChainId();

  return (path: string) => chainPath(chainId, path);
};
