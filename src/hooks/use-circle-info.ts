import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useReadContract } from "wagmi";

export function useCircleInfo(circleId: bigint | undefined) {
	const {
		data: circle,
		isLoading,
		isFetching,
		error,
		refetch,
	} = useReadContract({
		address: SAVING_CIRCLES_CONTRACT_ADDRESS,
		abi: savingCirclesAbi,
		functionName: "getCircle",
		args: circleId !== undefined ? [circleId] : undefined,
		query: {
			enabled: circleId !== undefined,
		},
		chainId: getDefaultChainId(),
	});

	return {
		circle,
		isLoading,
		error,
		refetch,
	};
}
