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

// Queries derived from event logs rather than contract reads. Their keys are
// app-defined (not wagmi's `readContract`/`readContracts` roots), so the usual
// post-write invalidation misses them entirely and the values they back —
// member deposit status on a failed/expired/decommissioned circle, the
// member-added timestamp — stay stale until a reload.
const LOG_DERIVED_ROOTS = [
  "fundsDeposited",
  "memberAdded",
  "lastDeposit",
  "lastClaimed",
  "circleCreated",
];

/**
 * Refetch everything a circle write can change: wagmi's contract reads plus the
 * event-log queries above.
 *
 * Deliberately matches on the key root only, so it stays correct as those keys
 * gain elements — the chain id was added to most of them without the callers
 * noticing, which is exactly how they came to be missed.
 */
export function invalidateStackReads(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    predicate: ({ queryKey }) => {
      const root = queryKey[0];

      return (
        root === "readContract" ||
        root === "readContracts" ||
        (typeof root === "string" && LOG_DERIVED_ROOTS.includes(root))
      );
    },
  });
}
