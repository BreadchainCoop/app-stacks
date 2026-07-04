import { clientEnv } from "./env";

/**
 * All gateable features. Add a feature here, configure it per deployment via
 * the NEXT_PUBLIC_FEATURES env var, then gate it with <FeatureGate> or
 * withFeatureGate (see @/components/feature-gate).
 *
 * NEXT_PUBLIC_FEATURES is a JSON object keyed by feature name:
 *
 *   {"automaticClaim":{"enabled":true,"addresses":["0x6532..."]}}
 *
 * - feature key absent or `enabled: false` -> hidden in that deployment
 * - `addresses` present -> only those connected wallets see the feature
 * - `addresses` absent or empty -> every user sees it
 * - local always renders every feature regardless of config
 */
export const FEATURES = ["automaticClaim"] as const;

export type Feature = (typeof FEATURES)[number];

export function isFeatureVisible(
  feature: Feature,
  connectedAddress?: string
): boolean {
  if (clientEnv.NEXT_PUBLIC_NODE_ENV === "local") return true;

  const config = clientEnv.NEXT_PUBLIC_FEATURES[feature];
  if (!config?.enabled) return false;
  if (!config.addresses || config.addresses.length === 0) return true;

  if (!connectedAddress) return false;

  const normalized = connectedAddress.toLowerCase();
  return config.addresses.some(
    (address) => address.toLowerCase() === normalized
  );
}
