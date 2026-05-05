import { useReadContract, useReadContracts } from "wagmi";
import { SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS } from "@/lib/constants";
import { savingCirclesViewerAbi } from "@/lib/abis/saving-circles-viewers";
import { Address, formatEther, parseAbi } from "viem";
import { ICircleList } from "@/interfaces/circle";
import { useMemo } from "react";
import { getDefaultChainId } from "@/utils/chain";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";
import { useBlockTimestamp } from "./use-block-timestamp";
import { useTotalCircles } from "./use-total-circles";

type UserCircleData = Parameters<typeof getUserCircleStatus>[0];
type FallbackCircleState = {
  circleId: bigint;
  circleState: number;
  roundState: number;
};
type FallbackCircleInfo = Pick<
  ICircleList,
  | "circleEnd"
  | "currentIndex"
  | "depositAmount"
  | "depositInterval"
  | "effectiveCircleStartTime"
  | "owner"
  | "token"
>;

const fallbackSavingCirclesAbi = parseAbi([
  "function getMemberCircles(address member) view returns (uint256[] ids)",
  "function getCircle(uint256 id) view returns ((address owner,uint256 currentIndex,uint256 depositAmount,address token,uint256 depositInterval,uint256 effectiveCircleStartTime,uint256 circleEnd) circle)",
  "function getCircleMembers(uint256 id) view returns (address[] members)",
  "function isActive(uint256 id) view returns (bool active)",
  "function isDecommissionable(uint256 id) view returns (bool decommissionable)",
]);

const CIRCLE_STATE_DECOMMISSIONED = 5;

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

const parseFallbackCircleData = ({
  id,
  circle,
  members,
  isActive,
  isDecommissionable,
  circleState,
}: {
  id: bigint;
  circle: FallbackCircleInfo;
  members: readonly Address[];
  isActive: boolean;
  isDecommissionable: boolean;
  circleState?: FallbackCircleState;
}): ICircleList | null => {
  const hasStarted = circle.effectiveCircleStartTime > BigInt(0);
  const isDecommissioned =
    Number(circleState?.circleState) === CIRCLE_STATE_DECOMMISSIONED;

  if (isDecommissioned) {
    return {
      ...circle,
      id,
      totalMember: members.length,
      status: "decommissioned",
      totalPoolBalance: BigInt(0),
      isMember: true,
      isDecommissionable: false,
      userBalance: BigInt(0),
      canWithdraw: false,
    };
  }

  if (isDecommissionable) {
    return {
      ...circle,
      id,
      totalMember: members.length,
      status: "failed",
      totalPoolBalance: BigInt(0),
      isMember: true,
      isDecommissionable: true,
      canWithdraw: false,
    };
  }

  if (!hasStarted) {
    return {
      ...circle,
      id,
      totalMember: members.length,
      status: "pending-start",
      totalPoolBalance: BigInt(0),
      isMember: true,
      isDecommissionable: false,
      canWithdraw: false,
    };
  }

  if (!isActive) {
    return {
      ...circle,
      id,
      totalMember: members.length,
      status: "finished",
      totalPoolBalance: BigInt(0),
      isMember: true,
      isDecommissionable: false,
      userBalance: BigInt(0),
      canWithdraw: false,
    };
  }

  return null;
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

  const { data: fallbackSavingCirclesAddress } = useReadContract({
    address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
    abi: savingCirclesViewerAbi,
    functionName: "SAVING_CIRCLES",
    chainId: getDefaultChainId(),
    query: {
      enabled: Boolean(address),
    },
  });

  const {
    data: memberCircleIds,
    isLoading: loadingMemberCircleIds,
    error: memberCircleIdsError,
  } = useReadContract({
    address: fallbackSavingCirclesAddress,
    abi: fallbackSavingCirclesAbi,
    functionName: "getMemberCircles",
    args: [address],
    chainId: getDefaultChainId(),
    query: {
      enabled: Boolean(address) && Boolean(fallbackSavingCirclesAddress),
    },
  });

  const fallbackCircleIds = useMemo(
    () => memberCircleIds ?? [],
    [memberCircleIds]
  );

  const {
    data: fallbackCircles,
    isLoading: loadingFallbackCircles,
    error: fallbackCirclesError,
  } = useReadContracts({
    contracts: fallbackCircleIds.map((id) => ({
      address: fallbackSavingCirclesAddress!,
      abi: fallbackSavingCirclesAbi,
      functionName: "getCircle",
      args: [id],
      chainId: getDefaultChainId(),
    })),
    query: {
      enabled:
        Boolean(fallbackSavingCirclesAddress) && fallbackCircleIds.length > 0,
    },
  });

  const {
    data: fallbackMembers,
    isLoading: loadingFallbackMembers,
    error: fallbackMembersError,
  } = useReadContracts({
    contracts: fallbackCircleIds.map((id) => ({
      address: fallbackSavingCirclesAddress!,
      abi: fallbackSavingCirclesAbi,
      functionName: "getCircleMembers",
      args: [id],
      chainId: getDefaultChainId(),
    })),
    query: {
      enabled:
        Boolean(fallbackSavingCirclesAddress) && fallbackCircleIds.length > 0,
    },
  });

  const {
    data: fallbackActiveStatuses,
    isLoading: loadingFallbackActiveStatuses,
    error: fallbackActiveStatusesError,
  } = useReadContracts({
    contracts: fallbackCircleIds.map((id) => ({
      address: fallbackSavingCirclesAddress!,
      abi: fallbackSavingCirclesAbi,
      functionName: "isActive",
      args: [id],
      chainId: getDefaultChainId(),
    })),
    query: {
      enabled:
        Boolean(fallbackSavingCirclesAddress) && fallbackCircleIds.length > 0,
    },
  });

  const {
    data: fallbackDecommissionableStatuses,
    isLoading: loadingFallbackDecommissionableStatuses,
    error: fallbackDecommissionableStatusesError,
  } = useReadContracts({
    contracts: fallbackCircleIds.map((id) => ({
      address: fallbackSavingCirclesAddress!,
      abi: fallbackSavingCirclesAbi,
      functionName: "isDecommissionable",
      args: [id],
      chainId: getDefaultChainId(),
    })),
    query: {
      enabled:
        Boolean(fallbackSavingCirclesAddress) && fallbackCircleIds.length > 0,
    },
  });

  const {
    data: fallbackCircleStates,
    isLoading: loadingFallbackCircleStates,
    error: fallbackCircleStatesError,
  } = useReadContract({
    address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
    abi: savingCirclesViewerAbi,
    functionName: "getCirclesState",
    args: [fallbackCircleIds],
    chainId: getDefaultChainId(),
    query: {
      enabled: fallbackCircleIds.length > 0,
    },
  });

  const circles = useMemo(() => {
    if (!rawResults) return [];

    const now = BigInt(Math.floor(blockTimestamp / 1000));
    const parsedCircles: ICircleList[] = [];
    const parsedCircleIds = new Set<string>();
    const fallbackCircleStateById = new Map(
      (fallbackCircleStates ?? []).map((state) => [
        state.circleId.toString(),
        state as FallbackCircleState,
      ])
    );

    for (const result of rawResults) {
      if (result.status === "failure") continue;

      const c = result.result as unknown as UserCircleData;
      if (!c.isMember && !c.isOwner) continue;

      parsedCircles.push(parseCircleData(c, address, now));
      parsedCircleIds.add(c.circleId.toString());
    }

    for (let i = 0; i < fallbackCircleIds.length; i++) {
      const id = fallbackCircleIds[i];
      const idKey = id.toString();
      if (parsedCircleIds.has(idKey)) continue;

      const circleResult = fallbackCircles?.[i];
      const membersResult = fallbackMembers?.[i];
      const activeResult = fallbackActiveStatuses?.[i];
      const decommissionableResult = fallbackDecommissionableStatuses?.[i];

      if (
        circleResult?.status !== "success" ||
        membersResult?.status !== "success" ||
        activeResult?.status !== "success" ||
        decommissionableResult?.status !== "success"
      ) {
        continue;
      }

      const fallbackCircle = parseFallbackCircleData({
        id,
        circle: circleResult.result as unknown as FallbackCircleInfo,
        members: membersResult.result as readonly Address[],
        isActive: activeResult.result as boolean,
        isDecommissionable: decommissionableResult.result as boolean,
        circleState: fallbackCircleStateById.get(idKey),
      });

      if (!fallbackCircle) continue;

      parsedCircles.push(fallbackCircle);
      parsedCircleIds.add(idKey);
    }

    return parsedCircles;
  }, [
    address,
    blockTimestamp,
    fallbackActiveStatuses,
    fallbackCircleIds,
    fallbackCircleStates,
    fallbackCircles,
    fallbackDecommissionableStatuses,
    fallbackMembers,
    rawResults,
  ]);

  return {
    circles,
    isLoading:
      loadingTotal ||
      loadingCircles ||
      loadingMemberCircleIds ||
      loadingFallbackCircles ||
      loadingFallbackMembers ||
      loadingFallbackActiveStatuses ||
      loadingFallbackDecommissionableStatuses ||
      loadingFallbackCircleStates,
    error:
      error ||
      memberCircleIdsError ||
      fallbackCirclesError ||
      fallbackMembersError ||
      fallbackActiveStatusesError ||
      fallbackDecommissionableStatusesError ||
      fallbackCircleStatesError,
  };
}
