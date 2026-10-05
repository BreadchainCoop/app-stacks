import { useReadContract } from "wagmi";
import { savingCirclesViewerAbi } from "@/lib/abis/saving-circles-viewers";
import { Address } from "viem";
import { formatDepositAmount } from "@/lib/deposit-token";
import { ICircleList } from "@/interfaces/circle";
import { useMemo } from "react";
import {
  useActiveChainId,
  useChainConfig,
  useDepositToken,
} from "@/components/providers/active-chain";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";
import { useBlockTimestamp } from "./use-block-timestamp";
import { useCirclesState } from "./use-circles-state";
import { CircleState } from "@/lib/circle-state";

type UserCircleData = Parameters<typeof getUserCircleStatus>[0]["circle"];

const parseCircleData = (
  c: UserCircleData,
  now: bigint,
  circleState: CircleState,
  decimals: number
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
        Number(formatDepositAmount(c.circleInfo.depositAmount, decimals)) *
        Number(totalRounds),
    };
  }

  return {
    ...circle,
    canWithdraw: false,
  };
};

export function useUserCirclesList(address: Address) {
  const depositToken = useDepositToken();
  const blockTimestamp = useBlockTimestamp();
  const { data, isLoading, error } = useReadContract({
    address: useChainConfig().savingCirclesViewer,
    abi: savingCirclesViewerAbi,
    functionName: "getComprehensiveUserData",
    args: [address],
    chainId: useActiveChainId(),
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
        stateById.get(circle.circleId.toString()) ?? CircleState.Active,
        depositToken.decimals
      )
    );
  }, [address, blockTimestamp, data, stateById, depositToken.decimals]);

  return {
    circles,
    financialSummary: data?.financialSummary,
    isLoading,
    error,
  };
}
