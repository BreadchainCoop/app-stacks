import type { User } from "@privy-io/react-auth";

export const onboardSupabaseUser = async (user: User) => {
  const response = await fetch("/api/onboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      privyUserId: user.id,
      walletAddress: user.wallet?.address ?? null,
    }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error ?? "Onboarding failed");
  }
};
