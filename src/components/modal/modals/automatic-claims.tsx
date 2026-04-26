"use client";

import { useState } from "react";
import {
  ModalCloseIcon,
  ModalContainer,
  ModalHeader,
  ModalStatus,
} from "../components";
import LocalLiftedButton from "@/components/lifted-button";
import { Body, Heading3, LiftedButton } from "@breadcoop/ui";
import { HandWithdrawIcon } from "@phosphor-icons/react";
import { useModal } from "../context";
import { sleep } from "@/utils/sleep";

const AutomaticClaimsModal = () => {
  const modal = useModal();
  const [status, setStatus] = useState<
    "error" | "success" | "loading" | undefined
  >("error");

  const closeModal = () => modal.setModal(null);

  const activate = async () => {
    if (status === "loading") return;

    setStatus("loading");

    await sleep(3000);

    setStatus("success");
  };

  return (
    <ModalContainer status={status}>
      {status ? (
        <>
          <ModalHeader
            title={`Automatic claims ${status === "success" ? "succesful" : status === "error" ? "failed" : ""}`}
          />
          <ModalStatus
            status={status}
            statusMsg={
              status === "success"
                ? "Successfully activated automatic claims!"
                : status === "error"
                  ? "Transaction failed"
                  : "Please confirm the transaction on your wallet"
            }
          />
          <Body
            bold={status === "error"}
            className={`text-center ${status === "success" ? "text-surface-grey" : status === "error" ? "text-surface-grey-2" : ""}`}
          >
            {status === "success"
              ? "Your funds will be available in your wallet once it’s your turn to claim."
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
            <LiftedButton
              preset="destructive"
              className="lifted-button-container"
              onClick={activate}
            >
              Try again
            </LiftedButton>
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
          <Heading3 className="text-2xl mt-3 mb-6">Automatic claims </Heading3>
          <Body bold className="mb-6 text-surface-grey-2">
            Send funds to your wallet
          </Body>
          <Body className="mb-6 text-surface-grey">
            By activating automatic claims you will have the funds send to you
            wallet without having to claim them manually
          </Body>
          <div className="lifted-button-container">
            <LocalLiftedButton onClick={activate}>
              Activate Automatic claims
            </LocalLiftedButton>
          </div>
        </div>
      )}
    </ModalContainer>
  );
};

export default AutomaticClaimsModal;
