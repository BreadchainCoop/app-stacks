"use client";

import { SubmitEventHandler, useState } from "react";
import { useUserIdentity } from "@/components/providers/user-identity";
import { ModalContainer, ModalHeader } from "../components";
import { Label } from "@/components/label";
import Input, { InputDescription } from "@/components/input";
import LocalButton from "@/components/button";
import { useMyProfile, useSetAlias } from "@/hooks/use-my-profile";
import { useModal, SetAliasModalState } from "../context";
import { ALIAS_MAX_LENGTH, validateAlias } from "@/lib/alias";

const UNIQUE_VIOLATION = "23505";

const SetAliasModal = ({ modalState }: { modalState: SetAliasModalState }) => {
  const { setModal } = useModal();
  const { userId } = useUserIdentity();
  const { alias, isLoading } = useMyProfile(userId);
  const { setAlias, isSaving } = useSetAlias(userId);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setModal(null);
    modalState.onDone?.();
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const value = String(new FormData(e.currentTarget).get("alias") ?? "");
    const trimmed = value.trim();

    const validationError = validateAlias(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    try {
      await setAlias(trimmed);
      close();
    } catch (err) {
      console.error("Failed to save alias:", err);
      setError(
        (err as { code?: string })?.code === UNIQUE_VIOLATION
          ? "That alias is already taken"
          : "Failed to save alias. Please try again."
      );
    }
  };

  return (
    <ModalContainer className="max-w-121!">
      <ModalHeader
        title={alias ? "Edit your alias" : "Set your alias"}
        showCloseIcon={!modalState.skippable}
      />
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-2 w-full">
          <Label htmlFor="alias">Alias</Label>
          <Input
            id="alias"
            name="alias"
            // Uncontrolled; remount to pick up the saved alias once loaded
            key={alias ?? "unset"}
            defaultValue={alias ?? ""}
            className="w-full font-normal text-surface-ink"
            placeholder="e.g. Alex"
            disabled={isLoading}
            maxLength={ALIAS_MAX_LENGTH}
          />
          <InputDescription desc="This is how other members will see you in your Stacks. 3-20 characters: letters, numbers and underscores, starting with a letter." />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <div className="flex flex-col gap-3 w-full">
          <LocalButton disabled={isSaving || isLoading} type="submit">
            {isSaving ? "Saving..." : "Save alias"}
          </LocalButton>
          {modalState.skippable && (
            <LocalButton variant="secondary" onClick={close} type="button">
              Skip for now
            </LocalButton>
          )}
        </div>
      </form>
    </ModalContainer>
  );
};

export default SetAliasModal;
