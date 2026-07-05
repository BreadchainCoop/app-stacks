"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useConnectedUser } from "@breadcoop/ui";
import { isLocalMode } from "@/lib/network-mode";
import { localUserId } from "@/lib/local-supabase";

/**
 * Off-chain identity for supabase metadata: the Privy user id, or the
 * synthetic "local:<address>" identity for the connected Anvil account.
 */
export function useAppUserId(): string | undefined {
  const { user: privyUser } = usePrivy();
  const { user } = useConnectedUser();

  if (isLocalMode()) {
    return user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? localUserId(user.address)
      : undefined;
  }

  return privyUser?.id ?? undefined;
}
