"use client";

import {
  ModalCloseIcon,
  ModalContainer,
  ModalHeader,
  ModalStatus,
} from "../components";
import { Body, Heading3 } from "@breadcoop/ui";
import { HandWithdrawIcon } from "@phosphor-icons/react";
import { useModal } from "../context";
import { useAccountAutomaticClaims } from "@/hooks/use-account-automatic-claims";
import LocalLiftedButton from "@/components/button";

export interface AutomaticClaimsAllModalState {
  type: "AUTOMATIC_CLAIMS_ALL";
  // Circles that actually need changing (already-matching stacks are excluded
  // by the toggle so they cost no transaction).
  circleIds: bigint[];
  enabling: boolean;
}

const AutomaticClaimsAllModal = ({
  modalState: { circleIds, enabling },
}: {
  modalState: AutomaticClaimsAllModalState;
}) => {
  const modal = useModal();
  const { setAllEnabled, status, setStatus, progress } =
    useAccountAutomaticClaims();

  const closeModal = () => modal.setModal(null);
  const count = circleIds.length;

  return (
    <ModalContainer
      status={
        status === "idle"
          ? undefined
          : status === "loading"
            ? "loading"
            : status
      }
    >
      {status !== "idle" ? (
        <>
          <ModalHeader
            title={`Automatic claims ${status === "success" ? "updated" : status === "error" ? "failed" : ""}`}
          />
          <ModalStatus
            status={status}
            statusMsg={
              status === "success"
                ? `Automatic claims ${enabling ? "activated" : "deactivated"} on ${progress.done - progress.failed} of ${progress.total} stacks.`
                : status === "error"
                  ? "Transaction failed"
                  : `Confirm each transaction in your wallet (${progress.done} of ${progress.total})`
            }
          />
          <Body
            bold={status === "error"}
            className={`text-center ${status === "success" ? "text-surface-grey" : "text-surface-grey-2"}`}
          >
            {status === "success"
              ? progress.failed > 0
                ? `${progress.failed} stack${progress.failed === 1 ? "" : "s"} could not be updated. You can try again.`
                : enabling
                  ? "Your funds will be sent to your wallet automatically when it's your turn to claim."
                  : "Automatic claims have been turned off for your stacks."
              : status === "error"
                ? "Something went wrong. Please try again!"
                : ""}
          </Body>
          {status === "success" ? (
            <div className="lifted-button-container">
              <LocalLiftedButton onClick={closeModal}>Done</LocalLiftedButton>
            </div>
          ) : status === "error" ? (
            <LocalLiftedButton
              variant="destructive"
              className="lifted-button-container"
              onClick={() => setStatus("idle")}
            >
              Try again
            </LocalLiftedButton>
          ) : null}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <button
            type="button"
            onClick={closeModal}
            className="inline-block ml-auto"
          >
            <ModalCloseIcon />
          </button>
          <HandWithdrawIcon size={48} />
          <Heading3 className="text-2xl mt-3 mb-6">
            {enabling ? "Activate" : "Deactivate"} automatic claims
          </Heading3>
          <Body bold className="mb-6 text-surface-grey-2">
            {enabling
              ? "Send funds to your wallet automatically"
              : "Stop automatic fund transfers"}
          </Body>
          <Body className="mb-6 text-surface-grey">
            {`This will ${enabling ? "activate" : "deactivate"} automatic claims across ${count} of your stacks, one transaction each.`}
          </Body>
          <div className="lifted-button-container">
            <LocalLiftedButton
              onClick={() => setAllEnabled(circleIds, enabling)}
            >
              {enabling ? "Activate" : "Deactivate"} on {count} stack
              {count === 1 ? "" : "s"}
            </LocalLiftedButton>
          </div>
        </div>
      )}
    </ModalContainer>
  );
};

export default AutomaticClaimsAllModal;
