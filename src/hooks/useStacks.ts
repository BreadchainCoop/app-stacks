import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS } from "@/constants/contract";
import { savingCirclesABI } from "@/lib/abi";

/**
 * Hook to fetch detailed circle data for given circle IDs
 * @param circleIds - Array of circle IDs to fetch data for
 * @returns Object containing circles data, loading state, and refetch function
 */
export function useStacks(circleIds?: readonly bigint[]) {
  const result = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: savingCirclesABI,
    functionName: "getCircles",
    args: circleIds && circleIds.length > 0 ? [circleIds] : undefined,
    query: {
      enabled: !!circleIds && circleIds.length > 0,
    },
  });

  // Debug logging
  console.log("useStacks Debug:", {
    circleIds,
    data: result.data,
    isLoading: result.isLoading,
    error: result.error,
    isError: result.isError,
    isSuccess: result.isSuccess,
  });

  return result;
}
