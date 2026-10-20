"use client";

import { useState } from "react";
import { BaseError, UserRejectedRequestError } from "viem";
import { Body } from "@breadcoop/ui";
import LocalButton from "@/components/button";
import { ModalContainer, ModalHeader } from "../components";
import { NimiqPaySignInModalState, useModal } from "../context";

const isUserRejection = (err: unknown) =>
  err instanceof BaseError &&
  err.walk((e) => e instanceof UserRejectedRequestError) !== null;

/**
 * Asks a connected Nimiq Pay user to sign in. A modal rather than a prompt on
 * connect: Nimiq Pay opens a native dialog for every signature, and its mini
 * app guidelines ask that each one follow a deliberate tap.
 */
const NimiqPaySignInModal = ({
  modalState,
}: {
  modalState: NimiqPaySignInModalState;
}) => {
  const { setModal } = useModal();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setSigningIn(true);
    setError(null);

    try {
      // Moves the modal on itself (closed, or the new-user alias prompt)
      await modalState.onSignIn();
    } catch (err) {
      setError(
        isUserRejection(err)
          ? "Sign-in was cancelled. You can try again whenever you're ready."
          : err instanceof Error
            ? err.message
            : "Sign-in failed. Please try again."
      );
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <ModalContainer className="max-w-121!">
      <ModalHeader title="Sign in to Stacks" />
      <Body className="text-surface-ink">
        Nimiq Pay will ask you to sign a message. It proves this wallet is yours
        so you can create Stacks, request to join one, and manage your profile.
        Signing is free and sends no transaction.
      </Body>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex flex-col gap-3 w-full">
        <LocalButton onClick={signIn} disabled={signingIn} type="button">
          {signingIn ? "Waiting for Nimiq Pay..." : "Sign in"}
        </LocalButton>
        <LocalButton
          variant="secondary"
          onClick={() => setModal(null)}
          disabled={signingIn}
          type="button"
        >
          Not now
        </LocalButton>
      </div>
    </ModalContainer>
  );
};

export default NimiqPaySignInModal;
