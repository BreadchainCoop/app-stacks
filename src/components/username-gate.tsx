"use client";

import { useEffect } from "react";
import { useModal } from "@/components/modal/context";
import { useUserIdentity } from "@/components/providers/user-identity";
import { useMyProfile } from "@/hooks/use-my-profile";

/**
 * Signed-in users must have a username before using Stacks. Browsing signed
 * out is unaffected; once signed in (Privy, MiniPay or Nimiq Pay) with no
 * username, this keeps the username prompt open until one is saved.
 */
const UsernameGate = () => {
  const { modalState, setModal } = useModal();
  const { userId } = useUserIdentity();
  const { alias, isLoading, isError } = useMyProfile(userId);

  // No account row yet (still onboarding) reads as an error; the sign-in flows
  // open the prompt themselves once onboarding finishes.
  const missing = !!userId && !isLoading && !isError && alias === null;

  const requiredPromptOpen =
    modalState?.type === "SET_ALIAS" && !!modalState.required;

  useEffect(() => {
    if (missing && modalState?.type !== "SET_ALIAS") {
      setModal({ type: "SET_ALIAS", required: true });
    }
    // The prompt can't be closed, so drop it if they sign out instead
    if (!userId && requiredPromptOpen) setModal(null);
  }, [missing, userId, requiredPromptOpen, modalState?.type, setModal]);

  return null;
};

export default UsernameGate;
