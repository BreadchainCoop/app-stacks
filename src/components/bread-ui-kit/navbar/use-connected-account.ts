"use client";

import { useConnectedUser } from "@breadcoop/ui";
import { usePrivy } from "@privy-io/react-auth";
import { useDisplayName } from "@/components/display-name";
import { useMyProfile } from "@/hooks/use-my-profile";

export function useConnectedAccount() {
  const { user } = useConnectedUser();
  const { user: privyUser } = usePrivy();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;

  // Own alias comes from the profile query rather than the public
  // wallet -> alias lookup, so it stays correct right after an edit —
  // same split as account/_components/profile-section.tsx.
  const { alias } = useMyProfile(privyUser?.id);
  const { displayName } = useDisplayName(address, alias);

  return {
    user,
    address,
    displayName: address ? displayName : undefined,
  };
}
