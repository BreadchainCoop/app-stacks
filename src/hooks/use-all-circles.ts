import { useReadContracts } from "wagmi";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "../lib/constants";
import { savingCirclesAbi } from "../lib/abis/saving-circles";
import { ICircleList } from "@/interfaces/circle";
import { useTotalCircles } from "./use-total-circles";
import { Address } from "viem";
import { getDefaultChainId } from "@/utils/chain";
import { useBlockTimestamp } from "./use-block-timestamp";

const PAGE_SIZE = 40;

export function useAllCircles(page: number = 0) {
  const skip = page * PAGE_SIZE;
  const blockTimestamp = useBlockTimestamp();

  const { total: totalCircles, isLoading: loadingTotal } = useTotalCircles();

  const hasMore = skip + PAGE_SIZE < totalCircles;

  const circleIds = Array.from(
    { length: Math.min(PAGE_SIZE, totalCircles - skip) },
    (_, i) => BigInt(skip + i)
  );

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

  const circles: ICircleList[] = [];

  if (rawResults) {
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
      const now = BigInt(Math.floor(blockTimestamp / 1000));
      const status =
        effectiveCircleStartTime === BigInt(0)
          ? "pending-start"
          : circleEnd > BigInt(0) && now >= circleEnd
            ? "expired"
            : undefined;

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
