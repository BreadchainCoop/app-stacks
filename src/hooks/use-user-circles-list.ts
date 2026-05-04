import { useReadContract, useReadContracts } from "wagmi";
import {
  SAVING_CIRCLES_CONTRACT_ADDRESS,
  SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
} from "@/lib/constants";
import { savingCirclesViewerAbi } from "@/lib/abis/saving-circles-viewers";
import { Address, formatEther } from "viem";
import { ICircleList } from "@/interfaces/circle";
import { useMemo } from "react";
import { getDefaultChainId } from "@/utils/chain";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";
import { useBlockTimestamp } from "./use-block-timestamp";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";

type UserCircleData = Parameters<typeof getUserCircleStatus>[0];

export function useUserCirclesList(address: Address) {
  const blockTimestamp = useBlockTimestamp();
  const {
    data: userCircleIds,
    isLoading: loadingUserCircleIds,
    error,
  } = useReadContract({
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    abi: savingCirclesAbi,
    functionName: "getMemberCircles",
    args: [address],
    chainId: getDefaultChainId(),
    query: {
      enabled: Boolean(address),
    },
  });

  const circleIds = useMemo(() => userCircleIds ?? [], [userCircleIds]);

  const {
    data: rawResults,
    isLoading: loadingCircles,
    error: circlesError,
  } = useReadContracts({
    contracts: circleIds.map((id) => ({
      address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
      abi: savingCirclesViewerAbi,
      functionName: "getUserCircleData",
      args: [address, id],
      chainId: getDefaultChainId(),
    })),
    query: {
      enabled: Boolean(address) && circleIds.length > 0,
    },
  });

  const circles = useMemo(() => {
    if (!rawResults) return [];

    const now = BigInt(Math.floor(blockTimestamp / 1000));
    const parsedCircles: ICircleList[] = [];

    for (const result of rawResults) {
      if (result.status === "failure") continue;

      const c = result.result as unknown as UserCircleData;
      const totalRounds = c.totalRounds;

      const status = getUserCircleStatus(
        c,
        address,
        { includeClaimable: true },
        now
      ).status;

      const circle = {
        ...c.circleInfo,
        totalMember: Number(totalRounds),
        id: c.circleId,
        status,
        totalPoolBalance: c.totalPoolBalance,
        isMember: c.isMember,
        isDecommissionable: c.isDecommissionable,
        userBalance: c.userBalance,
      };

      if (c.canWithdraw) {
        parsedCircles.push({
          ...circle,
          canWithdraw: true,
          withdrawAmount:
            Number(formatEther(c.circleInfo.depositAmount)) *
            Number(totalRounds),
        });
      } else {
        parsedCircles.push({
          ...circle,
          canWithdraw: false,
        });
      }
    }

    return parsedCircles;
  }, [address, blockTimestamp, rawResults]);

  return {
    circles,
    isLoading: loadingUserCircleIds || loadingCircles,
    error: error || circlesError,
  };
}
