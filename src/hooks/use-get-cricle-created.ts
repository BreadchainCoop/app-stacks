import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { clientEnv } from "@/lib/env";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import { getDefaultChainId } from "@/utils/chain";

export const useGetCircleCreated = ({
  circleId,
  enabled = true,
}: {
  circleId: string;
  enabled?: boolean;
}) => {
  const publicClient = usePublicClient({ chainId: getDefaultChainId() });

  return useQuery({
    queryKey: ["circleCreated", circleId],
    queryFn: async () => {
      if (!publicClient) return null;

      const logs = await publicClient.getLogs({
        address: SAVING_CIRCLES_CONTRACT_ADDRESS,
        event: parseAbiItem(
          "event CircleCreated(uint256 indexed id, address indexed token, uint256 depositAmount, uint256 depositInterval)"
        ),
        args: { id: BigInt(circleId) },
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
    enabled: enabled && !!circleId,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
};
