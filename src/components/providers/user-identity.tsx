"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";

// Who the signed-in user is, independent of the mounted provider stack.
// userId is the external id stored in users.privy_user_id — a Privy DID on
// the web stack, or "minipay:<address>" inside MiniPay (which has no Privy).
export type UserIdentity = {
  /** False until the auth layer knows whether a user is present. */
  ready: boolean;
  userId: string | undefined;
  /** Bearer token for authenticated API routes (null when signed out). */
  getAuthToken: () => Promise<string | null>;
};

const UserIdentityContext = createContext<UserIdentity | null>(null);

export const UserIdentityProvider = UserIdentityContext.Provider;

export const useUserIdentity = (): UserIdentity => {
  const identity = useContext(UserIdentityContext);

  if (!identity) {
    throw new Error("useUserIdentity must be used within a provider stack");
  }

  return identity;
};

/** Privy stack: identity comes from the Privy user and access token. */
export const PrivyUserIdentityProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user, ready, getAccessToken } = usePrivy();
  const userId = user?.id;

  const identity = useMemo(
    () => ({ ready, userId, getAuthToken: getAccessToken }),
    [ready, userId, getAccessToken]
  );

  return (
    <UserIdentityProvider value={identity}>{children}</UserIdentityProvider>
  );
};
