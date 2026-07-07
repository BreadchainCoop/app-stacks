import { collectiveFundCirclesAbi } from "@/lib/abis/collective-fund-circles";
import { COLLECTIVE_FUND_CONTRACT_ADDRESS } from "@/lib/constants";
import { CollectiveFund } from "@/hooks/use-collective-fund";
import { getDefaultChainId } from "@/utils/chain";
import { Address } from "viem";
import { useReadContract, useReadContracts } from "wagmi";

const collectiveContract = {
  address: COLLECTIVE_FUND_CONTRACT_ADDRESS,
  abi: collectiveFundCirclesAbi,
  chainId: getDefaultChainId(),
} as const;

export type CollectiveMemberFund = { id: bigint; fund: CollectiveFund };

/**
 * The collective funds the connected member belongs to (getMemberFunds reverse
 * index), each zipped with its getFund config via one batched multicall.
 */
export function useCollectiveMemberFunds(member: Address | undefined) {
  const idsResult = useReadContract({
    ...collectiveContract,
    functionName: "getMemberFunds",
    args: member ? [member] : undefined,
    query: {
      enabled: !!member,
    },
  });

  const ids = idsResult.data ?? [];

  const { data: fundResults, isLoading: fundsLoading } = useReadContracts({
    contracts: ids.map((id) => ({
      ...collectiveContract,
      functionName: "getFund" as const,
      args: [id] as const,
    })),
    query: {
      enabled: ids.length > 0,
    },
  });

  const funds: CollectiveMemberFund[] = ids.flatMap((id, index) => {
    const result = fundResults?.[index];
    if (result?.status !== "success") return [];
    return [{ id, fund: result.result as CollectiveFund }];
  });

  return {
    funds,
    isLoading: idsResult.isLoading || fundsLoading,
    error: idsResult.error,
  };
}
