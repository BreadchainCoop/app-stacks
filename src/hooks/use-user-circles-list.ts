import { useReadContract, useReadContracts } from "wagmi";
import { SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS } from "@/lib/constants";
import { savingCirclesViewerAbi } from "@/lib/abis/saving-circles-viewers";
import { Address, formatEther } from "viem";
import { ICircleList } from "@/interfaces/circle";
import { useMemo } from "react";
import { getDefaultChainId } from "@/utils/chain";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";
import { useBlockTimestamp } from "./use-block-timestamp";
import { useTotalCircles } from "./use-total-circles";

type UserCircleData = Parameters<typeof getUserCircleStatus>[0];

const parseCircleData = (
  c: UserCircleData,
  address: Address,
  now: bigint
): ICircleList => {
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
  const { total: totalCircles, isLoading: loadingTotal } = useTotalCircles();
  const circleIds = Array.from({ length: totalCircles }, (_, i) => BigInt(i));

  const {
    data: rawResults,
    isLoading: loadingCircles,
    error,
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

  const {
    data: membershipStatus,
    isLoading: loadingMembershipStatus,
    error: membershipError,
  } = useReadContract({
    address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
    abi: savingCirclesViewerAbi,
    functionName: "getUserMembershipStatus",
    args: [address],
    chainId: getDefaultChainId(),
    query: {
      enabled: Boolean(address),
    },
  });

  const decommissionedCircleIds = useMemo(
    () => membershipStatus?.decommissionedCircleIds ?? [],
    [membershipStatus]
  );

  const {
    data: decommissionedResults,
    isLoading: loadingDecommissionedCircles,
    error: decommissionedError,
  } = useReadContract({
    address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
    abi: savingCirclesViewerAbi,
    functionName: "getUserCirclesData",
    args: [address, decommissionedCircleIds],
    chainId: getDefaultChainId(),
    query: {
      enabled: Boolean(address) && decommissionedCircleIds.length > 0,
    },
  });

  const circles = useMemo(() => {
    if (!rawResults) return [];

    const now = BigInt(Math.floor(blockTimestamp / 1000));
    const parsedCircles: ICircleList[] = [];
    const parsedCircleIds = new Set<string>();

    for (const result of rawResults) {
      if (result.status === "failure") continue;

      const c = result.result as unknown as UserCircleData;
      if (!c.isMember && !c.isOwner) continue;

      parsedCircles.push(parseCircleData(c, address, now));
      parsedCircleIds.add(c.circleId.toString());
    }

    for (const c of (decommissionedResults ??
      []) as unknown as UserCircleData[]) {
      const id = c.circleId.toString();
      if (parsedCircleIds.has(id)) continue;

      parsedCircles.push(parseCircleData(c, address, now));
      parsedCircleIds.add(id);
    }

    return parsedCircles;
  }, [address, blockTimestamp, decommissionedResults, rawResults]);

  return {
    circles,
    isLoading:
      loadingTotal ||
      loadingCircles ||
      loadingMembershipStatus ||
      loadingDecommissionedCircles,
    error: error || membershipError || decommissionedError,
  };
}
