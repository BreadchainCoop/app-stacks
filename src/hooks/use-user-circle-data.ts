import { savingCirclesViewerAbi } from "@/lib/abis/saving-circles-viewers";
import {
  useActiveChainId,
  useChainConfig,
} from "@/components/providers/active-chain";
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
    address: useChainConfig().savingCirclesViewer,
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
    chainId: useActiveChainId(),
  });

  return {
    circleData,
    isLoading,
    error,
    refetch,
    isConnected,
  };
}
