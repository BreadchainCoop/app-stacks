"use client";

import { ModalContainer, ModalHeader, ModalStatus } from "../components";
import { ClaimInitModalState, ClaimResultModalState } from "../context";
import { AutomaticDepositsPrompt } from "@/components/automatic-deposits/activation-prompt";
import LocalButton from "@/components/button";

const ClaimModal = ({
  modalState,
}: {
  modalState: ClaimInitModalState | ClaimResultModalState;
}) => {
  let status: "loading" | "error" | "success" = "loading";
  let title = "";
  let msg = "";

  if (modalState.type === "CLAIM_LOADING") {
    status = "loading";
    title = "Claiming Deposit";
  } else {
    status = modalState.result;
    if (modalState.result === "error") {
      title = "Claim failed!";
      msg = modalState.msg || "Something went wrong. Please try again!";
    } else {
      title = "Claim successful";
      msg = "Successfully unlocked!";
    }
  }

  return (
    <ModalContainer status={status}>
      <ModalHeader title={title} />
      <ModalStatus status={status} msg={msg} />
      {modalState.type !== "CLAIM_LOADING" && modalState.result === "error" && (
        <LocalButton className="w-full" variant="burn">
          Try Again
        </LocalButton>
      )}
      {modalState.type === "CLAIM_RESULT" &&
        modalState.result === "success" &&
        modalState.circleId !== undefined && (
          <AutomaticDepositsPrompt
            circleId={modalState.circleId}
            context="post-claim"
          />
        )}
    </ModalContainer>
  );
};

export default ClaimModal;
