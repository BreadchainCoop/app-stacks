import { serverEnv } from "@/lib/envs/server";

/**
 * Server-side lookup of the wallets a Privy account owns.
 *
 * `users.wallet_address` stores a single address, but a Privy account can hold
 * several — an embedded wallet plus any linked external ones — and the wallet
 * that acts on-chain may be either (see useEffectiveMemberAddress). Anything
 * authorizing against an on-chain address therefore cannot rely on the cached
 * column alone. Privy is the authority on which wallets belong to an account,
 * so ask it.
 *
 * Docs: https://docs.privy.io/api-reference/users/get
 */

type PrivyLinkedAccount = {
  type?: string;
  address?: string;
};

type PrivyUser = {
  linked_accounts?: PrivyLinkedAccount[];
};

const PRIVY_API = "https://auth.privy.io/api/v1";

/**
 * Whether `address` is one of the wallets linked to `privyUserId`.
 *
 * Returns false when the app secret is unset, so a deployment that hasn't
 * configured it simply keeps the previous (cached-address-only) behaviour
 * rather than failing the request.
 */
export const privyUserOwnsWallet = async (
  privyUserId: string,
  address: string
): Promise<boolean> => {
  const appId = serverEnv.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = serverEnv.PRIVY_APP_SECRET;

  if (!appSecret) {
    console.warn(
      "PRIVY_APP_SECRET is not configured — cannot verify linked wallets"
    );
    return false;
  }

  try {
    const res = await fetch(
      `${PRIVY_API}/users/${encodeURIComponent(privyUserId)}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString("base64")}`,
          "privy-app-id": appId,
        },
      }
    );

    if (!res.ok) {
      console.error("Privy user lookup failed:", res.status);
      return false;
    }

    const user = (await res.json()) as PrivyUser;
    const target = address.toLowerCase();

    return (user.linked_accounts ?? []).some(
      (account) =>
        account.type === "wallet" && account.address?.toLowerCase() === target
    );
  } catch (err) {
    console.error("Privy user lookup error:", err);
    return false;
  }
};
