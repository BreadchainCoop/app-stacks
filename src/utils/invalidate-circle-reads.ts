import { QueryClient } from "@tanstack/react-query";

// Viewer reads whose result depends on the current round (currentIndex /
// depositWindowEnd are recomputed from block.timestamp on every read):
//   - getUserCircleData      → stack details + all-stacks list (home)
//   - getComprehensiveUserData → user-stacks list (home)
const ROUND_DEPENDENT_READS = ["getUserCircleData", "getComprehensiveUserData"];

/**
 * Refetch the circle reads that advance with the round, without touching every
 * other wagmi read on the page. Matches both `useReadContract` (single) and
 * `useReadContracts` (multicall) query keys by the contract function name.
 */
export function invalidateCircleReads(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    predicate: ({ queryKey }) => {
      const [root, params] = queryKey as [
        unknown,
        (
          | { functionName?: string; contracts?: { functionName?: string }[] }
          | undefined
        ),
      ];

      if (root === "readContract") {
        return ROUND_DEPENDENT_READS.includes(params?.functionName ?? "");
      }

      if (root === "readContracts") {
        return Boolean(
          params?.contracts?.some((contract) =>
            ROUND_DEPENDENT_READS.includes(contract?.functionName ?? "")
          )
        );
      }

      return false;
    },
  });
}
