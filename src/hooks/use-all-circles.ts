import { useReadContracts } from "wagmi";
import {
  SAVING_CIRCLES_CONTRACT_ADDRESS,
  SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
} from "../lib/constants";
import { savingCirclesAbi } from "../lib/abis/saving-circles";
import { savingCirclesViewerAbi } from "../lib/abis/saving-circles-viewers";
import { ICircleList, ICircleStatus } from "@/interfaces/circle";
import { useTotalCircles } from "./use-total-circles";
import { Address, formatEther, zeroAddress } from "viem";
import { getDefaultChainId } from "@/utils/chain";
import { useConnectedUser } from "@breadcoop/ui";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";

const PAGE_SIZE = 40;

const CIRCLE_STATE_MAP: Record<number, ICircleStatus> = {
  0: "pending-start",
  1: "in-progress",
  2: "payment_due",
  3: "deposit-completed",
  4: "expired",
  5: "decommissioned",
  6: "failed",
};

function resolveStatus(circleState: number, roundState: number): ICircleStatus {
  if (roundState === 2) return "claimable";
  return CIRCLE_STATE_MAP[circleState] ?? "in-progress";
}

interface ViewerCircleData {
  circleId: bigint;
  circleInfo: {
    owner: Address;
    currentIndex: bigint;
    depositAmount: bigint;
    token: Address;
    depositInterval: bigint;
    effectiveCircleStartTime: bigint;
    circleEnd: bigint;
  };
  userBalance: bigint;
  isMember: boolean;
  isOwner: boolean;
  isCurrentWithdrawer: boolean;
  canWithdraw: boolean;
  isExpired: boolean;
  isDecommissioned: boolean;
  isDecommissionable: boolean;
  nextWithdrawTime: bigint;
  depositWindowEnd: bigint;
  totalPoolBalance: bigint;
  remainingDepositsNeeded: bigint;
  completedRounds: bigint;
  totalRounds: bigint;
  currentWithdrawer: Address;
}

export function useAllCircles(page: number = 0) {
  const skip = page * PAGE_SIZE;
  const { user } = useConnectedUser();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;

  const { total: totalCircles, isLoading: loadingTotal } = useTotalCircles();

  const hasMore = skip + PAGE_SIZE < totalCircles;

  const circleIds = Array.from(
    { length: Math.min(PAGE_SIZE, totalCircles - skip) },
    (_, i) => BigInt(skip + i)
  );

  // Base circle data + members
  const { data: rawResults, isLoading: loadingCircles } = useReadContracts({
    contracts: circleIds.flatMap((id) => [
      {
        address: SAVING_CIRCLES_CONTRACT_ADDRESS,
        abi: savingCirclesAbi,
        functionName: "circles",
        args: [id],
        chainId: getDefaultChainId(),
      },
      {
        address: SAVING_CIRCLES_CONTRACT_ADDRESS,
        abi: savingCirclesAbi,
        functionName: "getCircleMembers",
        args: [id],
        chainId: getDefaultChainId(),
      },
    ]),
    query: {
      enabled: circleIds.length > 0,
    },
  });

  // Circle-level states (stable query - doesn't depend on address)
  const { data: statesResult, isLoading: loadingStates } = useReadContracts({
    contracts: [
      {
        address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
        abi: savingCirclesViewerAbi,
        functionName: "getCirclesState",
        args: [circleIds],
        chainId: getDefaultChainId(),
      },
    ],
    query: {
      enabled: circleIds.length > 0,
    },
  });

  // Circle progress + user-specific data via viewer
  // Uses zeroAddress when no wallet is connected to still get circle-level data
  const queryAddress = address ?? zeroAddress;
  const { data: userCirclesResult, isLoading: loadingUserCircles } =
    useReadContracts({
      contracts: [
        {
          address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
          abi: savingCirclesViewerAbi,
          functionName: "getUserCirclesData",
          args: [queryAddress, circleIds],
          chainId: getDefaultChainId(),
        },
      ],
      query: {
        enabled: circleIds.length > 0,
      },
    });

  const circles: ICircleList[] = [];

  if (rawResults) {
    const viewerCircles =
      userCirclesResult?.[0]?.status === "success"
        ? (userCirclesResult[0].result as unknown as ViewerCircleData[])
        : undefined;

    const circleStates =
      statesResult?.[0]?.status === "success"
        ? (statesResult[0].result as unknown as {
            circleId: bigint;
            circleState: number;
            roundState: number;
          }[])
        : undefined;

    for (let i = 0; i < circleIds.length; i++) {
      const circleResult = rawResults[i * 2];
      const membersResult = rawResults[i * 2 + 1];

      if (
        circleResult.status === "failure" ||
        membersResult.status === "failure"
      ) {
        continue;
      }

      const circleData = circleResult.result as unknown as readonly [
        owner: `0x${string}`,
        currentIndex: bigint,
        depositAmount: bigint,
        token: `0x${string}`,
        depositInterval: bigint,
        effectiveCircleStartTime: bigint,
        circleEnd: bigint,
      ];

      const [
        owner,
        currentIndex,
        depositAmount,
        token,
        depositInterval,
        effectiveCircleStartTime,
        circleEnd,
      ] = circleData;

      const memberCount = (membersResult.result as unknown as Address[]).length;

      const viewerCircle = viewerCircles?.[i];

      // Base status from contract-level circle state
      const stateEntry = circleStates?.[i];
      let status: ICircleStatus | undefined = stateEntry
        ? resolveStatus(stateEntry.circleState, stateEntry.roundState)
        : undefined;
      let isMember: boolean | undefined;
      let canWithdraw: boolean | undefined;
      let withdrawAmount: number | undefined;
      const totalPoolBalance = viewerCircle?.totalPoolBalance;

      if (viewerCircle && address) {
        isMember = viewerCircle.isMember;

        // Override status with user-specific status only for members
        if (viewerCircle.isMember) {
          const statusResult = getUserCircleStatus(viewerCircle, address, {
            includeClaimable: true,
          });
          status = statusResult.status;

          const userCanWithdraw =
            viewerCircle.canWithdraw && viewerCircle.isCurrentWithdrawer;
          if (userCanWithdraw) {
            canWithdraw = true;
            withdrawAmount =
              Number(formatEther(depositAmount)) *
              Number(viewerCircle.totalRounds);
          } else {
            canWithdraw = false;
          }
        }
      }

      circles.push({
        id: circleIds[i],
        owner,
        currentIndex,
        depositAmount,
        token,
        depositInterval,
        effectiveCircleStartTime,
        circleEnd,
        totalMember: memberCount,
        status,
        isMember,
        totalPoolBalance,
        ...(canWithdraw
          ? { canWithdraw, withdrawAmount: withdrawAmount as number }
          : { canWithdraw: false as const }),
      });
    }
  }

  return {
    data: circles,
    isLoading: loadingTotal || loadingCircles || loadingStates,
    isLoadingUserData: loadingUserCircles,
    total: totalCircles,
    hasMore,
    page,
  };
}
