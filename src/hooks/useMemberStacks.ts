import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS } from "@/constants/contract";
import { savingCirclesABI } from "@/lib/abi";

/**
 * Hook to fetch the circle IDs that a member is part of
 * @param memberAddress - The address of the member to fetch circles for
 * @returns Object containing circle IDs, loading state, and refetch function
 */
export function useMemberStacks(memberAddress?: `0x${string}`) {
  const result = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: savingCirclesABI,
    functionName: "getMemberCircles",
    args: memberAddress ? [memberAddress] : undefined,
    query: {
      enabled: !!memberAddress,
    },
  });

  // Debug logging
  console.log("useMemberStacks Debug:", {
    memberAddress,
    data: result.data,
    isLoading: result.isLoading,
    error: result.error,
    isError: result.isError,
    isSuccess: result.isSuccess,
  });

  return result;
}
