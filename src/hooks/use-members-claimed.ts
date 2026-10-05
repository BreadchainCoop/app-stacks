import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import {
  useActiveChainId,
  useChainConfig,
} from "@/components/providers/active-chain";
import { Address } from "viem";
import { useReadContracts } from "wagmi";

const hasClaimedContract = (address: Address) =>
  ({
    address,
    abi: savingCirclesAbi,
    functionName: "hasClaimed",
  }) as const;

/**
 * Whether each member has already taken their payout, keyed by lowercased
 * address.
 *
 * Reads the contract's canonical `hasClaimed` (set in `_withdraw`) rather than
 * inferring from `FundsWithdrawn` logs: `useGetLastClaimed` only surfaces the
 * most recent claim, which can't answer the question for every member.
 */
export function useMembersClaimed({
  circleId,
  members,
}: {
  circleId: string;
  members: readonly Address[];
}) {
  const chainId = useActiveChainId();
  const { savingCircles } = useChainConfig();
  const { data, isLoading } = useReadContracts({
    contracts: members.map((member) => ({
      ...hasClaimedContract(savingCircles),
      args: [BigInt(circleId), member],
      chainId,
    })),
    query: {
      enabled: members.length > 0,
    },
  });

  const claimedByMember: Record<string, boolean> = {};

  members.forEach((member, index) => {
    const result = data?.[index];
    if (result?.status === "success") {
      claimedByMember[member.toLowerCase()] = result.result;
    }
  });

  return { claimedByMember, isLoading };
}
