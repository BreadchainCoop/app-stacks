import { useReadContracts } from "wagmi";
import { SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS } from "../lib/constants";
import { savingCirclesViewerAbi } from "../lib/abis/saving-circles-viewers";
import { ICircleList } from "@/interfaces/circle";
import { useTotalCircles } from "./use-total-circles";
import { formatEther, zeroAddress } from "viem";
import { getDefaultChainId } from "@/utils/chain";
import { useBlockTimestamp } from "./use-block-timestamp";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";
import { useCirclesState } from "./use-circles-state";
import { CircleState } from "@/lib/circle-state";
import { useConnectedUser } from "@breadcoop/ui";

const PAGE_SIZE = 40;
type UserCircleData = Parameters<typeof getUserCircleStatus>[0]["circle"];

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

  const { stateById } = useCirclesState(circleIds);

  const circles: ICircleList[] = [];

  if (rawResults) {
    const now = BigInt(Math.floor(blockTimestamp / 1000));

    for (let i = 0; i < circleIds.length; i++) {
      const circleResult = rawResults[i];

      if (circleResult.status === "failure") {
        continue;
      }

      const circleData = circleResult.result as unknown as UserCircleData;
      const status = getUserCircleStatus({
        circle: circleData,
        now,
        circleState:
          stateById.get(circleData.circleId.toString()) ?? CircleState.Active,
      }).status;

      const base = {
        ...circleData.circleInfo,
        id: circleData.circleId,
        totalMember: Number(circleData.totalRounds),
        status,
        totalPoolBalance: circleData.totalPoolBalance,
        isMember: circleData.isMember,
        isDecommissionable: circleData.isDecommissionable,
        userBalance: circleData.userBalance,
      };

      if (circleData.canWithdraw) {
        circles.push({
          ...base,
          canWithdraw: true,
          withdrawAmount:
            Number(formatEther(circleData.circleInfo.depositAmount)) *
            Number(circleData.totalRounds),
        });
      } else {
        circles.push({ ...base, canWithdraw: false });
      }
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
