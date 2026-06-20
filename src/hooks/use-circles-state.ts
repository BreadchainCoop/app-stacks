import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { savingCirclesViewerAbi } from "@/lib/abis/saving-circles-viewers";
import { SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS } from "@/lib/constants";
import { CircleState, RoundState } from "@/lib/circle-state";
import { getDefaultChainId } from "@/utils/chain";

/**
 * Reads the contract's canonical `CircleState` and `RoundState` for a batch of
 * circles via the viewer's `getCirclesState`. Returns maps keyed by circle id
 * (stringified).
 *
 * Use these as the source of truth for circle/round lifecycle status instead of
 * re-deriving them from raw fields. See `getUserCircleStatus` (circle-level) and
 * `getRoundStatus` (round-level).
 */
export function useCirclesState(circleIds: bigint[]) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
    abi: savingCirclesViewerAbi,
    functionName: "getCirclesState",
    args: [circleIds],
    query: { enabled: circleIds.length > 0 },
    chainId: getDefaultChainId(),
  });

  const stateById = useMemo(() => {
    const map = new Map<string, CircleState>();
    if (data) {
      for (const state of data) {
        map.set(state.circleId.toString(), state.circleState as CircleState);
      }
    }
    return map;
  }, [data]);

  const roundStateById = useMemo(() => {
    const map = new Map<string, RoundState>();
    if (data) {
      for (const state of data) {
        map.set(state.circleId.toString(), state.roundState as RoundState);
      }
    }
    return map;
  }, [data]);

  return { stateById, roundStateById, isLoading, error, refetch };
}

/** Convenience wrapper for a single circle. */
export function useCircleState(circleId: bigint | undefined) {
  const { stateById, roundStateById, isLoading, error, refetch } =
    useCirclesState(circleId !== undefined ? [circleId] : []);

  const key = circleId?.toString();

  return {
    circleState: key !== undefined ? stateById.get(key) : undefined,
    roundState: key !== undefined ? roundStateById.get(key) : undefined,
    isLoading,
    error,
    refetch,
  };
}
