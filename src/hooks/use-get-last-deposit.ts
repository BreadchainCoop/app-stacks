import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { clientEnv } from "@/lib/env";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";

export const useGetLastDeposit = ({
	circleId,
	enabled,
}: {
	circleId: string;
	enabled: boolean;
}) => {
	const publicClient = usePublicClient();

	const { data: lastDepositTime, ...result } = useQuery({
		queryKey: ["lastDeposit", circleId],
		enabled: Boolean(publicClient) && enabled,
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
