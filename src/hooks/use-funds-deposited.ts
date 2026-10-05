"use client";

import {
  useActiveChainId,
  useChainConfig,
} from "@/components/providers/active-chain";
import { paginateLogs } from "@/utils/paginate-logs";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { usePublicClient } from "wagmi";

interface LogArgs {
  id: bigint;
  member: Address;
  amount: bigint;
}

const FUNDS_DEPOSITED_EVENT = {
  type: "event" as const,
  name: "FundsDeposited",
  inputs: [
    { name: "id", type: "uint256" as const, indexed: true },
    { name: "member", type: "address" as const, indexed: true },
    { name: "amount", type: "uint256" as const, indexed: false },
  ],
} as const;

export interface DepositEntry {
  amount: bigint;
  txHash: string;
}

export interface FundsDepositedData {
  totalDeposit: bigint;
  depositsByMember: Record<Address, DepositEntry[]>;
  lastActiveRound: number;
  membersDepositedInCurrentRound: number;
  totalDepositInCurrentRound: bigint;
}

export interface UseFundsDepositedParams {
  circleId: string;
  enabled: boolean;
  totalRounds: number;
  fromBlock?: bigint;
  toBlock?: bigint | "latest";
  circleStartsTimestamp: bigint;
  depositInterval: bigint;
}

export function useFundsDeposited({
  circleId,
  enabled,
  totalRounds,
  fromBlock,
  toBlock,
  circleStartsTimestamp,
  depositInterval,
}: UseFundsDepositedParams) {
  const totalMembers = totalRounds;
  const chainId = useActiveChainId();
  const { savingCircles, contractCreationBlock } = useChainConfig();
  const publicClient = usePublicClient({ chainId });
  const circleEndsTimestamp =
    circleStartsTimestamp + BigInt(totalRounds) * depositInterval;

  const defaultFromBlock = contractCreationBlock;

  return useQuery<FundsDepositedData>({
    queryKey: ["fundsDeposited", chainId, circleId],
    enabled: Boolean(publicClient) && enabled,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }): Promise<FundsDepositedData> => {
      if (!publicClient) throw new Error("No public client");

      const logs = await paginateLogs<LogArgs>({
        publicClient,
        event: FUNDS_DEPOSITED_EVENT,
        args: { id: BigInt(circleId) },
        address: savingCircles,
        fromBlock: fromBlock ?? defaultFromBlock,
        toBlock: toBlock ?? "latest",
        fromTimestamp: circleStartsTimestamp,
        toTimestamp: circleEndsTimestamp,
        signal,
      });

      if (logs.length === 0) {
        return {
          totalDeposit: BigInt(0),
          depositsByMember: {},
          lastActiveRound: 0,
          membersDepositedInCurrentRound: 0,
          totalDepositInCurrentRound: BigInt(0),
        };
      }

      let totalDeposit = BigInt(0);
      const depositsByMember: Record<Address, DepositEntry[]> = {};

      for (const log of logs) {
        if (log.blockNumber === null) continue;
        const { member, amount } = log.args;
        const key = member.toLowerCase() as Address;

        if (!depositsByMember[key]) depositsByMember[key] = [];
        depositsByMember[key].push({
          amount,
          txHash: log.transactionHash ?? "",
        });

        totalDeposit += amount;
      }

      const memberDeposits = Object.values(depositsByMember);

      const membersWhoDeposited = memberDeposits.length;
      const minDeposits =
        membersWhoDeposited < totalMembers
          ? 0
          : Math.min(...memberDeposits.map((d) => d.length));

      const lastActiveRound = minDeposits;

      const currentRound = Math.min(minDeposits + 1, totalRounds);

      const membersInCurrentRound = memberDeposits.filter(
        (d) => d.length >= currentRound
      );

      const membersDepositedInCurrentRound = membersInCurrentRound.length;

      const totalDepositInCurrentRound = membersInCurrentRound.reduce(
        (sum, d) => sum + d[currentRound - 1].amount,
        BigInt(0)
      );

      return {
        totalDeposit,
        depositsByMember,
        lastActiveRound,
        membersDepositedInCurrentRound,
        totalDepositInCurrentRound,
      };
    },
  });
}
