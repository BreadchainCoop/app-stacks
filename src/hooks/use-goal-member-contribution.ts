import { goalSavingCirclesAbi } from "@/lib/abis/goal-saving-circles";
import {
  useActiveChainId,
  useChainConfig,
} from "@/components/providers/active-chain";
import { Address, zeroAddress } from "viem";
import { useReadContracts } from "wagmi";

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

  // Built per render rather than at module scope: the address and chain follow
  // the active chain, which is only known inside a component.
  const goalContract = {
    address: useChainConfig().goalSavings,
    abi: goalSavingCirclesAbi,
    chainId: useActiveChainId(),
  } as const;

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
