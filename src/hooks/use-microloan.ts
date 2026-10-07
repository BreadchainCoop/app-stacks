import { microloansAbi } from "@/lib/abis/microloans";
import { MICROLOANS_CONTRACT_ADDRESS } from "@/lib/constants";
import { LoanState } from "@/lib/microloan-state";
import { getDefaultChainId } from "@/utils/chain";
import { Address } from "viem";
import { useReadContract, useReadContracts } from "wagmi";

const microloansContract = {
  address: MICROLOANS_CONTRACT_ADDRESS,
  abi: microloansAbi,
  chainId: getDefaultChainId(),
} as const;

/**
 * One loan's terms, status, derived state and outstanding principal, read in
 * a single multicall.
 */
export function useMicroloan(loanId: bigint | undefined) {
  const id = loanId ?? BigInt(0);
  const result = useReadContracts({
    contracts: [
      { ...microloansContract, functionName: "getLoan", args: [id] },
      { ...microloansContract, functionName: "loanState", args: [id] },
      { ...microloansContract, functionName: "outstanding", args: [id] },
    ],
    allowFailure: false,
    query: { enabled: loanId !== undefined },
  });

  const [loan, state, outstanding] = result.data ?? [];

  return {
    ...result,
    terms: loan?.[0],
    status: loan?.[1],
    state: state !== undefined ? (state as LoanState) : undefined,
    outstanding,
  };
}

export type LoanTerms = NonNullable<ReturnType<typeof useMicroloan>["terms"]>;
export type LoanStatus = NonNullable<ReturnType<typeof useMicroloan>["status"]>;

export type MicroloanSummary = {
  id: bigint;
  terms: LoanTerms;
  status: LoanStatus;
  state: LoanState;
};

/**
 * Every loan an address lent or borrows (getLenderLoans / getBorrowerLoans
 * reverse indexes), each zipped with getLoan and loanState via one batched
 * multicall (2 reads per loan).
 */
export function useAddressMicroloans(address: Address | undefined) {
  const lenderIds = useReadContract({
    ...microloansContract,
    functionName: "getLenderLoans",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const borrowerIds = useReadContract({
    ...microloansContract,
    functionName: "getBorrowerLoans",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // A loan id appears in only one index per address (lender can't borrow)
  const ids = [...(lenderIds.data ?? []), ...(borrowerIds.data ?? [])];

  const { data: loanResults, isLoading: loansLoading } = useReadContracts({
    contracts: ids.flatMap((id) => [
      {
        ...microloansContract,
        functionName: "getLoan" as const,
        args: [id] as const,
      },
      {
        ...microloansContract,
        functionName: "loanState" as const,
        args: [id] as const,
      },
    ]),
    query: { enabled: ids.length > 0 },
  });

  const loans: MicroloanSummary[] = ids.flatMap((id, index) => {
    const loanResult = loanResults?.[index * 2];
    const stateResult = loanResults?.[index * 2 + 1];
    if (loanResult?.status !== "success" || stateResult?.status !== "success") {
      return [];
    }

    const [terms, status] = loanResult.result as readonly [
      LoanTerms,
      LoanStatus,
    ];

    return [
      { id, terms, status, state: Number(stateResult.result) as LoanState },
    ];
  });

  return {
    loans,
    isLoading: lenderIds.isLoading || borrowerIds.isLoading || loansLoading,
    error: lenderIds.error ?? borrowerIds.error,
  };
}
