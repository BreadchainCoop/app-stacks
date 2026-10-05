import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { usePublicClient } from "wagmi";
import {
  useActiveChainId,
  useChainConfig,
} from "@/components/providers/active-chain";

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
  const chainId = useActiveChainId();
  const { savingCircles, contractCreationBlock } = useChainConfig();

  const { data, ...result } = useQuery({
    queryKey: ["lastClaimed", chainId, circleId, accountAddress],
    enabled: Boolean(publicClient) && enabled,
    queryFn: async () => {
      if (!publicClient) return null;

      const logs = await publicClient.getLogs({
        address: savingCircles,
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
        fromBlock: contractCreationBlock,
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
