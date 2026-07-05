import { useBlock } from "wagmi";
import { isLocalMode } from "@/lib/network-mode";
import { getDefaultChainId } from "@/utils/chain";

const isLocal = isLocalMode();

/**
 * Returns the current timestamp in milliseconds.
 * In local environments, reads the latest block timestamp from the chain
 * so it stays in sync with anvil time manipulation (make warp, make time-increase).
 * In production, returns Date.now().
 *
 * @param watch - If true, re-fetches on every new block (local only). Defaults to false.
 */
export function useBlockTimestamp(watch = false): number {
  const { data: block } = useBlock({
    watch: isLocal && watch,
    chainId: getDefaultChainId(),
    query: { enabled: isLocal },
  });

  if (!isLocal) return Date.now();

  return block ? Number(block.timestamp) * 1000 : Date.now();
}
