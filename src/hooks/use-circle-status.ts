import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useReadContracts } from "wagmi";

export function useCircleStatus(circleId: bigint | undefined) {
	const contracts = [
		{
			address: SAVING_CIRCLES_CONTRACT_ADDRESS,
			abi: savingCirclesAbi,
			functionName: "isActive",
			args: [circleId!],
			chainId: getDefaultChainId(),
		},
		{
			address: SAVING_CIRCLES_CONTRACT_ADDRESS,
			abi: savingCirclesAbi,
			functionName: "isWithdrawable",
			args: [circleId!],
			chainId: getDefaultChainId(),
		},
		{
			address: SAVING_CIRCLES_CONTRACT_ADDRESS,
			abi: savingCirclesAbi,
			functionName: "isDecommissionable",
			args: [circleId!],
			chainId: getDefaultChainId(),
		},
	] as const;

	const { data, isLoading } = useReadContracts({
		contracts,
		query: {
			enabled: circleId !== undefined,
		},
	});

	return {
		isActive: data?.[0]?.result ?? false,
		isWithdrawable: data?.[1]?.result ?? false,
		isDecommissionable: data?.[2]?.result ?? false,
		isLoading,
	};
}
