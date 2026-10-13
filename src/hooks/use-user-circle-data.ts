import { savingCirclesViewerAbi } from "@/lib/abis/saving-circles-viewers";
import {
  useActiveChainId,
  useChainConfig,
} from "@/components/providers/active-chain";
import { useConnectedUser } from "@breadcoop/ui";
import { keepPreviousData } from "@tanstack/react-query";
import { Address } from "viem";
import { useReadContract } from "wagmi";

export function useUserCircleData({
  circleId,
  member,
  enabled,
  keepPrevious,
}: {
  circleId: bigint;
  member?: Address;
  enabled?: boolean;
  /**
   * Keep returning the previous member's result while the next one loads,
   * instead of going back to loading. Only for a read that stays enabled: a
   * disabled query would keep showing the previous member's data.
   */
  keepPrevious?: boolean;
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
      placeholderData: keepPrevious ? keepPreviousData : undefined,
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
