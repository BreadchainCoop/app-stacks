import { accumulatingSavingCirclesAbi } from "@/lib/abis/accumulating-saving-circles";
import { ASCA_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { Address } from "viem";
import { useReadContract } from "wagmi";

/**
 * A member's open loan with interest accrued up to now, plus its due date
 * (getLoan). loan.principal === 0n means no open loan (dueDate is 0n).
 */
export function useAscaLoan(
  fundId: bigint | undefined,
  member: Address | undefined
) {
  const result = useReadContract({
    address: ASCA_CONTRACT_ADDRESS,
    abi: accumulatingSavingCirclesAbi,
    functionName: "getLoan",
    args:
      fundId !== undefined && member !== undefined
        ? [fundId, member]
        : undefined,
    query: {
      enabled: fundId !== undefined && !!member,
    },
    chainId: getDefaultChainId(),
  });

  return {
    ...result,
    loan: result.data?.[0],
    dueDate: result.data?.[1],
  };
}
