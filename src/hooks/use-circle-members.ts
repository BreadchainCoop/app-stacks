import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useReadContract } from "wagmi";

export function useCircleMembers(circleId: bigint | undefined) {
	return useReadContract({
		address: SAVING_CIRCLES_CONTRACT_ADDRESS,
		abi: savingCirclesAbi,
		functionName: "getCircleMembers",
		args: circleId !== undefined ? [circleId] : undefined,
		query: {
			enabled: circleId !== undefined,
		},
		chainId: getDefaultChainId(),
	});
}

export function useCircleMembersWithBalances(circleId: bigint | undefined) {
	const { data: members, isLoading: membersLoading } =
		useCircleMembers(circleId);

	const { data: balanceData, isLoading: balancesLoading } = useReadContract({
		address: SAVING_CIRCLES_CONTRACT_ADDRESS,
		abi: savingCirclesAbi,
		functionName: "getMemberBalances",
		args: circleId !== undefined ? [circleId] : undefined,
		query: {
			enabled: circleId !== undefined,
		},
		chainId: getDefaultChainId(),
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
