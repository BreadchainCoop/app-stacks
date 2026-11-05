"use client";

import { useEffect, useRef } from "react";
import { useModal } from "@/components/modal/context";
import { useUserIdentity } from "@/components/providers/user-identity";
import { useMyProfile } from "@/hooks/use-my-profile";

// Remembered per device for visitors and per account once signed in, so the
// intro shows once to each visitor and once to each new account
const seenKey = (who: string) => `stacks:intro-seen:${who}`;

const hasSeenIntro = (who: string) => {
  try {
    return localStorage.getItem(seenKey(who)) === "1";
  } catch {
    return false;
  }
};

const markIntroSeen = (who: string) => {
  try {
    localStorage.setItem(seenKey(who), "1");
  } catch {
    // Private mode or blocked storage: the intro may show again, which is fine
  }
};

/**
 * Shows the Stacks intro on arrival: once per device to visitors who are
 * signed out, and once to each new account (signed in with no username yet,
 * including a MiniPay wallet on its first open). Never twice in one visit, so
 * someone who watched it and then signed up goes straight to their username.
 */
export const OnboardVisitorTracker = () => {
  const decidedFor = useRef<string | null>(null);
  const shownThisVisit = useRef(false);
  const { modalState, setModal } = useModal();
  const { userId, ready } = useUserIdentity();
  const { alias, isLoading } = useMyProfile(userId);

  const who = userId ?? "visitor";
  // A brand-new account may not have its row yet, which reads as no username
  const settled = ready && (!userId || !isLoading);

  useEffect(() => {
    if (!settled || decidedFor.current === who) return;
    decidedFor.current = who;

    const isNewAccount = !userId || alias === null;
    if (!isNewAccount || hasSeenIntro(who)) return;
    markIntroSeen(who);
    if (shownThisVisit.current) return;

    // Only over nothing, or over a new account's username prompt, which it
    // hands back to when closed (keeping that prompt's next step)
    if (modalState && modalState.type !== "SET_ALIAS") return;

    shownThisVisit.current = true;
    setModal({
      type: "VISITOR_ONBOARDING",
      resume: modalState ?? undefined,
    });
  }, [settled, who, userId, alias, modalState, setModal]);

  return null;
};
