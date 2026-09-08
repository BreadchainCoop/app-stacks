import { useReadContract } from "wagmi";
import { SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS } from "@/lib/constants";
import { savingCirclesViewerAbi } from "@/lib/abis/saving-circles-viewers";
import { Address } from "viem";
import { formatDepositAmount } from "@/lib/deposit-token";
import { ICircleList } from "@/interfaces/circle";
import { useMemo } from "react";
import { getDefaultChainId } from "@/utils/chain";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";
import { useBlockTimestamp } from "./use-block-timestamp";
import { useCirclesState } from "./use-circles-state";
import { CircleState } from "@/lib/circle-state";

type UserCircleData = Parameters<typeof getUserCircleStatus>[0]["circle"];

const parseCircleData = (
  c: UserCircleData,
  now: bigint,
  circleState: CircleState
): ICircleList => {
  const totalRounds = c.totalRounds;
  const formattedStatus = getUserCircleStatus({
    circle: c,
    config: { includeClaimable: true },
    now,
    circleState,
  });

  const circle = {
    ...c.circleInfo,
    totalMember: Number(totalRounds),
    id: c.circleId,
    status: formattedStatus.status,
    totalPoolBalance: c.totalPoolBalance,
    isMember: c.isMember,
    isDecommissionable: c.isDecommissionable,
    userBalance: c.userBalance,
    depositWindowEnd: c.depositWindowEnd,
  };

  if (c.canWithdraw) {
    return {
      ...circle,
      canWithdraw: true,
      withdrawAmount:
        Number(formatDepositAmount(c.circleInfo.depositAmount)) *
        Number(totalRounds),
    };
  }

  return {
    ...circle,
    canWithdraw: false,
  };
};

export function useUserCirclesList(address: Address) {
  const blockTimestamp = useBlockTimestamp();
  const { data, isLoading, error } = useReadContract({
    address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
    abi: savingCirclesViewerAbi,
    functionName: "getComprehensiveUserData",
    args: [address],
    chainId: getDefaultChainId(),
    query: {
      enabled: Boolean(address),
    },
  });

  const circleIds = useMemo(
    () => (data ? data.circleData.map((circle) => circle.circleId) : []),
    [data]
  );
  const { stateById } = useCirclesState(circleIds);

  const circles = useMemo(() => {
    if (!data) return [];

    const now = BigInt(Math.floor(blockTimestamp / 1000));

    return data.circleData.map((circle) =>
      parseCircleData(
        circle as UserCircleData,
        now,
        stateById.get(circle.circleId.toString()) ?? CircleState.Active
      )
    );
  }, [address, blockTimestamp, data, stateById]);

  return {
    circles,
    financialSummary: data?.financialSummary,
    isLoading,
    error,
  };
}
