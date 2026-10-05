import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import {
  useActiveChainId,
  useChainConfig,
} from "@/components/providers/active-chain";
import { useReadContract } from "wagmi";

export function useCircleMembers(circleId: bigint | undefined) {
  const chainId = useActiveChainId();

  return useReadContract({
    address: useChainConfig().savingCircles,
    abi: savingCirclesAbi,
    functionName: "getCircleMembers",
    args: circleId !== undefined ? [circleId] : undefined,
    query: {
      enabled: circleId !== undefined,
    },
    chainId,
  });
}

export function useCircleMembersWithBalances(circleId: bigint | undefined) {
  const chainId = useActiveChainId();

  const { data: members, isLoading: membersLoading } =
    useCircleMembers(circleId);

  const { data: balanceData, isLoading: balancesLoading } = useReadContract({
    address: useChainConfig().savingCircles,
    abi: savingCirclesAbi,
    functionName: "getMemberBalances",
    args: circleId !== undefined ? [circleId] : undefined,
    query: {
      enabled: circleId !== undefined,
    },
    chainId,
  });

  return {
    members: members || [],
    memberBalances: balanceData
      ? {
          members: balanceData[0],
          balances: balanceData[1],
        }
      : null,
    isLoading: membersLoading || balancesLoading,
  };
}
