import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
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
		chainId: 31337,
	});

	return {
		circle,
		isLoading,
		error,
		refetch,
	};
}
