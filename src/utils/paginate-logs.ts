import type { AbiEvent, Address, Log } from "viem";
import type { PublicClient } from "viem";

export interface FullEventLog<Args = unknown> extends Log {
  args: Args;
}

export interface PaginateLogsParams {
  publicClient: PublicClient;
  event: AbiEvent;
  args?: Record<string, unknown>;
  address?: Address;
  fromBlock: bigint;
  toBlock?: bigint | "latest";
  chunkSize?: bigint;
  fromTimestamp?: bigint;
  toTimestamp?: bigint;
  signal?: AbortSignal;
  maxConcurrency?: number;
  maxRetries?: number;
  timeoutMs?: number;
}

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
}

function withAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      if (signal.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
      } else {
        signal.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true }
        );
      }
    }),
  ]);
}

/** Compose multiple AbortSignals into one. */
function anySignal(signals: (AbortSignal | undefined)[]): AbortSignal {
  const controller = new AbortController();
  for (const sig of signals) {
    if (!sig) continue;
    if (sig.aborted) {
      controller.abort(sig.reason);
      break;
    }
    sig.addEventListener("abort", () => controller.abort(sig.reason), {
      once: true,
    });
  }
  return controller.signal;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  signal?: AbortSignal
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    assertNotAborted(signal);
    try {
      return await fn();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      lastError = err;
      if (attempt < maxRetries) {
        const delay = Math.min(200 * 2 ** attempt, 5_000);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }
  throw lastError;
}

async function pooledMap<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker)
  );
  return results;
}

/**
 * Memoised block-timestamp fetcher shared across both binary searches.
 * Eliminates redundant RPC calls when the two searches probe the same block numbers.
 */
function makeBlockCache(publicClient: PublicClient, signal?: AbortSignal) {
  const cache = new Map<bigint, bigint>(); // blockNumber → timestamp

  return async function getTimestamp(blockNumber: bigint): Promise<bigint> {
    const cached = cache.get(blockNumber);
    if (cached !== undefined) return cached;
    const block = await withAbort(
      publicClient.getBlock({ blockNumber }),
      signal
    );
    cache.set(blockNumber, block.timestamp);
    return block.timestamp;
  };
}

/**
 * Interpolation search: estimates where the target timestamp sits proportionally
 * in the block range before bisecting. Reduces iterations from O(log N) ~24
 * to ~3–5 on chains with roughly uniform block times.
 */
async function findLastBlockBeforeTimestamp(
  getTimestamp: (n: bigint) => Promise<bigint>,
  low: bigint,
  high: bigint,
  targetTimestamp: bigint,
  signal?: AbortSignal
): Promise<bigint | null> {
  if ((await getTimestamp(low)) > targetTimestamp) return null;

  let result = low;
  let lowTs = await getTimestamp(low);
  let highTs = await getTimestamp(high);

  while (low <= high) {
    assertNotAborted(signal);

    // Interpolation estimate
    let mid: bigint;
    const tsRange = highTs - lowTs;
    if (tsRange === BigInt(0)) {
      mid = (low + high) / BigInt(2);
    } else {
      const ratio = Number(targetTimestamp - lowTs) / Number(tsRange);
      mid = low + BigInt(Math.floor(ratio * Number(high - low)));
      // Clamp to valid range
      if (mid < low) mid = low;
      if (mid > high) mid = high;
    }

    const midTs = await getTimestamp(mid);
    if (midTs <= targetTimestamp) {
      result = mid;
      low = mid + BigInt(1);
      lowTs = midTs;
    } else {
      high = mid - BigInt(1);
      highTs = midTs;
    }
  }
  return result;
}

async function findFirstBlockAfterTimestamp(
  getTimestamp: (n: bigint) => Promise<bigint>,
  low: bigint,
  high: bigint,
  targetTimestamp: bigint,
  signal?: AbortSignal
): Promise<bigint | null> {
  if ((await getTimestamp(high)) < targetTimestamp) return null;

  let result = high;
  let lowTs = await getTimestamp(low);
  let highTs = await getTimestamp(high);

  while (low <= high) {
    assertNotAborted(signal);

    let mid: bigint;
    const tsRange = highTs - lowTs;
    if (tsRange === BigInt(0)) {
      mid = (low + high) / BigInt(2);
    } else {
      const ratio = Number(targetTimestamp - lowTs) / Number(tsRange);
      mid = low + BigInt(Math.floor(ratio * Number(high - low)));
      if (mid < low) mid = low;
      if (mid > high) mid = high;
    }

    const midTs = await getTimestamp(mid);
    if (midTs >= targetTimestamp) {
      result = mid;
      high = mid - BigInt(1);
      highTs = midTs;
    } else {
      low = mid + BigInt(1);
      lowTs = midTs;
    }
  }
  return result;
}

/** Pick a chunk size that keeps total chunks under ~50 for the given range. */
function adaptiveChunkSize(blockRange: bigint, defaultChunk: bigint): bigint {
  const TARGET_CHUNKS = BigInt(50);
  const adaptive = blockRange / TARGET_CHUNKS;
  return adaptive > defaultChunk ? adaptive : defaultChunk;
}

export async function paginateLogs<Args>({
  publicClient,
  event,
  args,
  address,
  fromBlock,
  toBlock = "latest",
  chunkSize = BigInt(10_000),
  fromTimestamp,
  toTimestamp,
  signal,
  maxConcurrency = 5,
  maxRetries = 3,
  timeoutMs = 60_000, // NEW: 60 s hard cap
}: PaginateLogsParams): Promise<FullEventLog<Args>[]> {
  // Compose the caller's signal with a hard timeout
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const composedSignal = anySignal([signal, timeoutSignal]);

  assertNotAborted(composedSignal);

  let resolvedToBlock =
    toBlock === "latest"
      ? await withAbort(publicClient.getBlockNumber(), composedSignal)
      : toBlock;

  // Shared cache eliminates duplicate getBlock calls between the two searches
  const getTimestamp = makeBlockCache(publicClient, composedSignal);

  const [cappedBlock, startBlock] = await Promise.all([
    toTimestamp !== undefined
      ? findLastBlockBeforeTimestamp(
          getTimestamp,
          fromBlock,
          resolvedToBlock,
          toTimestamp,
          composedSignal
        )
      : Promise.resolve(resolvedToBlock),
    fromTimestamp !== undefined
      ? findFirstBlockAfterTimestamp(
          getTimestamp,
          fromBlock,
          resolvedToBlock,
          fromTimestamp,
          composedSignal
        )
      : Promise.resolve(fromBlock),
  ]);

  if (cappedBlock === null || startBlock === null) return [];

  resolvedToBlock = cappedBlock;
  fromBlock = startBlock;

  if (fromBlock > resolvedToBlock) return [];

  const effectiveChunkSize = adaptiveChunkSize(
    resolvedToBlock - fromBlock,
    chunkSize
  );

  const chunks: Array<{ from: bigint; to: bigint }> = [];
  for (let cur = fromBlock; cur <= resolvedToBlock; cur += effectiveChunkSize) {
    const end = cur + effectiveChunkSize - BigInt(1);
    chunks.push({
      from: cur,
      to: end <= resolvedToBlock ? end : resolvedToBlock,
    });
  }

  const chunkResults = await pooledMap(
    chunks,
    ({ from, to }) =>
      withRetry(
        () =>
          withAbort(
            publicClient.getLogs({
              address,
              event,
              args,
              fromBlock: from,
              toBlock: to,
            }),
            composedSignal
          ),
        maxRetries,
        composedSignal
      ),
    maxConcurrency
  );

  return chunkResults.flat() as unknown as FullEventLog<Args>[];
}
