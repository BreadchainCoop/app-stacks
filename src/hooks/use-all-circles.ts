import { useReadContracts } from "wagmi";
import { SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS } from "../lib/constants";
import { savingCirclesViewerAbi } from "../lib/abis/saving-circles-viewers";
import { ICircleList } from "@/interfaces/circle";
import { useTotalCircles } from "./use-total-circles";
import { zeroAddress } from "viem";
import { getDefaultChainId } from "@/utils/chain";
import { useBlockTimestamp } from "./use-block-timestamp";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";
import { useConnectedUser } from "@breadcoop/ui";

const PAGE_SIZE = 9;
type UserCircleData = Parameters<typeof getUserCircleStatus>[0];

export function useAllCircles(page: number = 0) {
  const skip = page * PAGE_SIZE;
  const blockTimestamp = useBlockTimestamp();
  const { user } = useConnectedUser();
  const memberAddress =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : zeroAddress;

  const { total: totalCircles, isLoading: loadingTotal } = useTotalCircles();

  const hasMore = skip + PAGE_SIZE < totalCircles;

  const circleIds = Array.from(
    { length: Math.min(PAGE_SIZE, totalCircles - skip) },
    (_, i) => BigInt(skip + i)
  );

  const { data: rawResults, isLoading: loadingCircles } = useReadContracts({
    contracts: circleIds.map((id) => ({
      address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
      abi: savingCirclesViewerAbi,
      functionName: "getUserCircleData",
      args: [memberAddress, id],
      chainId: getDefaultChainId(),
    })),
    query: {
      enabled: circleIds.length > 0,
    },
  });

  const circles: ICircleList[] = [];

  if (rawResults) {
    const now = BigInt(Math.floor(blockTimestamp / 1000));

    for (let i = 0; i < circleIds.length; i++) {
      const circleResult = rawResults[i];

      if (circleResult.status === "failure") {
        continue;
      }

      const circleData = circleResult.result as unknown as UserCircleData;
      const formattedStatus = getUserCircleStatus(
        circleData,
        memberAddress,
        {},
        now
      );

      circles.push({
        ...circleData.circleInfo,
        id: circleData.circleId,
        totalMember: Number(circleData.totalRounds),
        status: formattedStatus.status,
        roundState: formattedStatus.roundState,
        totalPoolBalance: circleData.totalPoolBalance,
        isMember: circleData.isMember,
        isDecommissionable: circleData.isDecommissionable,
        userBalance: circleData.userBalance,
      });
    }
  }

  return {
    data: circles,
    isLoading: loadingTotal || loadingCircles,
    total: totalCircles,
    hasMore,
    page,
  };
}
