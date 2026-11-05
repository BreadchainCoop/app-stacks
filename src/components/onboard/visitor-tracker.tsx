"use client";

import { useEffect, useRef } from "react";
import { useModal } from "@/components/modal/context";
import { useUserIdentity } from "@/components/providers/user-identity";
import { useMyProfile } from "@/hooks/use-my-profile";

// Per-device, so the intro shows once per visitor rather than once per load
const SEEN_KEY = "stacks:intro-seen";

const hasSeenIntro = () => {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
};

const markIntroSeen = () => {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Private mode or blocked storage: the intro may show again, which is fine
  }
};

/**
 * Shows the Stacks intro once per visitor, on arrival: to anyone signed out,
 * and to a signed-in user with no username yet (in MiniPay the account exists
 * from the first open). Returning users who already have a username skip it.
 */
export const OnboardVisitorTracker = () => {
  const shown = useRef(false);
  const { setModal } = useModal();
  const { userId, ready } = useUserIdentity();
  const { alias, isLoading } = useMyProfile(userId);

  // A brand-new account may not have its row yet, which reads as no username
  const decided = ready && (!userId || !isLoading);
  const wantsIntro = !userId || alias === null;

  useEffect(() => {
    if (shown.current || !decided) return;
    shown.current = true;

    if (!wantsIntro || hasSeenIntro()) return;
    markIntroSeen();
    setModal({ type: "VISITOR_ONBOARDING" });
  }, [decided, wantsIntro, setModal]);

  return null;
};
