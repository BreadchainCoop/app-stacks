import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { clientEnv } from "@/lib/env";
import { ICircleList } from "@/interfaces/circle";
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

export const useTotalBreadStacked = ({
  circleId,
  isDecommissioned,
}: {
  circleId: bigint;
  isDecommissioned: boolean;
}) => {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ["totalBreadStacked", circleId.toString(), isDecommissioned],
    enabled: Boolean(publicClient),
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
};

export const useTotalBreadStackedByCircle = (circles: ICircleList[]) => {
  const publicClient = usePublicClient();
  const circleIds = circles.map((circle) => circle.id);
  const circleStates = circles.map((circle) => [
    circle.id.toString(),
    circle.status === "decommissioned",
  ]);

  return useQuery({
    queryKey: ["totalBreadStacked", "circles", circleStates],
    enabled: Boolean(publicClient) && circleIds.length > 0,
    queryFn: async () => {
      if (!publicClient) return {};

      const [depositLogs, withdrawalLogs] = await Promise.all([
        publicClient.getLogs({
          address: SAVING_CIRCLES_CONTRACT_ADDRESS,
          event: fundsDepositedEvent,
          args: { id: circleIds },
          fromBlock,
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: SAVING_CIRCLES_CONTRACT_ADDRESS,
          event: fundsWithdrawnEvent,
          args: { id: circleIds },
          fromBlock,
          toBlock: "latest",
        }),
      ]);
      const totals = (logs: typeof depositLogs | typeof withdrawalLogs) =>
        logs.reduce<Record<string, bigint>>((result, log) => {
          const id = log.args.id?.toString();
          if (id) {
            result[id] =
              (result[id] ?? BigInt(0)) + (log.args.amount ?? BigInt(0));
          }
          return result;
        }, {});
      const deposits = totals(depositLogs);
      const withdrawals = totals(withdrawalLogs);

      return circles.reduce<Record<string, bigint>>((result, circle) => {
        const id = circle.id.toString();
        result[id] =
          (circle.status === "decommissioned"
            ? withdrawals[id]
            : deposits[id]) ?? BigInt(0);
        return result;
      }, {});
    },
  });
};
