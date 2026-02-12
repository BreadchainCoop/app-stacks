import { savingCirclesViewerAbi } from "@/lib/abis/saving-circles-viewers";
import { SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useConnectedUser } from "@breadcoop/ui";
import { Address } from "viem";
import { useReadContract } from "wagmi";

export function useUserCircleData({
  circleId,
  member,
  enabled,
}: {
  circleId: bigint;
  member?: Address;
  enabled?: boolean;
}) {
  const { user: connectedUser } = useConnectedUser();
  const isConnected =
    connectedUser.status === "CONNECTED" ||
    connectedUser.status === "UNSUPPORTED_CHAIN";
  const address = isConnected ? connectedUser.address : undefined;
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
      // enabled: user !== undefined,
      enabled: enabled !== undefined ? enabled : user !== undefined,
      refetchOnWindowFocus: false,
    },
    chainId: getDefaultChainId(),
  });

  console.log("__ ERROR __", error);

  return {
    circleData,
    isLoading,
    error,
    refetch,
    isConnected,
  };
}
