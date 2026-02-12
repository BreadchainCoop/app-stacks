import { useReadContract } from "wagmi";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "../lib/constants";
import { savingCirclesAbi } from "../lib/abis/saving-circles";
import { getDefaultChainId } from "@/utils/chain";

export function useTotalCircles() {
  const { data, isLoading } = useReadContract({
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    abi: savingCirclesAbi,
    functionName: "nextId",
    chainId: getDefaultChainId(),
  });

  return {
    total: data ? Number(data) : 0,
    isLoading,
  };
}
