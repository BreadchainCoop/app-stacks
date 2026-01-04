import { savingCirclesViewerAbi } from "@/lib/abis/saving-circles-viewers";
import { SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useAccount, useReadContract } from "wagmi";

export function useUserCircleData(circleId: bigint | undefined) {
  const { address, isConnected } = useAccount();

  const {
		data: circleData,
		isLoading,
		error,
		refetch,
  } = useReadContract({
		address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
		abi: savingCirclesViewerAbi,
		functionName: "getUserCircleData",
		args:
			address && circleId !== undefined ? [address, circleId] : undefined,
		query: {
			enabled:
				isConnected && address !== undefined && circleId !== undefined,
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
