import { collectiveFundCirclesAbi } from "@/lib/abis/collective-fund-circles";
import { COLLECTIVE_FUND_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { Address, zeroAddress } from "viem";
import { useReadContracts } from "wagmi";

const collectiveContract = {
  address: COLLECTIVE_FUND_CONTRACT_ADDRESS,
  abi: collectiveFundCirclesAbi,
  chainId: getDefaultChainId(),
} as const;

/**
 * A member's position in a collective fund: membership, share balance, the
 * payout they would receive by burning all their shares now, and their index
 * in the member list (voting eligibility: memberIndex < a proposal's
 * snapshotted electorate) — batched into one multicall.
 */
export function useCollectiveMemberPosition(
  fundId: bigint | undefined,
  member: Address | undefined
) {
  const id = fundId ?? BigInt(0);
  const account = member ?? zeroAddress;

  const result = useReadContracts({
    contracts: [
      { ...collectiveContract, functionName: "isMember", args: [id, account] },
      { ...collectiveContract, functionName: "sharesOf", args: [id, account] },
      {
        ...collectiveContract,
        functionName: "previewWithdraw",
        args: [id, account],
      },
      {
        ...collectiveContract,
        functionName: "memberIndex",
        args: [id, account],
      },
    ],
    query: {
      enabled: fundId !== undefined && !!member,
    },
  });

  const [isMember, shares, redeemable, memberIndex] = result.data ?? [];

  const position =
    isMember?.status === "success"
      ? {
          isMember: isMember.result,
          shares: shares?.result ?? BigInt(0),
          redeemable: redeemable?.result ?? BigInt(0),
          memberIndex: memberIndex?.result ?? BigInt(0),
        }
      : undefined;

  return { ...result, position };
}
