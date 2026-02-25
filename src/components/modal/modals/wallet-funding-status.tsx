"use client";

import { LiftedButton } from "@breadcoop/ui";
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { CircularProgressIcon } from "@/components/icons/circular-progress";
import { ModalContainer, ModalHeader } from "../components";
import { WalletFundingStatusModalState } from "../context";

const content = {
  loading: {
    title: "Funding wallet",
    status: "Loading...",
    message: "Please confirm the transaction on your wallet",
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
  const copy = content[modalState.status];

  const handleRetry = async () => {
    if (!modalState.onRetry || isRetrying) return;
    setIsRetrying(true);
    await modalState.onRetry();
  };

  return (
    <ModalContainer
      status={modalState.status}
      className="max-w-[35.5rem] items-stretch gap-6 p-6"
    >
      <ModalHeader title={copy.title} />
      <div className="flex flex-col items-center gap-2 text-center">
        {modalState.status === "loading" && (
          <CircularProgressIcon className="h-12 w-12" />
        )}
        {modalState.status === "success" && (
          <CheckCircleIcon
            size={64}
            className="text-system-green"
            weight="regular"
          />
        )}
        {modalState.status === "error" && (
          <WarningCircleIcon
            size={64}
            className="text-system-red"
            weight="regular"
          />
        )}
        <p
          className={
            modalState.status === "success"
              ? "text-body-bold text-system-green"
              : modalState.status === "error"
                ? "text-body-bold text-system-red"
                : "text-body-bold text-primary-blue"
          }
        >
          {copy.status}
        </p>
        <p className="text-body-bold text-surface-grey">{copy.message}</p>
      </div>
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
