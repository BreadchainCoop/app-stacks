"use client";

import { useModal } from "@/components/modal/context";
import { useWalletFunding } from "@/hooks/use-wallet-funding";
import { onboardSupabaseUser } from "@/lib/onboarding/supabase";
import { useLogin } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

const LoginTracker = () => {
  const [fundingPromptShown, setFundingPromptShown] = useState(false);
  const [fundingPromptSkipped, setFundingPromptSkipped] = useState(false);
  const { modalState, setModal } = useModal();
  const {
    authenticated,
    balancesLoading,
    embeddedBreadBalance,
    embeddedHasBread,
    embeddedWalletAddress,
    handleFundWallet,
    isFunding,
    privyReady,
    walletsReady,
  } = useWalletFunding();

  useLogin({
    async onComplete({ user }) {
      try {
        await onboardSupabaseUser(user);
      } catch (err) {
        console.error("Onboarding failed:", err);
      }
    },
  });

  useEffect(() => {
    if (
      fundingPromptShown ||
      fundingPromptSkipped ||
      modalState ||
      !privyReady ||
      !authenticated ||
      !walletsReady ||
      balancesLoading ||
      isFunding ||
      embeddedHasBread
    ) {
      return;
    }

    setFundingPromptShown(true);
    setModal({
      type: "WALLET_FUNDING",
      walletAddress: embeddedWalletAddress,
      breadBalance: embeddedBreadBalance,
      onFund: handleFundWallet,
      onSkip: () => setFundingPromptSkipped(true),
    });
  }, [
    authenticated,
    balancesLoading,
    embeddedBreadBalance,
    embeddedHasBread,
    embeddedWalletAddress,
    fundingPromptShown,
    fundingPromptSkipped,
    handleFundWallet,
    isFunding,
    modalState,
    privyReady,
    setModal,
    walletsReady,
  ]);

  return null;
};

export default LoginTracker;
