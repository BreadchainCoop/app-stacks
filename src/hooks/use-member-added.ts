import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Address, parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import {
  useActiveChainId,
  useChainConfig,
} from "@/components/providers/active-chain";

export const useMemberAdded = ({
  circleId,
  member,
  enabled,
}: {
  circleId: string;
  member: Address;
  enabled?: boolean;
}) => {
  const publicClient = usePublicClient();
  const chainId = useActiveChainId();
  const { savingCircles, contractCreationBlock } = useChainConfig();

  return useQuery({
    queryKey: ["memberAdded", chainId, circleId, member],
    enabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!publicClient) return null;

      const logs = await publicClient.getLogs({
        address: savingCircles,
        event: parseAbiItem(
          "event MemberAdded(uint256 indexed id, address indexed member)"
        ),
        args: { id: BigInt(circleId), member },
        fromBlock: contractCreationBlock,
        toBlock: "latest",
      });

      if (logs.length === 0) return null;

      const block = await publicClient.getBlock({
        blockNumber: logs[0].blockNumber,
      });

      return new Date(Number(block.timestamp) * 1000);
    },
  });
};
