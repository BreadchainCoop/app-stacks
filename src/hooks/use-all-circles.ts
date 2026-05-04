import { useReadContracts } from "wagmi";
import {
  SAVING_CIRCLES_CONTRACT_ADDRESS,
  SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
} from "../lib/constants";
import { savingCirclesAbi } from "../lib/abis/saving-circles";
import { savingCirclesViewerAbi } from "../lib/abis/saving-circles-viewers";
import { ICircleList } from "@/interfaces/circle";
import { useTotalCircles } from "./use-total-circles";
import { Address, formatEther, zeroAddress } from "viem";
import { getDefaultChainId } from "@/utils/chain";
import { useMemo } from "react";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";
import { useBlockTimestamp } from "./use-block-timestamp";
import { useConnectedUser } from "@breadcoop/ui";

const PAGE_SIZE = 40;
const ZERO_ADDRESS = zeroAddress;

export type DepositProgress = {
  depositedCount: number;
  totalCount: number;
  percent: number;
};

export function useAllCircles(page: number = 0) {
  const skip = page * PAGE_SIZE;
  const { user } = useConnectedUser();
  const blockTimestamp = useBlockTimestamp();

  const connectedAddress =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;

  const viewerAddress = connectedAddress ?? ZERO_ADDRESS;

  const { total: totalCircles, isLoading: loadingTotal } = useTotalCircles();

  const hasMore = skip + PAGE_SIZE < totalCircles;

  const circleIds = Array.from(
    { length: Math.min(PAGE_SIZE, Math.max(0, totalCircles - skip)) },
    (_, i) => BigInt(skip + i)
  );

  // Fetch raw circle data and viewer data (with zero address fallback) in one batch
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
        address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
        abi: savingCirclesViewerAbi,
        functionName: "getUserCircleData",
        args: [viewerAddress, id],
        chainId: getDefaultChainId(),
      },
    ]),
    query: { enabled: circleIds.length > 0 },
  });

  const circles = useMemo<ICircleList[]>(() => {
    if (!rawResults) return [];

    const now = BigInt(Math.floor(blockTimestamp / 1000));

    return circleIds.flatMap((circleId, i) => {
      const circleResult = rawResults[i * 2];
      const viewerResult = rawResults[i * 2 + 1];

      if (circleResult?.status === "failure") return [];

      const circleData = circleResult.result as unknown as readonly [
        owner: Address,
        currentIndex: bigint,
        depositAmount: bigint,
        token: Address,
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

      // console.log("--- circle data ---", circleResult.result);

      // Skip circles that have been decommissioned (owner zeroed out)
      // if (owner === ZERO_ADDRESS) return [];

      // ── Viewer data (progress + optional user status) ───────────────────
      let totalMember = 0;
      let totalPoolBalance: bigint | undefined;
      let status: ICircleList["status"];
      let canWithdraw: boolean = false;
      let withdrawAmount: number | undefined;

      if (viewerResult?.status === "success" && viewerResult.result) {
        // @ts-expect-error Come back
        const viewerData = viewerResult.result as Parameters<
          typeof getUserCircleStatus
        >[0];

        totalMember = Number(viewerData.totalRounds);
        totalPoolBalance = viewerData.totalPoolBalance;

        if (connectedAddress) {
          const statusResult = getUserCircleStatus(
            viewerData,
            connectedAddress,
            { includeClaimable: true, includeDeposited: true },
            now
          );
          // console.log("__ status Result __", statusResult);
          // console.log("___ ID is __", circleId);
          console.log("\n\n");
          // status = statusResult.status;
          if (statusResult.status !== "in-progress")
            status = statusResult.status;
          canWithdraw = viewerData.canWithdraw;
          if (canWithdraw) {
            withdrawAmount =
              Number(formatEther(viewerData.circleInfo.depositAmount)) *
              totalMember;
          }
        }
      }

      const circle: ICircleList = {
        id: circleId,
        owner,
        currentIndex,
        depositAmount,
        token,
        depositInterval,
        effectiveCircleStartTime,
        circleEnd,
        totalMember,
        totalPoolBalance,
        status,
        ...(canWithdraw
          ? { canWithdraw: true, withdrawAmount: withdrawAmount! }
          : { canWithdraw: false }),
      };

      return [circle];
    });
  }, [rawResults, connectedAddress, blockTimestamp]);

  const getDepositProgress = (circle: ICircleList): DepositProgress | null => {
    if (
      circle.totalPoolBalance === undefined ||
      !circle.depositAmount ||
      !circle.totalMember
    )
      return null;

    const depositedCount = Number(
      circle.totalPoolBalance / circle.depositAmount
    );

    return {
      depositedCount,
      totalCount: circle.totalMember,
      percent: Math.round((depositedCount / circle.totalMember) * 100),
    };
  };

  return {
    data: circles,
    isLoading: loadingTotal || loadingCircles,
    total: totalCircles,
    hasMore,
    page,
    getDepositProgress,
  };
}
