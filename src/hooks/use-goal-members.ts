import { goalSavingCirclesAbi } from "@/lib/abis/goal-saving-circles";
import {
  useActiveChainId,
  useChainConfig,
} from "@/components/providers/active-chain";
import { useReadContract } from "wagmi";

/**
 * Members and their current locked contributions, aligned by index
 * (getMemberContributions).
 */
export function useGoalContributions(goalId: bigint | undefined) {
  const result = useReadContract({
    address: useChainConfig().goalSavings,
    abi: goalSavingCirclesAbi,
    functionName: "getMemberContributions",
    args: goalId !== undefined ? [goalId] : undefined,
    query: {
      enabled: goalId !== undefined,
    },
    chainId: useActiveChainId(),
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
