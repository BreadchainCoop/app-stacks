import { Config, getBlockNumber } from "@wagmi/core";
import { TransactionReceipt } from "viem";

/**
 * TEMPORARY — diagnosing why contract reads still return pre-transaction state
 * on Celo after a write, while the same code refreshes correctly on Sepolia.
 * Remove once that is settled; see the plan's "Diagnostic" section.
 *
 * Gated on a flag rather than NODE_ENV because the branch deploy we reproduce
 * this on runs a production build.
 */
export const debugTxEnabled = process.env.NEXT_PUBLIC_DEBUG_TX === "1";

export type DebugTxEntry = {
  at: string;
  label: string;
  chainId: number;
  receiptBlock: string;
  receiptStatus: string;
  readBlockImmediately: string;
  readBlockAfterDelay: string;
  lagging: string;
};

// Entries are surfaced by <DebugTxPanel/> rather than only console.log, because
// this is reproduced inside MiniPay's in-app browser on a phone, where there is
// no reachable console.
const entries: DebugTxEntry[] = [];
const listeners = new Set<() => void>();

export const debugTxStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);

    return () => listeners.delete(listener);
  },
  getSnapshot(): readonly DebugTxEntry[] {
    return entries;
  },
  push(entry: DebugTxEntry) {
    // Newest first, and capped — a long session should not grow unbounded.
    entries.unshift(entry);
    entries.length = Math.min(entries.length, 20);
    listeners.forEach((listener) => listener());
  },
  clear() {
    entries.length = 0;
    listeners.forEach((listener) => listener());
  },
};

/**
 * Records the block a write landed in against the block the RPC serves reads
 * from immediately afterwards. If the latter is behind, the post-write refetch
 * is hitting a lagging replica (`forno.celo.org` is a load-balanced public
 * fleet on ~1s blocks) and the stale UI is an RPC consistency problem, not a
 * cache invalidation one.
 */
export const logTxDiagnostics = async (
  config: Config,
  chainId: number,
  receipt: TransactionReceipt | undefined,
  label: string
) => {
  if (!debugTxEnabled) return;

  const read = async () => {
    try {
      return await getBlockNumber(config, { chainId, cacheTime: 0 });
    } catch (err) {
      return `error: ${(err as Error).message}`;
    }
  };

  const immediate = await read();
  // A second sample: if this one has caught up but the first had not, the
  // refetch simply ran too early.
  const afterDelay = await new Promise<bigint | string>((resolve) =>
    setTimeout(() => resolve(read()), 1500)
  );

  const entry: DebugTxEntry = {
    at: new Date().toISOString().slice(11, 19),
    label,
    chainId,
    receiptBlock: receipt?.blockNumber?.toString() ?? "-",
    receiptStatus: receipt?.status ?? "-",
    readBlockImmediately: immediate.toString(),
    readBlockAfterDelay: afterDelay.toString(),
    lagging:
      typeof immediate === "bigint" && receipt !== undefined
        ? String(immediate < receipt.blockNumber)
        : "unknown",
  };

  debugTxStore.push(entry);
  console.log("[debug-tx]", entry);
};
