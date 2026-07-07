import { collectiveFundCirclesAbi } from "@/lib/abis/collective-fund-circles";
import { COLLECTIVE_FUND_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useReadContract, useReadContracts } from "wagmi";

const collectiveContract = {
  address: COLLECTIVE_FUND_CONTRACT_ADDRESS,
  abi: collectiveFundCirclesAbi,
} as const;

/** The ordered member roster of a fund (getFundMembers). */
export function useCollectiveFundMembers(fundId: bigint | undefined) {
  return useReadContract({
    ...collectiveContract,
    functionName: "getFundMembers",
    args: fundId !== undefined ? [fundId] : undefined,
    query: {
      enabled: fundId !== undefined,
    },
    chainId: getDefaultChainId(),
  });
}

/**
 * The member roster plus each member's share balance (batched sharesOf
 * multicall).
 */
export function useCollectiveMembersWithShares(fundId: bigint | undefined) {
  const membersResult = useCollectiveFundMembers(fundId);
  const members = membersResult.data ?? [];

  const contracts = members.map((member) => ({
    ...collectiveContract,
    functionName: "sharesOf" as const,
    args: [fundId ?? BigInt(0), member] as const,
    chainId: getDefaultChainId(),
  }));

  const { data: shareResults, isLoading: sharesLoading } = useReadContracts({
    contracts,
    query: {
      enabled: fundId !== undefined && members.length > 0,
    },
  });

  const positions = members.map((member, index) => {
    const shareResult = shareResults?.[index];

    return {
      member,
      shares:
        shareResult?.status === "success"
          ? (shareResult.result as bigint)
          : BigInt(0),
    };
  });

  return {
    members,
    positions,
    isLoading: membersResult.isLoading || sharesLoading,
  };
}
