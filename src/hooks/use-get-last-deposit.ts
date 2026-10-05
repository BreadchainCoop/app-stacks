import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { usePublicClient } from "wagmi";
import { useChainConfig } from "@/components/providers/active-chain";

export const useGetLastDeposit = ({
  circleId,
  enabled,
  member,
}: {
  circleId: string;
  enabled: boolean;
  member?: Address;
}) => {
  const publicClient = usePublicClient();
  const { savingCircles, contractCreationBlock } = useChainConfig();

  const queryKey = ["lastDeposit", circleId, member].filter(
    (i) => i !== undefined
  );

  const { data: lastDepositTime, ...result } = useQuery({
    queryKey,
    enabled: Boolean(publicClient) && enabled,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (!publicClient) return null;

      const logs = await publicClient.getLogs({
        address: savingCircles,
        event: {
          type: "event",
          name: "FundsDeposited",
          inputs: [
            { type: "uint256", name: "_id", indexed: true },
            { type: "address", name: "_member", indexed: true },
            { type: "uint256", name: "_value", indexed: false },
          ],
        },
        args: {
          _id: BigInt(circleId),
          _member: member,
        },
        fromBlock: contractCreationBlock,
        toBlock: "latest",
      });

      if (logs.length === 0) return null;

      const lastLog = logs[logs.length - 1];

      const block = await publicClient.getBlock({
        blockNumber: lastLog.blockNumber,
      });

      return new Date(Number(block.timestamp) * 1000);
    },
  });

  return {
    lastDepositTime,
    ...result,
  };
};
