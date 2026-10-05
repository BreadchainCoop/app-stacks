import { Config, getBlockNumber } from "@wagmi/core";

// Measured on Celo Sepolia: the endpoint serving reads sat 2-3 blocks behind
// the block a write landed in, and was still ~1 block behind 1.5s later. Blocks
// are ~1s there, so a few seconds is the realistic worst case; the cap exists
// so a genuinely stuck endpoint cannot hang a write forever.
const MAX_WAIT_MS = 8000;
const POLL_INTERVAL_MS = 400;

/**
 * Waits until the RPC serving reads has advanced to `blockNumber`.
 *
 * `useReadContract` reads at `latest`. A public, load-balanced endpoint can
 * hand back a receipt from one replica and then serve the next request from
 * another that has not applied that block yet, so refetching the moment a
 * receipt arrives returns pre-transaction state — and because wagmi applies
 * `structuralSharing`, an unchanged result re-renders nothing and the view
 * stays stale until a reload.
 *
 * Returns whether it caught up; callers proceed either way rather than block
 * the UI on an endpoint that never converges.
 */
export const waitForReadConsistency = async (
  config: Config,
  chainId: number,
  blockNumber: bigint,
  // Seam for testing the polling and timeout behaviour without a network.
  readHead: (config: Config, chainId: number) => Promise<bigint> = (c, id) =>
    // cacheTime: 0 — a cached head would defeat the point of polling.
    getBlockNumber(c, { chainId: id, cacheTime: 0 })
): Promise<boolean> => {
  const deadline = Date.now() + MAX_WAIT_MS;

  while (Date.now() < deadline) {
    try {
      const head = await readHead(config, chainId);

      if (head >= blockNumber) return true;
    } catch {
      // A transient RPC failure is not a reason to give up early; keep
      // polling until the deadline.
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  return false;
};
