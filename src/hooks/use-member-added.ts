import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { clientEnv } from "@/lib/env";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Address, parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";

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

  return useQuery({
    queryKey: ["memberAdded", circleId, member],
    enabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!publicClient) return null;

      const logs = await publicClient.getLogs({
        address: SAVING_CIRCLES_CONTRACT_ADDRESS,
        event: parseAbiItem(
          "event MemberAdded(uint256 indexed id, address indexed member)"
        ),
        args: { id: BigInt(circleId), member },
        fromBlock: BigInt(
          clientEnv.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK
        ),
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
