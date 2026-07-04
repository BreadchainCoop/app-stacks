"use client";

import { type Feature, isFeatureVisible } from "@/lib/features";
import { useConnectedUser } from "@breadcoop/ui";
import type { ComponentType, ReactNode } from "react";

/**
 * True when `feature` is enabled for this deployment and, if the feature's
 * config lists addresses, the connected wallet is one of them. See
 * NEXT_PUBLIC_FEATURES in @/lib/features.
 */
function useFeatureVisible(feature: Feature) {
  const { user } = useConnectedUser();

  const connectedAddress =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;

  return isFeatureVisible(feature, connectedAddress);
}

/**
 * Renders `children` only when `feature` is visible to the current user,
 * otherwise renders `fallback` (nothing by default).
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
}: {
  feature: Feature;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return <>{useFeatureVisible(feature) ? children : fallback}</>;
}

/**
 * HOC variant of {@link FeatureGate}: wraps a component so it only renders
 * when `feature` is visible to the current user.
 */
export function withFeatureGate<P extends object>(
  feature: Feature,
  Component: ComponentType<P>
) {
  function FeatureGated(props: P) {
    return useFeatureVisible(feature) ? <Component {...props} /> : null;
  }

  FeatureGated.displayName = `withFeatureGate(${
    Component.displayName || Component.name || "Component"
  })`;

  return FeatureGated;
}
