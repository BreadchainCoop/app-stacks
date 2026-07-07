import { goalSavingCirclesAbi } from "@/lib/abis/goal-saving-circles";
import { GOAL_SAVINGS_CONTRACT_ADDRESS } from "@/lib/constants";
import { GoalState } from "@/lib/goal-state";
import { getDefaultChainId } from "@/utils/chain";
import { useReadContract } from "wagmi";

/** A goal's immutable configuration (getGoal). */
export function useGoal(goalId: bigint | undefined) {
  return useReadContract({
    address: GOAL_SAVINGS_CONTRACT_ADDRESS,
    abi: goalSavingCirclesAbi,
    functionName: "getGoal",
    args: goalId !== undefined ? [goalId] : undefined,
    query: {
      enabled: goalId !== undefined,
    },
    chainId: getDefaultChainId(),
  });
}

export type GoalInfo = NonNullable<ReturnType<typeof useGoal>["data"]>;

/** The goal's derived lifecycle state (goalState). */
export function useGoalState(goalId: bigint | undefined) {
  const result = useReadContract({
    address: GOAL_SAVINGS_CONTRACT_ADDRESS,
    abi: goalSavingCirclesAbi,
    functionName: "goalState",
    args: goalId !== undefined ? [goalId] : undefined,
    query: {
      enabled: goalId !== undefined,
    },
    chainId: getDefaultChainId(),
  });

  return {
    ...result,
    state: result.data !== undefined ? (result.data as GoalState) : undefined,
  };
}

/** The goal's current escrowed pot (totalDeposited). */
export function useGoalTotalDeposited(goalId: bigint | undefined) {
  return useReadContract({
    address: GOAL_SAVINGS_CONTRACT_ADDRESS,
    abi: goalSavingCirclesAbi,
    functionName: "totalDeposited",
    args: goalId !== undefined ? [goalId] : undefined,
    query: {
      enabled: goalId !== undefined,
    },
    chainId: getDefaultChainId(),
  });
}
