import { accumulatingSavingCirclesAbi } from "@/lib/abis/accumulating-saving-circles";
import { ASCA_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useReadContract } from "wagmi";

/** A fund's configuration and lifecycle flag (getFund). */
export function useAscaFund(fundId: bigint | undefined) {
  return useReadContract({
    address: ASCA_CONTRACT_ADDRESS,
    abi: accumulatingSavingCirclesAbi,
    functionName: "getFund",
    args: fundId !== undefined ? [fundId] : undefined,
    query: {
      enabled: fundId !== undefined,
    },
    chainId: getDefaultChainId(),
  });
}

export type AscaFund = NonNullable<ReturnType<typeof useAscaFund>["data"]>;

/** The fund's aggregate balances (getFundBalances). */
export function useAscaFundBalances(fundId: bigint | undefined) {
  const result = useReadContract({
    address: ASCA_CONTRACT_ADDRESS,
    abi: accumulatingSavingCirclesAbi,
    functionName: "getFundBalances",
    args: fundId !== undefined ? [fundId] : undefined,
    query: {
      enabled: fundId !== undefined,
    },
    chainId: getDefaultChainId(),
  });

  return {
    ...result,
    balances: result.data
      ? {
          totalSavings: result.data[0],
          totalBorrowed: result.data[1],
          poolCash: result.data[2],
        }
      : undefined,
  };
}
