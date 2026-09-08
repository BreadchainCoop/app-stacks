"use client";

import { useEffect, useRef } from "react";
import { useModal } from "@/components/modal/context";
import { useUserIdentity } from "@/components/providers/user-identity";

export const OnboardVisitorTracker = () => {
  const modalShown = useRef(false);
  const { setModal } = useModal();
  const { userId, ready } = useUserIdentity();

  useEffect(() => {
    if (modalShown.current || !ready || userId) return;

    modalShown.current = true;

    setModal({ type: "VISITOR_ONBOARDING" });
  }, [ready]);

  return null;
};
