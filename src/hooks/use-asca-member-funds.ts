import { accumulatingSavingCirclesAbi } from "@/lib/abis/accumulating-saving-circles";
import { ASCA_CONTRACT_ADDRESS } from "@/lib/constants";
import { AscaFund } from "@/hooks/use-asca-fund";
import { getDefaultChainId } from "@/utils/chain";
import { Address } from "viem";
import { useReadContract, useReadContracts } from "wagmi";

const ascaContract = {
  address: ASCA_CONTRACT_ADDRESS,
  abi: accumulatingSavingCirclesAbi,
  chainId: getDefaultChainId(),
} as const;

export type AscaMemberFund = { id: bigint; fund: AscaFund };

/**
 * The ASCA funds the connected member belongs to (getMemberFunds reverse
 * index), each zipped with its getFund config via one batched multicall.
 */
export function useAscaMemberFunds(member: Address | undefined) {
  const idsResult = useReadContract({
    ...ascaContract,
    functionName: "getMemberFunds",
    args: member ? [member] : undefined,
    query: {
      enabled: !!member,
    },
  });

  const ids = idsResult.data ?? [];

  const { data: fundResults, isLoading: fundsLoading } = useReadContracts({
    contracts: ids.map((id) => ({
      ...ascaContract,
      functionName: "getFund" as const,
      args: [id] as const,
    })),
    query: {
      enabled: ids.length > 0,
    },
  });

  const funds: AscaMemberFund[] = ids.flatMap((id, index) => {
    const result = fundResults?.[index];
    if (result?.status !== "success") return [];
    return [{ id, fund: result.result as AscaFund }];
  });

  return {
    funds,
    isLoading: idsResult.isLoading || fundsLoading,
    error: idsResult.error,
  };
}
