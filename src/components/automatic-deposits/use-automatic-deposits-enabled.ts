import { useConnectedUser } from "@breadcoop/ui";
import { useReadContract } from "wagmi";
import { automaticSavingCirclesAbi } from "@/lib/abis/automatic-saving-circles";
import { AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";

/**
 * Whether the connected member has automatic deposits on for this circle.
 * `isKnown` is false until the read resolves, so callers that hide themselves
 * when it is on don't flash their content first.
 */
export function useAutomaticDepositsEnabled(stackId: string) {
  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;

  const { data, isFetching } = useReadContract({
    abi: automaticSavingCirclesAbi,
    address: AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
    functionName: "isAutomaticDepositsEnabled",
    args: [BigInt(stackId), address!],
    query: { enabled: !!address },
    chainId: getDefaultChainId(),
  });

  return {
    address,
    isEnabled: data ?? false,
    isKnown: data !== undefined,
    isFetching,
  };
}
