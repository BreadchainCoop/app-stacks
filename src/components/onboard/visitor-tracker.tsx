"use client";

import { useEffect, useRef } from "react";
import { useModal } from "@/components/modal/context";
import { usePrivy } from "@privy-io/react-auth";

export const OnboardVisitorTracker = () => {
  const modalShown = useRef(false);
  const { setModal } = useModal();
  const { user, ready } = usePrivy();

  console.log({ modalShown: modalShown.current, user, ready });

  useEffect(() => {
    if (modalShown.current || !ready || user) return;

    modalShown.current = true;

    setModal({ type: "VISITOR_ONBOARDING" });
  }, [ready]);

  return null;
};
