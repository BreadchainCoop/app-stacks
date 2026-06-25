"use client";

import { type Feature, isFeatureEnabled } from "@/lib/features";
import type { ComponentType, ReactNode } from "react";

/**
 * Renders `children` only when `feature` is enabled in the current
 * environment, otherwise renders `fallback` (nothing by default).
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
  return <>{isFeatureEnabled(feature) ? children : fallback}</>;
}

/**
 * HOC variant of {@link FeatureGate}: wraps a component so it only renders
 * when `feature` is enabled in the current environment.
 */
export function withFeatureGate<P extends object>(
  feature: Feature,
  Component: ComponentType<P>
) {
  function FeatureGated(props: P) {
    return isFeatureEnabled(feature) ? <Component {...props} /> : null;
  }

  FeatureGated.displayName = `withFeatureGate(${
    Component.displayName || Component.name || "Component"
  })`;

  return FeatureGated;
}
