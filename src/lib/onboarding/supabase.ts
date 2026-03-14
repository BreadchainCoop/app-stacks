import type { User, WalletWithMetadata } from "@privy-io/react-auth";

export const onboardSupabaseUser = async (user: User) => {
  const privayWallet = user.linkedAccounts.find(
    (a) => a.type === "wallet" && a.walletClientType === "privy"
  );

  const response = await fetch("/api/onboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      privyUserId: user.id,
      walletAddress: (privayWallet as WalletWithMetadata)?.address ?? null, //  this shouldn't be null
    }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error ?? "Onboarding failed");
  }
};
