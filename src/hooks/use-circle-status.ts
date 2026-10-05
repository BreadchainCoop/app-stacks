import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import {
  useActiveChainId,
  useChainConfig,
} from "@/components/providers/active-chain";
import { useReadContracts } from "wagmi";

export function useCircleStatus(circleId: bigint | undefined) {
  const contracts = [
    {
      address: useChainConfig().savingCircles,
      abi: savingCirclesAbi,
      functionName: "isActive",
      args: [circleId!],
      chainId: useActiveChainId(),
    },
    {
      address: useChainConfig().savingCircles,
      abi: savingCirclesAbi,
      functionName: "isWithdrawable",
      args: [circleId!],
      chainId: useActiveChainId(),
    },
    {
      address: useChainConfig().savingCircles,
      abi: savingCirclesAbi,
      functionName: "isDecommissionable",
      args: [circleId!],
      chainId: useActiveChainId(),
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
