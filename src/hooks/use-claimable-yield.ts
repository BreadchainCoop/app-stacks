import { yieldSavingCirclesAbi } from "@/lib/abis/yield-saving-circles";
import { YIELD_SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useConnectedUser } from "@breadcoop/ui";
import { Address } from "viem";
import { useReadContract } from "wagmi";

// Reads the member's accrued-but-unclaimed yield (in underlying units) from the
// YieldSavingCircles contract. Enabled only when a yield contract is configured.
export function useClaimableYield({ member }: { member?: Address }) {
  const { user: connectedUser } = useConnectedUser();
  const isConnected =
    connectedUser.status === "CONNECTED" ||
    connectedUser.status === "UNSUPPORTED_CHAIN";
  const address = isConnected ? connectedUser.address : undefined;
  const user = member || address;

  const hasYieldContract =
    !!YIELD_SAVING_CIRCLES_CONTRACT_ADDRESS &&
    YIELD_SAVING_CIRCLES_CONTRACT_ADDRESS.length > 0;

  const { data, isLoading, error, refetch } = useReadContract({
    address: YIELD_SAVING_CIRCLES_CONTRACT_ADDRESS,
    abi: yieldSavingCirclesAbi,
    functionName: "claimableYield",
    args: [user!],
    query: {
      enabled: hasYieldContract && user !== undefined,
      refetchOnWindowFocus: false,
    },
    chainId: getDefaultChainId(),
  });

  return {
    claimableYield: (data as bigint | undefined) ?? 0n,
    isLoading,
    error,
    refetch,
    hasYieldContract,
  };
}
