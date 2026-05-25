import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { clientEnv } from "@/lib/env";
import { useQuery } from "@tanstack/react-query";
import { parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";

export const useTotalBreadStacked = ({
  circleId,
  isDecommissioned,
}: {
  circleId: bigint;
  isDecommissioned: boolean;
}) => {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ["totalBreadStacked", circleId, isDecommissioned],
    enabled: Boolean(publicClient),
    queryFn: async () => {
      if (!publicClient) return BigInt(0);

      const event = isDecommissioned
        ? parseAbiItem(
            "event FundsWithdrawn(uint256 indexed id, address indexed member, uint256 amount)"
          )
        : parseAbiItem(
            "event FundsDeposited(uint256 indexed id, address indexed member, uint256 amount)"
          );
      const logs = await publicClient.getLogs({
        address: SAVING_CIRCLES_CONTRACT_ADDRESS,
        event,
        args: { id: circleId },
        fromBlock: BigInt(
          clientEnv.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK
        ),
        toBlock: "latest",
      });

      return logs.reduce(
        (total, log) => total + (log.args.amount ?? BigInt(0)),
        BigInt(0)
      );
    },
  });
};
