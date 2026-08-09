import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { clientEnv } from "@/lib/env";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { usePublicClient } from "wagmi";
import { getDefaultChainId } from "@/utils/chain";

export const useGetLastDeposit = ({
  circleId,
  enabled,
  member,
}: {
  circleId: string;
  enabled: boolean;
  member?: Address;
}) => {
  const publicClient = usePublicClient({ chainId: getDefaultChainId() });

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
        address: SAVING_CIRCLES_CONTRACT_ADDRESS,
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
        fromBlock: BigInt(
          clientEnv.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK
        ),
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
