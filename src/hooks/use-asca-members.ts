import { accumulatingSavingCirclesAbi } from "@/lib/abis/accumulating-saving-circles";
import { ASCA_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useReadContract, useReadContracts } from "wagmi";

const ascaContract = {
  address: ASCA_CONTRACT_ADDRESS,
  abi: accumulatingSavingCirclesAbi,
  chainId: getDefaultChainId(),
} as const;

/** The ordered member roster of a fund (getFundMembers). */
export function useAscaFundMembers(fundId: bigint | undefined) {
  return useReadContract({
    ...ascaContract,
    functionName: "getFundMembers",
    args: fundId !== undefined ? [fundId] : undefined,
    query: {
      enabled: fundId !== undefined,
    },
    chainId: getDefaultChainId(),
  });
}

/**
 * The member roster plus each member's savings and whether their loan is
 * currently liquidatable (batched savings/isLiquidatable multicall).
 */
export function useAscaMembersWithPositions(fundId: bigint | undefined) {
  const membersResult = useAscaFundMembers(fundId);
  const members = membersResult.data ?? [];

  const contracts = members.flatMap((member) => [
    {
      ...ascaContract,
      functionName: "savings" as const,
      args: [fundId ?? BigInt(0), member] as const,
      chainId: getDefaultChainId(),
    },
    {
      ...ascaContract,
      functionName: "isLiquidatable" as const,
      args: [fundId ?? BigInt(0), member] as const,
      chainId: getDefaultChainId(),
    },
  ]);

  const { data: positionResults, isLoading: positionsLoading } =
    useReadContracts({
      contracts,
      query: {
        enabled: fundId !== undefined && members.length > 0,
      },
    });

  const positions = members.map((member, index) => {
    const savingsResult = positionResults?.[index * 2];
    const liquidatableResult = positionResults?.[index * 2 + 1];

    return {
      member,
      savings:
        savingsResult?.status === "success"
          ? (savingsResult.result as bigint)
          : BigInt(0),
      isLiquidatable:
        liquidatableResult?.status === "success"
          ? (liquidatableResult.result as boolean)
          : false,
    };
  });

  return {
    members,
    positions,
    isLoading: membersResult.isLoading || positionsLoading,
  };
}
