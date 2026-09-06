import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useConnectedUser } from "@breadcoop/ui";
import { useReadContract } from "wagmi";
import {
  useEmbeddedWalletAddress,
  useLinkedExternalWallet,
} from "./use-linked-external-wallet";

/**
 * The address that should actually be used to read/act on this circle's
 * membership. Normally just the connected address — but a member who was
 * added to this circle under their linked external wallet will still
 * resolve to their embedded wallet via useConnectedUser(), since Privy
 * always prefers the first-verified wallet. Check whether the linked
 * external wallet is the real on-chain member for this specific circle and
 * prefer it when so.
 */
export const useEffectiveMemberAddress = (circleId: bigint | undefined) => {
  const { user } = useConnectedUser();
  const connectedAddress =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;

  const embeddedAddress = useEmbeddedWalletAddress();
  const externalAddress = useLinkedExternalWallet();

  const canDiffer =
    !!embeddedAddress &&
    !!externalAddress &&
    embeddedAddress.toLowerCase() !== externalAddress.toLowerCase();

  const { data: isExternalMember } = useReadContract({
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    abi: savingCirclesAbi,
    functionName: "isMember",
    args:
      circleId !== undefined && externalAddress
        ? [circleId, externalAddress]
        : undefined,
    query: { enabled: canDiffer && circleId !== undefined },
    chainId: getDefaultChainId(),
  });

  if (canDiffer && isExternalMember && externalAddress) {
    return externalAddress;
  }

  return connectedAddress;
};
