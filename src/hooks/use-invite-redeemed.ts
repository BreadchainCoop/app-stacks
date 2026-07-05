import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getCreationBlock } from "@/lib/creation-block";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Address, parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";

export const useInviteRedeemed = ({
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
    queryKey: ["inviteRedeemed", circleId, member],
    enabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!publicClient) return null;

      const logs = await publicClient.getLogs({
        address: SAVING_CIRCLES_CONTRACT_ADDRESS,
        event: parseAbiItem(
          "event InviteRedeemed(uint256 indexed id, address indexed member)"
        ),
        args: { id: BigInt(circleId), member },
        fromBlock: await getCreationBlock(publicClient),
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
