import { clientEnv } from "@/lib/env";
import {
  DELEGATED_SAVING_CIRCLES_CONTRACT_ADDRESS,
  SAVING_CIRCLES_CONTRACT_ADDRESS,
} from "@/lib/constants";
import { Address } from "viem";
import { getDefaultChainId } from "@/utils/chain";

export const AUTOPAY_AUTH_DOMAIN_NAME = "StacksAutopayLit";
export const AUTOPAY_AUTH_DOMAIN_VERSION = "1";
export const AUTOPAY_ALL_CIRCLES_SENTINEL = BigInt(0);

export type AutopayAuthorizationScope = "circle" | "all_circles";

export type AutopayAuthorizationRecord = {
  circleId: string;
  member: Address;
  scope: AutopayAuthorizationScope;
  chainId: number;
  delegatedContract: Address;
  savingCirclesContract: Address;
  litPolicyId: string;
  litNetwork: string;
  signature: `0x${string}`;
  createdAt: string;
  active: boolean;
};

export type AutopayExecutionResult = {
  circleId: string;
  member: Address;
  status: "success" | "error" | "skipped";
  message: string;
  updatedAt: string;
  txHash?: `0x${string}`;
  executor?: Address;
};

export type AutopayStateResponse = {
  authorization: AutopayAuthorizationRecord | null;
  result: AutopayExecutionResult | null;
};

export function getAutopayAuthorizationKey(
  circleId: bigint,
  member: Address,
  scope: AutopayAuthorizationScope = "circle"
) {
  if (scope === "all_circles") {
    return `all:${member.toLowerCase()}`;
  }

  return `${circleId.toString()}:${member.toLowerCase()}`;
}

export function getAutopayAuthorizationLookupKeys(
  circleId: bigint,
  member: Address
) {
  return [
    getAutopayAuthorizationKey(circleId, member, "circle"),
    getAutopayAuthorizationKey(circleId, member, "all_circles"),
  ] as const;
}

export function getAutopayAuthorizationScopeLabel(
  scope: AutopayAuthorizationScope
) {
  return scope === "all_circles" ? "All circles" : "This circle";
}

function toTypedDataNumber(value: bigint | number) {
  const asBigInt = typeof value === "bigint" ? value : BigInt(value);
  return asBigInt <= BigInt(Number.MAX_SAFE_INTEGER)
    ? Number(asBigInt)
    : asBigInt.toString();
}

export function buildAutopayAuthorizationTypedData({
  circleId,
  member,
  delegatedContract,
  scope = "circle",
}: {
  circleId: bigint;
  member: Address;
  delegatedContract: Address;
  scope?: AutopayAuthorizationScope;
}) {
  const signedCircleId =
    scope === "all_circles" ? AUTOPAY_ALL_CIRCLES_SENTINEL : circleId;

  return {
    domain: {
      name: AUTOPAY_AUTH_DOMAIN_NAME,
      version: AUTOPAY_AUTH_DOMAIN_VERSION,
      chainId: getDefaultChainId(),
      verifyingContract: SAVING_CIRCLES_CONTRACT_ADDRESS,
    },
    types: {
      AutopayAuthorization: [
        { name: "circleId", type: "uint256" },
        { name: "scope", type: "string" },
        { name: "member", type: "address" },
        { name: "delegatedContract", type: "address" },
        { name: "policyId", type: "string" },
      ],
    },
    primaryType: "AutopayAuthorization" as const,
    message: {
      circleId: toTypedDataNumber(signedCircleId),
      scope,
      member,
      delegatedContract,
      policyId: clientEnv.NEXT_PUBLIC_LIT_AUTOPAY_POLICY_ID || "",
    },
  };
}

export function getAutopayFeatureConfig() {
  const delegatedContract = DELEGATED_SAVING_CIRCLES_CONTRACT_ADDRESS;
  const litPolicyId = clientEnv.NEXT_PUBLIC_LIT_AUTOPAY_POLICY_ID;
  const litNetwork = clientEnv.NEXT_PUBLIC_LIT_AUTOPAY_NETWORK;

  return {
    delegatedContract,
    litPolicyId,
    litNetwork,
    isConfigured: Boolean(delegatedContract && litPolicyId && litNetwork),
  };
}
