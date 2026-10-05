import { goalSavingCirclesAbi } from "@/lib/abis/goal-saving-circles";
import { GoalInfo } from "@/hooks/use-goal";
import { GoalState } from "@/lib/goal-state";
import {
  useActiveChainId,
  useChainConfig,
} from "@/components/providers/active-chain";
import { Address } from "viem";
import { useReadContract, useReadContracts } from "wagmi";

export type MemberGoal = {
  id: bigint;
  goal: GoalInfo;
  state: GoalState;
  totalDeposited: bigint;
};

/**
 * The goals the connected member belongs to (getMemberGoals reverse index),
 * each zipped with its getGoal config, goalState and totalDeposited via one
 * batched multicall (3 reads per goal).
 */
export function useGoalMemberGoals(member: Address | undefined) {
  // Built per render rather than at module scope: the address and chain follow
  // the active chain, which is only known inside a component.
  const goalContract = {
    address: useChainConfig().goalSavings,
    abi: goalSavingCirclesAbi,
    chainId: useActiveChainId(),
  } as const;

  const idsResult = useReadContract({
    ...goalContract,
    functionName: "getMemberGoals",
    args: member ? [member] : undefined,
    query: {
      enabled: !!member,
    },
  });

  const ids = idsResult.data ?? [];

  const { data: goalResults, isLoading: goalsLoading } = useReadContracts({
    contracts: ids.flatMap((id) => [
      {
        ...goalContract,
        functionName: "getGoal" as const,
        args: [id] as const,
      },
      {
        ...goalContract,
        functionName: "goalState" as const,
        args: [id] as const,
      },
      {
        ...goalContract,
        functionName: "totalDeposited" as const,
        args: [id] as const,
      },
    ]),
    query: {
      enabled: ids.length > 0,
    },
  });

  const goals: MemberGoal[] = ids.flatMap((id, index) => {
    const goalResult = goalResults?.[index * 3];
    const stateResult = goalResults?.[index * 3 + 1];
    const depositedResult = goalResults?.[index * 3 + 2];
    if (goalResult?.status !== "success") return [];

    return [
      {
        id,
        goal: goalResult.result as GoalInfo,
        state:
          stateResult?.status === "success"
            ? (Number(stateResult.result) as GoalState)
            : GoalState.Funding,
        totalDeposited:
          depositedResult?.status === "success"
            ? (depositedResult.result as bigint)
            : BigInt(0),
      },
    ];
  });

  return {
    goals,
    isLoading: idsResult.isLoading || goalsLoading,
    error: idsResult.error,
  };
}
