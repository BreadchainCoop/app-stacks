import { savingCirclesViewerAbi } from "@/lib/abis/saving-circles-viewers";
import { SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { Address } from "viem";
import { useAccount, useReadContract } from "wagmi";

export function useUserCircleData({
	circleId,
	member,
}: {
	circleId: bigint;
	member?: Address;
}) {
	const { address, isConnected } = useAccount();
	const user = member || address;

	const {
		data: circleData,
		isLoading,
		error,
		refetch,
	} = useReadContract({
		address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
		abi: savingCirclesViewerAbi,
		functionName: "getUserCircleData",
		// args:
		// 	address && circleId !== undefined ? [address, circleId] : undefined,
    args: [user!, circleId],
		query: {
			// enabled:
			// 	isConnected && address !== undefined && circleId !== undefined,
      enabled: user !== undefined
		},
		chainId: getDefaultChainId(),
	});

	return {
		circleData,
		isLoading,
		error,
		refetch,
		isConnected,
	};
}
