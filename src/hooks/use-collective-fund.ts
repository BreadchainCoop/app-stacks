import { collectiveFundCirclesAbi } from "@/lib/abis/collective-fund-circles";
import { COLLECTIVE_FUND_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useReadContract } from "wagmi";

/**
 * A fund's full config and accounting (getFund) — including its on-chain
 * display name (collective funds are white-label; the name is NOT stored in
 * Supabase-only metadata like the other types).
 */
export function useCollectiveFund(fundId: bigint | undefined) {
  return useReadContract({
    address: COLLECTIVE_FUND_CONTRACT_ADDRESS,
    abi: collectiveFundCirclesAbi,
    functionName: "getFund",
    args: fundId !== undefined ? [fundId] : undefined,
    query: {
      enabled: fundId !== undefined,
    },
    chainId: getDefaultChainId(),
  });
}

export type CollectiveFund = NonNullable<
  ReturnType<typeof useCollectiveFund>["data"]
>;
