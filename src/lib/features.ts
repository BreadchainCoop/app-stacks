import { clientEnv } from "./env";

type Environment = (typeof clientEnv)["NEXT_PUBLIC_NODE_ENV"];

// Local always renders every feature, so it never needs to be listed per
// feature — only the non-local environments are configured below.
type GatedEnvironment = Exclude<Environment, "local">;

/**
 * Maps each feature to the environments it is allowed to render in. Local is
 * implicitly always enabled, so list only "development" / "demo" / "production".
 * Add a feature here, then gate it with <FeatureGate> or withFeatureGate
 * (see @/components/feature-gate).
 */
export const FEATURE_ENVIRONMENTS = {
  automaticClaim: ["development"],
} satisfies Record<string, GatedEnvironment[]>;

export type Feature = keyof typeof FEATURE_ENVIRONMENTS;

export function isFeatureEnabled(feature: Feature): boolean {
  const env = clientEnv.NEXT_PUBLIC_NODE_ENV;
  if (env === "local") return true;

  const allowed: readonly GatedEnvironment[] = FEATURE_ENVIRONMENTS[feature];
  return allowed.includes(env);
}
