"use client";

import { automaticSavingCirclesAbi } from "@/lib/abis/automatic-saving-circles";
import { AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { Address } from "viem";
import { useReadContracts } from "wagmi";

/**
 * Reads whether automatic claims are enabled for each of the given stacks and
 * derives the aggregate state. Shared by the account-level toggle and the
 * bulk-claim button so both read from one (TanStack-deduped) query.
 *
 * `allEnabled` is true only when there's at least one stack and every one has
 * auto-claims on — that's the case where the bulk-claim shortcut is redundant.
 */
export function useAccountAutoClaimsState(
  address: Address,
  circleIds: bigint[]
) {
  const { data, isFetching } = useReadContracts({
    contracts: circleIds.map((circleId) => ({
      abi: automaticSavingCirclesAbi,
      address: AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
      functionName: "isAutomaticClaimsEnabled" as const,
      args: [circleId, address] as const,
      chainId: getDefaultChainId(),
    })),
    query: { enabled: circleIds.length > 0 },
  });

  const enabledByIndex = circleIds.map(
    (_, i) => data?.[i]?.status === "success" && data[i].result === true
  );
  const allEnabled = circleIds.length > 0 && enabledByIndex.every(Boolean);

  return { enabledByIndex, allEnabled, isFetching };
}
