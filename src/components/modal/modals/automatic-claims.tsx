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
import { useAutomaticClaims } from "@/hooks/use-automatic-claims";
import LocalLiftedButton from "@/components/button";

export interface AutomaticClaimsModalState {
  type: "AUTOMATIC_CLAIMS";
  stackId: string;
  currentValue: boolean;
}

const AutomaticClaimsModal = ({
  modalState: { stackId, currentValue },
}: {
  modalState: AutomaticClaimsModalState;
}) => {
  const modal = useModal();
  const { activate, status, setStatus } = useAutomaticClaims(
    stackId.toString()
  );

  const closeModal = () => modal.setModal(null);
  const enabling = !currentValue;

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
            title={`Automatic claims ${status === "success" ? "successful" : status === "error" ? "failed" : ""}`}
          />
          <ModalStatus
            status={status}
            statusMsg={
              status === "success"
                ? `Successfully ${enabling ? "activated" : "deactivated"} automatic claims!`
                : status === "error"
                  ? "Transaction failed"
                  : "Please confirm the transaction on your wallet"
            }
          />
          <Body
            bold={status === "error"}
            className={`text-center ${status === "success" ? "text-surface-grey" : "text-surface-grey-2"}`}
          >
            {status === "success"
              ? enabling
                ? "Your funds will be available in your wallet once it's your turn to claim."
                : "Automatic claims have been deactivated."
              : status === "error"
                ? "Something went wrong. Please try again!"
                : ""}
          </Body>
          {status === "success" ? (
            <div className="lifted-button-container">
              <LocalLiftedButton onClick={closeModal}>
                Return to stack
              </LocalLiftedButton>
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
              ? "Send funds to your wallet"
              : "Stop automatic fund transfers"}
          </Body>
          <Body className="mb-6 text-surface-grey">
            {enabling
              ? "By activating automatic claims you will have the funds sent to your wallet without having to claim them manually."
              : "By deactivating automatic claims you will need to manually claim your funds when it's your turn."}
          </Body>
          <div className="lifted-button-container">
            <LocalLiftedButton onClick={() => activate(enabling)}>
              {enabling ? "Activate" : "Deactivate"} automatic claims
            </LocalLiftedButton>
          </div>
        </div>
      )}
    </ModalContainer>
  );
};

export default AutomaticClaimsModal;
