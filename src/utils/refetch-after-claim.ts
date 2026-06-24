import { readContract } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";
import { Address } from "viem";
import { wagmiConfig } from "@/components/providers/web3";
import { savingCirclesViewerAbi } from "@/lib/abis/saving-circles-viewers";
import { SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";

/**
 * After a successful claim, the viewer can briefly still report the pre-claim
 * state (read-after-write RPC lag), so a single invalidate repopulates the cache
 * with stale data and the UI gets stuck on "Awaiting current withdrawer to claim".
 *
 * Poll the viewer directly until `canWithdraw` flips to false (the claimer has
 * claimed), then invalidate so every mounted query refetches fresh data.
 */
export async function refetchAfterClaim(
  queryClient: QueryClient,
  {
    circleId,
    member,
    attempts = 6,
    delayMs = 1200,
  }: { circleId: bigint; member: Address; attempts?: number; delayMs?: number }
) {
  for (let i = 0; i < attempts; i++) {
    try {
      const data = await readContract(wagmiConfig, {
        address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
        abi: savingCirclesViewerAbi,
        functionName: "getUserCircleData",
        args: [member, circleId],
        chainId: getDefaultChainId(),
      });
      if (data?.canWithdraw === false) break;
    } catch {
      // ignore and retry — the next poll will pick up the settled state
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  await queryClient.invalidateQueries({ queryKey: ["readContract"] });
  await queryClient.invalidateQueries({ queryKey: ["readContracts"] });
}
