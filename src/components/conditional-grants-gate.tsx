"use client";

import { FeatureGate } from "@/components/feature-gate";
import { useChainConfig } from "@/components/providers/active-chain";
import type { ReactNode } from "react";
import { zeroAddress } from "viem";

/**
 * Conditional grants need both the deployment's `conditionalGrants` feature and
 * the contract on the active chain: the feature flag is per deployment, while
 * the contract is only deployed on some chains.
 */
export function ConditionalGrantsGate({ children }: { children: ReactNode }) {
  const { conditionalGrants } = useChainConfig();

  return (
    <FeatureGate feature="conditionalGrants">
      {conditionalGrants !== zeroAddress && children}
    </FeatureGate>
  );
}
