"use client";

import { Body } from "@breadcoop/ui";
import { ModalContainer, ModalHeader } from "../components";
import { RemoveMemberWarningModalState, useModal } from "../context";
import LocalButton from "@/components/button";
import { useSavingCirclesTx } from "@/hooks/use-saving-circles-tx";
import { parseContractError } from "@/utils/parse-contract-error";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const REMOVE_MEMBER_ERRORS: Record<string, string> = {
  NotOwner: "Only the Stack owner (or the member themselves) can remove them.",
  AlreadyActive:
    "This Stack has already started — members can no longer be removed.",
  InvalidMemberAddress: "The Stack owner cannot be removed.",
  NotMember: "This address is not a member of this Stack.",
};

const RemoveMemberWarningModal = ({
  modalState,
}: {
  modalState: RemoveMemberWarningModalState;
}) => {
  const { setModal } = useModal();
  const { sendSavingCirclesTx } = useSavingCirclesTx();
  const queryClient = useQueryClient();
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const removeMember = async () => {
    setIsRemoving(true);
    setError(null);

    try {
      await sendSavingCirclesTx({
        functionName: "removeMember",
        args: [modalState.circleId, modalState.memberAddress],
      });

      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });

      await fetch("/api/stacks/member", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          circleId: modalState.circleId.toString(),
          walletAddress: modalState.memberAddress,
        }),
      }).catch((err) => {
        console.error("Failed to clean up removed member's dashboard:", err);
      });

      setModal(null);
      router.refresh();
    } catch (err) {
      console.error("Failed to remove member:", err);
      setError(parseContractError(err, REMOVE_MEMBER_ERRORS));
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <ModalContainer>
      <ModalHeader title="Remove member?" />
      <Body className="text-center text-surface-grey">
        You are about to remove{" "}
        <span className="font-bold text-surface-ink">
          {modalState.memberName}
        </span>{" "}
        from this Stack. They will be removed from the member list and can be
        invited again later if needed.
      </Body>
      {error && (
        <Body className="text-system-red text-center text-sm">{error}</Body>
      )}
      <div className="flex flex-col gap-3">
        <LocalButton
          variant="destructive"
          className="font-bold w-full"
          onClick={removeMember}
          isLoading={isRemoving}
        >
          Remove member
        </LocalButton>
        <LocalButton
          className="font-bold w-full"
          onClick={() => setModal(null)}
        >
          Cancel
        </LocalButton>
      </div>
    </ModalContainer>
  );
};

export default RemoveMemberWarningModal;
