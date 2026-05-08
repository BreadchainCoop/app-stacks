"use client";

import { LiftedButton } from "@breadcoop/ui";
import { useState } from "react";
import { ModalContainer, ModalHeader, ModalStatus } from "../components";
import { WalletFundingStatusModalState } from "../context";

const content = {
  loading: {
    title: "Funding wallet",
    status: "Loading...",
    message: "Converting to BREAD...",
  },
  success: {
    title: "Funding successful",
    status: "Complete",
    message: "Successfully funded your wallet!",
  },
  error: {
    title: "Funding failed",
    status: "Transaction failed",
    message: "Something went wrong. Please try again!",
  },
};

const WalletFundingStatusModal = ({
  modalState,
}: {
  modalState: WalletFundingStatusModalState;
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const statusContent = content[modalState.status];

  // TODO: Reopen the funding modal and keep track of previous state (onboarding | navbar)
  const handleRetry = async () => {
    if (!modalState.onRetry || isRetrying) return;
    setIsRetrying(true);
    await modalState.onRetry();
  };

  return (
    <ModalContainer
      status={modalState.status}
      className="max-w-142 items-stretch gap-6 p-6"
    >
      <ModalHeader title={statusContent.title} />
      <ModalStatus status={modalState.status} msg={statusContent.message} />
      {modalState.status === "error" && (
        <LiftedButton
          preset="burn"
          width="full"
          onClick={handleRetry}
          disabled={isRetrying}
          className="font-bold text-system-red"
        >
          {isRetrying ? "Trying..." : "Try again"}
        </LiftedButton>
      )}
    </ModalContainer>
  );
};

export default WalletFundingStatusModal;
