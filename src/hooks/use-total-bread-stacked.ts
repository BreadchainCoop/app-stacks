import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { clientEnv } from "@/lib/env";
import { ICircleList, ICircleStatus } from "@/interfaces/circle";
import { useQuery } from "@tanstack/react-query";
import { parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";

const fundsDepositedEvent = parseAbiItem(
  "event FundsDeposited(uint256 indexed id, address indexed member, uint256 amount)"
);
const fundsWithdrawnEvent = parseAbiItem(
  "event FundsWithdrawn(uint256 indexed id, address indexed member, uint256 amount)"
);
const fromBlock = BigInt(
  clientEnv.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK
);

const finishedStatuses: ICircleStatus[] = [
  "decommissioned",
  "expired",
  "failed",
  "finished",
];

export const useTotalBreadStacked = ({
  circleId,
  circleStatus,
  completedRounds,
  depositAmount,
  totalRounds,
  poolBalance,
}: {
  circleId: bigint;
  circleStatus: ICircleStatus;
  completedRounds: bigint;
  depositAmount: bigint;
  totalRounds: bigint;
  poolBalance: bigint;
}) => {
  const publicClient = usePublicClient();
  const isFinished = finishedStatuses.includes(circleStatus);
  const isDecommissioned = circleStatus === "decommissioned";

  const eventQuery = useQuery({
    queryKey: ["totalBreadStacked", circleId.toString(), circleStatus],
    enabled: isFinished && Boolean(publicClient),
    queryFn: async () => {
      if (!publicClient) return BigInt(0);

      const logs = await publicClient.getLogs({
        address: SAVING_CIRCLES_CONTRACT_ADDRESS,
        event: isDecommissioned ? fundsWithdrawnEvent : fundsDepositedEvent,
        args: { id: circleId },
        fromBlock,
        toBlock: "latest",
      });

      return logs.reduce(
        (total, log) => total + (log.args.amount ?? BigInt(0)),
        BigInt(0)
      );
    },
  });

  if (!isFinished) {
    // For active stacks, completedRounds is accurate — derive total directly from
    // contract data without scanning events. Avoids the post-finish inflation bug.
    return {
      ...eventQuery,
      data: completedRounds * depositAmount * totalRounds + poolBalance,
      isLoading: false,
      isPending: false,
    };
  }

  return eventQuery;
};

export const useTotalBreadStackedByCircle = (circles: ICircleList[]) => {
  const publicClient = usePublicClient();
  const circleStates = circles.map((circle) => [
    circle.id.toString(),
    circle.status,
  ]);

  return useQuery({
    queryKey: ["totalBreadStacked", "circles", circleStates],
    enabled: Boolean(publicClient) && circles.length > 0,
    queryFn: async () => {
      if (!publicClient) return {};

      const finishedCircles = circles.filter((c) =>
        finishedStatuses.includes(c.status as ICircleStatus)
      );
      const finishedIds = finishedCircles.map((c) => c.id);

      // Compute totals for active circles directly from contract data (no event scan)
      const result: Record<string, bigint> = {};
      for (const circle of circles) {
        if (finishedStatuses.includes(circle.status as ICircleStatus)) continue;
        const id = circle.id.toString();
        result[id] =
          circle.currentIndex *
            circle.depositAmount *
            BigInt(circle.totalMember) +
          (circle.totalPoolBalance ?? BigInt(0));
      }

      if (finishedIds.length === 0) return result;

      // For finished circles, sum events — currentIndex is unreliable post-finish
      const [depositLogs, withdrawalLogs] = await Promise.all([
        publicClient.getLogs({
          address: SAVING_CIRCLES_CONTRACT_ADDRESS,
          event: fundsDepositedEvent,
          args: { id: finishedIds },
          fromBlock,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: SAVING_CIRCLES_CONTRACT_ADDRESS,
          event: fundsWithdrawnEvent,
          args: { id: finishedIds },
          fromBlock,
          toBlock: "latest",
        }),
      ]);

      const sumByCircle = (logs: typeof depositLogs) =>
        logs.reduce<Record<string, bigint>>((acc, log) => {
          const id = log.args.id?.toString();
          if (id) acc[id] = (acc[id] ?? BigInt(0)) + (log.args.amount ?? BigInt(0));
          return acc;
        }, {});

      const deposits = sumByCircle(depositLogs);
      const withdrawals = sumByCircle(withdrawalLogs);

      for (const circle of finishedCircles) {
        const id = circle.id.toString();
        result[id] =
          (circle.status === "decommissioned"
            ? withdrawals[id]
            : deposits[id]) ?? BigInt(0);
      }

      return result;
    },
  });
};

export const useMemberDepositsByCircle = ({
  circleId,
  isFinished,
}: {
  circleId: string;
  isFinished: boolean;
}) => {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ["memberDeposits", circleId],
    enabled: isFinished && Boolean(publicClient),
    queryFn: async () => {
      if (!publicClient) return {} as Record<string, bigint>;

      const logs = await publicClient.getLogs({
        address: SAVING_CIRCLES_CONTRACT_ADDRESS,
        event: fundsDepositedEvent,
        args: { id: BigInt(circleId) },
        fromBlock,
        toBlock: "latest",
      });

      return logs.reduce<Record<string, bigint>>((result, log) => {
        const member = log.args.member?.toLowerCase();
        if (member) {
          result[member] =
            (result[member] ?? BigInt(0)) + (log.args.amount ?? BigInt(0));
        }
        return result;
      }, {});
    },
  });
};
