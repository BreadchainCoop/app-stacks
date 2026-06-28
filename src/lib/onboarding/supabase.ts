import type { User, WalletWithMetadata } from "@privy-io/react-auth";

export const onboardSupabaseUser = async (user: User) => {
  // Record the user's operative wallet. Prefer the Privy embedded wallet when
  // one exists (email/social sign-ins), but fall back to the connected
  // self-custody (external) wallet so EOA sign-ins (MetaMask, Rabby, etc.)
  // still register with their own address instead of null.
  const walletAccounts = user.linkedAccounts.filter(
    (a): a is WalletWithMetadata => a.type === "wallet"
  );
  const embeddedWallet = walletAccounts.find(
    (a) => a.walletClientType === "privy"
  );
  const externalWallet = walletAccounts.find(
    (a) => a.walletClientType !== "privy"
  );
  const walletAddress =
    embeddedWallet?.address ??
    externalWallet?.address ??
    user.wallet?.address ??
    null;

  const response = await fetch("/api/onboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      privyUserId: user.id,
      walletAddress,
    }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error ?? "Onboarding failed");
  }
};
