import { useReadContract } from "wagmi";
import { SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS } from "@/lib/constants";
import { savingCirclesViewerAbi } from "@/lib/abis/saving-circles-viewers";
import { Address, formatEther } from "viem";
import { ICircleList } from "@/interfaces/circle";
import { useMemo } from "react";
import { getDefaultChainId } from "@/utils/chain";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";
import { useBlockTimestamp } from "./use-block-timestamp";

type UserCircleData = Parameters<typeof getUserCircleStatus>[0];

const parseCircleData = (
  c: UserCircleData,
  address: Address,
  now: bigint
): ICircleList => {
  const totalRounds = c.totalRounds;
  const formattedStatus = getUserCircleStatus(
    c,
    address,
    { includeClaimable: true },
    now
  );

  const circle = {
    ...c.circleInfo,
    totalMember: Number(totalRounds),
    id: c.circleId,
    status: formattedStatus.status,
    roundState: formattedStatus.roundState,
    totalPoolBalance: c.totalPoolBalance,
    isMember: c.isMember,
    isDecommissionable: c.isDecommissionable,
    userBalance: c.userBalance,
  };

  if (c.canWithdraw) {
    return {
      ...circle,
      canWithdraw: true,
      withdrawAmount:
        Number(formatEther(c.circleInfo.depositAmount)) * Number(totalRounds),
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

  const circles = useMemo(() => {
    if (!data) return [];

    const now = BigInt(Math.floor(blockTimestamp / 1000));

    return data.circleData.map((circle) =>
      parseCircleData(circle as UserCircleData, address, now)
    );
  }, [address, blockTimestamp, data]);

  return { circles, isLoading, error };
}
