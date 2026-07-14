"use client";

import { useModal } from "@/components/modal/context";
import { onboardSupabaseUser } from "@/lib/onboarding/supabase";
import { useLogin } from "@privy-io/react-auth";

const LoginTracker = () => {
  const { setModal } = useModal();

  useLogin({
    async onComplete({ user, isNewUser }) {
      try {
        // The alias modal reads the user's Supabase records immediately, so
        // onboarding must finish before it opens.
        await onboardSupabaseUser(user);
        if (isNewUser) {
          setModal({
            type: "SAVINGS_GOALS",
            privyUserId: user.id,
          });
        }
      } catch (err) {
        console.error("Onboarding failed:", err);
      }
    },
  });

  return null;
};

export default LoginTracker;
