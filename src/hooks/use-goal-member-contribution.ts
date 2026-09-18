import { goalSavingCirclesAbi } from "@/lib/abis/goal-saving-circles";
import { GOAL_SAVINGS_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { Address, zeroAddress } from "viem";
import { useReadContracts } from "wagmi";

const goalContract = {
  address: GOAL_SAVINGS_CONTRACT_ADDRESS,
  abi: goalSavingCirclesAbi,
  chainId: getDefaultChainId(),
} as const;

/**
 * A member's position in a goal: membership plus their current locked
 * contribution, batched into one multicall.
 */
export function useGoalMemberContribution(
  goalId: bigint | undefined,
  member: Address | undefined
) {
  const id = goalId ?? BigInt(0);
  const account = member ?? zeroAddress;

  const result = useReadContracts({
    contracts: [
      { ...goalContract, functionName: "isMember", args: [id, account] },
      { ...goalContract, functionName: "contributions", args: [id, account] },
    ],
    query: {
      enabled: goalId !== undefined && !!member,
    },
  });

  const [isMember, contribution] = result.data ?? [];

  const position =
    isMember?.status === "success"
      ? {
          isMember: isMember.result,
          contribution: contribution?.result ?? BigInt(0),
        }
      : undefined;

  return { ...result, position };
}
