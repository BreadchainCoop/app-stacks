import { conditionalGrantsAbi } from "@/lib/abis/conditional-grants";
import { CONDITIONAL_GRANTS_CONTRACT_ADDRESS } from "@/lib/constants";
import { GrantState } from "@/lib/conditional-grant-state";
import { getDefaultChainId } from "@/utils/chain";
import { Address } from "viem";
import { useReadContract, useReadContracts } from "wagmi";

const conditionalGrantsContract = {
  address: CONDITIONAL_GRANTS_CONTRACT_ADDRESS,
  abi: conditionalGrantsAbi,
  chainId: getDefaultChainId(),
} as const;

/**
 * One conditional grant's terms, status, derived state, outstanding advance and earliest
 * grant reclaim time, read in
 * a single multicall.
 */
export function useConditionalGrant(grantId: bigint | undefined) {
  const id = grantId ?? BigInt(0);
  const result = useReadContracts({
    contracts: [
      { ...conditionalGrantsContract, functionName: "getGrant", args: [id] },
      { ...conditionalGrantsContract, functionName: "grantState", args: [id] },
      { ...conditionalGrantsContract, functionName: "outstanding", args: [id] },
      {
        ...conditionalGrantsContract,
        functionName: "reclaimableAt",
        args: [id],
      },
    ],
    allowFailure: false,
    query: { enabled: grantId !== undefined },
  });

  const [grantData, state, outstanding, reclaimableAt] = result.data ?? [];

  return {
    ...result,
    terms: grantData?.[0],
    status: grantData?.[1],
    state: state !== undefined ? (state as GrantState) : undefined,
    outstanding,
    /** When the grantor may reclaim the grant; 0 if it can't be reclaimed. */
    reclaimableAt,
  };
}

export type GrantTerms = NonNullable<
  ReturnType<typeof useConditionalGrant>["terms"]
>;
export type GrantStatus = NonNullable<
  ReturnType<typeof useConditionalGrant>["status"]
>;

export type ConditionalGrantSummary = {
  id: bigint;
  terms: GrantTerms;
  status: GrantStatus;
  state: GrantState;
};

/**
 * Every conditional grant an address gave or received (getGrantorGrants / getGranteeGrants
 * reverse indexes), each zipped with getLoan and loanState via one batched
 * multicall (2 reads per grant).
 */
export function useAddressConditionalGrants(address: Address | undefined) {
  const grantorIds = useReadContract({
    ...conditionalGrantsContract,
    functionName: "getGrantorGrants",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const granteeIds = useReadContract({
    ...conditionalGrantsContract,
    functionName: "getGranteeGrants",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // An id appears in only one index per address (a grantor can't be its own grantee)
  const ids = [...(grantorIds.data ?? []), ...(granteeIds.data ?? [])];

  const { data: loanResults, isLoading: loansLoading } = useReadContracts({
    contracts: ids.flatMap((id) => [
      {
        ...conditionalGrantsContract,
        functionName: "getGrant" as const,
        args: [id] as const,
      },
      {
        ...conditionalGrantsContract,
        functionName: "grantState" as const,
        args: [id] as const,
      },
    ]),
    query: { enabled: ids.length > 0 },
  });

  const grants: ConditionalGrantSummary[] = ids.flatMap((id, index) => {
    const loanResult = loanResults?.[index * 2];
    const stateResult = loanResults?.[index * 2 + 1];
    if (loanResult?.status !== "success" || stateResult?.status !== "success") {
      return [];
    }

    const [terms, status] = loanResult.result as readonly [
      GrantTerms,
      GrantStatus,
    ];

    return [
      { id, terms, status, state: Number(stateResult.result) as GrantState },
    ];
  });

  return {
    grants,
    isLoading: grantorIds.isLoading || granteeIds.isLoading || loansLoading,
    error: grantorIds.error ?? granteeIds.error,
  };
}
