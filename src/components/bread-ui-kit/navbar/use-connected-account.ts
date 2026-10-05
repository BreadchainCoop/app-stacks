"use client";

import { useConnectedUser } from "@breadcoop/ui";
import { useUserIdentity } from "@/components/providers/user-identity";
import { useDisplayName } from "@/components/display-name";
import { useMyProfile } from "@/hooks/use-my-profile";

export function useConnectedAccount() {
  const { user } = useConnectedUser();
  // The external user id, not usePrivy().user — that is undefined inside
  // MiniPay (no Privy session), which left a MiniPay user's own alias
  // unresolved in the navbar.
  const { userId } = useUserIdentity();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;

  // Own alias comes from the profile query rather than the public
  // wallet -> alias lookup, so it stays correct right after an edit —
  // same split as account/_components/account-profile-card.tsx.
  const myProfile = useMyProfile(userId);
  const { displayName } = useDisplayName(address, myProfile);

  return {
    user,
    address,
    displayName: address ? displayName : undefined,
  };
}
