"use client";

import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { clientEnv } from "@/lib/env";
import { getDefaultChainId } from "@/utils/chain";
import { paginateLogs } from "@/utils/paginate-logs";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Address, getAbiItem } from "viem";
import { usePublicClient } from "wagmi";

export type AccountHistoryType = "deposit" | "withdraw";

export interface AccountHistoryEntry {
  type: AccountHistoryType;
  circleId: bigint;
  amount: bigint;
  txHash: string;
}

interface LogArgs {
  id: bigint;
  member: Address;
  amount: bigint;
}

// Same on-chain events as `use-funds-deposited` / `use-get-last-claimed`, but
// filtered by `member` (indexed) so we read a single account's activity across
// every circle it has touched.
const FUNDS_DEPOSITED_EVENT = getAbiItem({
  abi: savingCirclesAbi,
  name: "FundsDeposited",
});

const FUNDS_WITHDRAWN_EVENT = getAbiItem({
  abi: savingCirclesAbi,
  name: "FundsWithdrawn",
});

// The card only renders the most recent slice of activity, so cap what we hand
// back. Entries are sorted newest-first before slicing.
const MAX_ENTRIES = 25;

// Account activity only changes when the viewer deposits or withdraws, so avoid
// re-scanning the chain from the contract creation block on every remount.
const STALE_TIME = 60_000;

export function useAccountHistory(address: Address | undefined) {
  const publicClient = usePublicClient({ chainId: getDefaultChainId() });

  const { data, ...result } = useQuery<AccountHistoryEntry[]>({
    queryKey: ["accountHistory", address?.toLowerCase()],
    enabled: Boolean(publicClient) && Boolean(address),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
    queryFn: async ({ signal }): Promise<AccountHistoryEntry[]> => {
      if (!publicClient || !address) return [];

      const fromBlock = BigInt(
        clientEnv.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK
      );
      // Resolve the head once so both scans cover an identical range. Letting
      // each resolve "latest" independently can land them on different blocks,
      // which would show a withdrawal without its paired deposit at the edge.
      const toBlock = await publicClient.getBlockNumber();

      const [deposits, withdrawals] = await Promise.all([
        paginateLogs<LogArgs>({
          publicClient,
          event: FUNDS_DEPOSITED_EVENT,
          args: { member: address },
          address: SAVING_CIRCLES_CONTRACT_ADDRESS,
          fromBlock,
          toBlock,
          signal,
        }),
        paginateLogs<LogArgs>({
          publicClient,
          event: FUNDS_WITHDRAWN_EVENT,
          args: { member: address },
          address: SAVING_CIRCLES_CONTRACT_ADDRESS,
          fromBlock,
          toBlock,
          signal,
        }),
      ]);

      return (
        [
          ...deposits.map((log) => ({ log, type: "deposit" as const })),
          ...withdrawals.map((log) => ({ log, type: "withdraw" as const })),
        ]
          .filter(
            (entry): entry is typeof entry & { log: { blockNumber: bigint } } =>
              entry.log.blockNumber !== null
          )
          // Newest first, tie-breaking on log order within a block.
          .sort((a, b) => {
            if (a.log.blockNumber !== b.log.blockNumber) {
              return b.log.blockNumber > a.log.blockNumber ? 1 : -1;
            }
            return (b.log.logIndex ?? 0) - (a.log.logIndex ?? 0);
          })
          .slice(0, MAX_ENTRIES)
          .map(({ log, type }) => ({
            type,
            circleId: log.args.id,
            amount: log.args.amount,
            txHash: log.transactionHash ?? "",
          }))
      );
    },
  });

  return { history: data ?? [], ...result };
}
