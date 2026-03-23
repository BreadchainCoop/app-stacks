"use client";

import { useQuery } from "@tanstack/react-query";
import { useReadContract } from "wagmi";
import { Address, erc20Abi } from "viem";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { delegatedSavingCirclesAbi } from "@/lib/abis/delegated-saving-circles";
import { getAutopayFeatureConfig, AutopayStateResponse } from "@/lib/autopay";
import { getDefaultChainId } from "@/utils/chain";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";

export function useAutopayStatus({
  circle,
  member,
}: {
  circle: Exclude<
    ReturnType<typeof useUserCircleData>["circleData"],
    undefined
  >;
  member: Address;
}) {
  const { delegatedContract, isConfigured } = getAutopayFeatureConfig();
  const enabled = isConfigured && member !== undefined;
  const expectedAllowance =
    circle.circleInfo.depositAmount * circle.totalRounds;

  const { data: delegatedEnabled = false } = useReadContract({
    address: delegatedContract,
    abi: delegatedSavingCirclesAbi,
    functionName: "isDelegatedDepositsEnabled",
    args: [member],
    chainId: getDefaultChainId(),
    query: {
      enabled: enabled && !!delegatedContract,
    },
  });

  const { data: allowance = BigInt(0) } = useReadContract({
    address: circle.circleInfo.token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [member, delegatedContract!],
    chainId: getDefaultChainId(),
    query: {
      enabled: enabled && !!delegatedContract,
    },
  });

  const stateQuery = useQuery<AutopayStateResponse>({
    queryKey: ["autopay-state", circle.circleId.toString(), member],
    enabled,
    queryFn: async () => {
      const response = await fetch(
        `/api/autopay/state?circleId=${circle.circleId.toString()}&member=${member}`
      );
      const json = (await response.json()) as
        | ({ success: true } & AutopayStateResponse)
        | { success: false; error: string };

      if (!response.ok || !json.success) {
        throw new Error(
          "error" in json ? json.error : "Failed to load autopay state"
        );
      }

      return {
        authorization: json.authorization,
        result: json.result,
      };
    },
    refetchInterval: 15000,
  });

  const userStatus = getUserCircleStatus(circle, member, {
    includeClaimable: true,
    includeDeposited: true,
  });

  return {
    isConfigured,
    delegatedContract,
    delegatedEnabled,
    allowance,
    expectedAllowance,
    allowanceReady: allowance >= expectedAllowance,
    authorization: stateQuery.data?.authorization ?? null,
    lastResult: stateQuery.data?.result ?? null,
    isLoadingState: stateQuery.isLoading,
    refetchState: stateQuery.refetch,
    eligibleForAutomatedDeposit:
      circle.isMember &&
      delegatedEnabled &&
      allowance >= expectedAllowance &&
      Boolean(stateQuery.data?.authorization?.active) &&
      userStatus.status === "payment_due",
  };
}
