import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getCreationBlock } from "@/lib/creation-block";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { usePublicClient } from "wagmi";

export const useGetLastClaimed = ({
  circleId,
  enabled,
  accountAddress,
}: {
  circleId: string;
  enabled: boolean;
  accountAddress?: Address;
}) => {
  const publicClient = usePublicClient();

  const { data, ...result } = useQuery({
    queryKey: ["lastClaimed", circleId, accountAddress],
    enabled: Boolean(publicClient) && enabled,
    queryFn: async () => {
      if (!publicClient) return null;

      const logs = await publicClient.getLogs({
        address: SAVING_CIRCLES_CONTRACT_ADDRESS,
        event: {
          type: "event",
          name: "FundsWithdrawn",
          inputs: [
            { type: "uint256", name: "_id", indexed: true },
            { type: "address", name: "_member", indexed: true },
            { type: "uint256", name: "_value", indexed: false },
          ],
        },
        args: {
          _id: BigInt(circleId),
          ...(accountAddress ? { _member: accountAddress } : {}),
        },
        fromBlock: await getCreationBlock(publicClient),
        toBlock: "latest",
      });

      if (logs.length === 0) return null;

      const lastLog = logs[logs.length - 1];

      const memberAddress = lastLog.args._member;
      const block = await publicClient.getBlock({
        blockNumber: lastLog.blockNumber,
      });

      const timestamp = new Date(Number(block.timestamp) * 1000);

      return { memberAddress, timestamp };
    },
  });

  return { data, ...result };
};
