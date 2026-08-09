import { collectiveFundCirclesAbi } from "@/lib/abis/collective-fund-circles";
import { ProposalState } from "@/lib/collective-state";
import { COLLECTIVE_FUND_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { Address, zeroAddress } from "viem";
import { useReadContract, useReadContracts } from "wagmi";

const collectiveContract = {
  address: COLLECTIVE_FUND_CONTRACT_ADDRESS,
  abi: collectiveFundCirclesAbi,
  chainId: getDefaultChainId(),
} as const;

export type CollectiveProposal = {
  proposalId: bigint;
  proposer: Address;
  recipient: Address;
  amount: bigint;
  createdAt: bigint;
  electorate: bigint;
  requiredYes: bigint;
  yesVotes: bigint;
  noVotes: bigint;
  executed: boolean;
  description: string;
  state: ProposalState | undefined;
  isExecutable: boolean;
  hasVoted: boolean;
};

/**
 * All proposals of a fund in creation order (getProposals), each enriched
 * with its derived lifecycle state, whether execute() would currently
 * succeed, and whether `voter` has already voted — via one batched
 * proposalState/isExecutable/hasVoted multicall.
 */
export function useCollectiveProposals(
  fundId: bigint | undefined,
  voter: Address | undefined
) {
  const proposalsResult = useReadContract({
    ...collectiveContract,
    functionName: "getProposals",
    args: fundId !== undefined ? [fundId] : undefined,
    query: {
      enabled: fundId !== undefined,
    },
    chainId: getDefaultChainId(),
  });

  const rawProposals = proposalsResult.data ?? [];
  const id = fundId ?? BigInt(0);
  const account = voter ?? zeroAddress;

  const contracts = rawProposals.flatMap((_, index) => [
    {
      ...collectiveContract,
      functionName: "proposalState" as const,
      args: [id, BigInt(index)] as const,
      chainId: getDefaultChainId(),
    },
    {
      ...collectiveContract,
      functionName: "isExecutable" as const,
      args: [id, BigInt(index)] as const,
      chainId: getDefaultChainId(),
    },
    {
      ...collectiveContract,
      functionName: "hasVoted" as const,
      args: [id, BigInt(index), account] as const,
      chainId: getDefaultChainId(),
    },
  ]);

  const { data: statusResults, isLoading: statusesLoading } = useReadContracts({
    contracts,
    query: {
      enabled: fundId !== undefined && rawProposals.length > 0,
    },
  });

  const proposals: CollectiveProposal[] = rawProposals.map(
    (proposal, index) => {
      const stateResult = statusResults?.[index * 3];
      const executableResult = statusResults?.[index * 3 + 1];
      const hasVotedResult = statusResults?.[index * 3 + 2];

      return {
        proposalId: BigInt(index),
        ...proposal,
        state:
          stateResult?.status === "success"
            ? (stateResult.result as ProposalState)
            : undefined,
        isExecutable:
          executableResult?.status === "success"
            ? (executableResult.result as boolean)
            : false,
        hasVoted:
          hasVotedResult?.status === "success"
            ? (hasVotedResult.result as boolean)
            : false,
      };
    }
  );

  return {
    proposals,
    isLoading: proposalsResult.isLoading || statusesLoading,
    error: proposalsResult.error,
  };
}
