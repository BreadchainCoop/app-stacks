"use client";

import { onboardSupabaseUser } from "@/lib/onboarding/supabase";
import { useLogin } from "@privy-io/react-auth";

const LoginTracker = () => {
  useLogin({
    async onComplete({ user }) {
      try {
        // The alias modal reads the user's Supabase records immediately, so
        // onboarding must finish before it opens.
        await onboardSupabaseUser(user);
      } catch (err) {
        console.error("Onboarding failed:", err);
      }
    },
  });

  return null;
};

export default LoginTracker;
