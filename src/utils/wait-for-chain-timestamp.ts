import { Config, getBlock } from "@wagmi/core";

// A round rollover happens once per deposit interval, so polling slowly is
// fine. The cap covers realistic device-clock skew without spinning forever if
// the boundary is further off than that.
const MAX_WAIT_MS = 60_000;
const POLL_INTERVAL_MS = 2000;

/**
 * Waits until the chain's own latest-block timestamp has passed `timestampSec`.
 *
 * Countdowns run off `useBlockTimestamp`, which outside local dev is just
 * `Date.now()` — the viewer's device clock. The contracts decide which round a
 * circle is in from `block.timestamp`. So a countdown can hit zero while the
 * chain still reports the previous round, and refetching at that moment reads
 * the old state. Since the refetched value is unchanged, `structuralSharing`
 * re-renders nothing and the countdown's own completion latch has already
 * fired, so nothing retries and the view stays put until a reload.
 *
 * Returns whether the chain caught up; callers refresh either way.
 */
export const waitForChainTimestamp = async (
  config: Config,
  chainId: number,
  timestampSec: number,
  // Seam for testing the polling and timeout behaviour without a network.
  readChainTimestamp: (
    config: Config,
    chainId: number
  ) => Promise<number> = async (c, id) =>
    Number((await getBlock(c, { chainId: id, blockTag: "latest" })).timestamp)
): Promise<boolean> => {
  const deadline = Date.now() + MAX_WAIT_MS;

  while (Date.now() < deadline) {
    try {
      if ((await readChainTimestamp(config, chainId)) >= timestampSec) {
        return true;
      }
    } catch {
      // A transient RPC failure is not a reason to give up early; keep
      // polling until the deadline.
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  return false;
};
