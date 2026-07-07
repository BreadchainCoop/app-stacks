import { accumulatingSavingCirclesAbi } from "@/lib/abis/accumulating-saving-circles";
import { ASCA_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { Address, zeroAddress } from "viem";
import { useReadContracts } from "wagmi";

const ascaContract = {
  address: ASCA_CONTRACT_ADDRESS,
  abi: accumulatingSavingCirclesAbi,
  chainId: getDefaultChainId(),
} as const;

/**
 * A member's full position in a fund: savings, withdrawable value, pending
 * interest, credit line and current borrowing headroom, batched into one
 * multicall.
 */
export function useAscaMemberPosition(
  fundId: bigint | undefined,
  member: Address | undefined
) {
  const id = fundId ?? BigInt(0);
  const account = member ?? zeroAddress;

  const result = useReadContracts({
    contracts: [
      { ...ascaContract, functionName: "isMember", args: [id, account] },
      { ...ascaContract, functionName: "savings", args: [id, account] },
      { ...ascaContract, functionName: "withdrawableOf", args: [id, account] },
      {
        ...ascaContract,
        functionName: "pendingInterestOf",
        args: [id, account],
      },
      { ...ascaContract, functionName: "creditLineOf", args: [id, account] },
      { ...ascaContract, functionName: "maxBorrowableOf", args: [id, account] },
    ],
    query: {
      enabled: fundId !== undefined && !!member,
    },
  });

  const [
    isMember,
    savings,
    withdrawable,
    pendingInterest,
    creditLine,
    maxBorrowable,
  ] = result.data ?? [];

  const position =
    isMember?.status === "success"
      ? {
          isMember: isMember.result,
          savings: savings?.result ?? BigInt(0),
          withdrawable: withdrawable?.result ?? BigInt(0),
          pendingInterest: pendingInterest?.result ?? BigInt(0),
          creditLine: creditLine?.result ?? BigInt(0),
          maxBorrowable: maxBorrowable?.result ?? BigInt(0),
        }
      : undefined;

  return { ...result, position };
}
