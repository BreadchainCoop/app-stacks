import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import {
  useActiveChainId,
  useChainConfig,
} from "@/components/providers/active-chain";

export const useGetCircleCreated = ({
  circleId,
  enabled = true,
}: {
  circleId: string;
  enabled?: boolean;
}) => {
  const publicClient = usePublicClient();
  const chainId = useActiveChainId();
  const { savingCircles, contractCreationBlock } = useChainConfig();

  return useQuery({
    queryKey: ["circleCreated", chainId, circleId],
    queryFn: async () => {
      if (!publicClient) return null;

      const logs = await publicClient.getLogs({
        address: savingCircles,
        event: parseAbiItem(
          "event CircleCreated(uint256 indexed id, address indexed token, uint256 depositAmount, uint256 depositInterval)"
        ),
        args: { id: BigInt(circleId) },
        fromBlock: contractCreationBlock,
        toBlock: "latest",
      });

      if (logs.length === 0) return null;

      const block = await publicClient.getBlock({
        blockNumber: logs[0].blockNumber,
      });

      return new Date(Number(block.timestamp) * 1000);
    },
    enabled: enabled && !!circleId,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
};
