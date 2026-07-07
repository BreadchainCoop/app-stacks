import { goalSavingCirclesAbi } from "@/lib/abis/goal-saving-circles";
import { GOAL_SAVINGS_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useReadContract } from "wagmi";

/**
 * Members and their current locked contributions, aligned by index
 * (getMemberContributions).
 */
export function useGoalContributions(goalId: bigint | undefined) {
  const result = useReadContract({
    address: GOAL_SAVINGS_CONTRACT_ADDRESS,
    abi: goalSavingCirclesAbi,
    functionName: "getMemberContributions",
    args: goalId !== undefined ? [goalId] : undefined,
    query: {
      enabled: goalId !== undefined,
    },
    chainId: getDefaultChainId(),
  });

  const [members, amounts] = result.data ?? [];

  return {
    ...result,
    members: members ?? [],
    contributions: (members ?? []).map((member, index) => ({
      member,
      amount: amounts?.[index] ?? BigInt(0),
    })),
  };
}
