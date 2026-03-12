"use client";

import { onboardSupabaseUser } from "@/lib/onboarding/supabase";
import { useLogin } from "@privy-io/react-auth";

const LoginTracker = () => {
  useLogin({
    async onComplete({ user, isNewUser }) {
      if (!isNewUser) return;

      try {
        await onboardSupabaseUser(user);
      } catch (err) {
        console.error("Onboarding failed:", err);
      }
    },
  });

  return null;
};

export default LoginTracker;
