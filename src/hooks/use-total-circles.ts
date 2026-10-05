import { useReadContract } from "wagmi";
import { savingCirclesAbi } from "../lib/abis/saving-circles";
import {
  useActiveChainId,
  useChainConfig,
} from "@/components/providers/active-chain";

export function useTotalCircles() {
  const { data, isLoading } = useReadContract({
    address: useChainConfig().savingCircles,
    abi: savingCirclesAbi,
    functionName: "nextId",
    chainId: useActiveChainId(),
  });

  return {
    total: data ? Number(data) : 0,
    isLoading,
  };
}
