"use client";

import {
  Body,
  formatBalance,
  Heading2,
  Logo,
  useConnectedUser,
} from "@breadcoop/ui";
import { useState } from "react";
import { ModalContainer, ModalHeader, ModalStatus } from "../components";
import { useModal, WalletFundingStatusModalState } from "../context";
import LocalButton from "@/components/button";
import { ArrowRightIcon, XIcon } from "@phosphor-icons/react";
import { formatAddress } from "@/utils/address";
import Link from "next/link";

const content = {
  loading: {
    title: "Funding wallet",
    status: "Loading...",
    message: "Converting to BREAD...",
  },
  success: {
    title: "Funding wallet successful",
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
  const { setModal } = useModal();
  const { user } = useConnectedUser();
  const [isRetrying, setIsRetrying] = useState(false);
  const statusContent = content[modalState.status];

  // TODO: Reopen the funding modal and keep track of previous state (onboarding | navbar)
  const handleRetry = async () => {
    if (modalState.status !== "error") return; // this is for typescript
    if (!modalState.onRetry || isRetrying) return;
    setIsRetrying(true);
    await modalState.onRetry();
  };

  const displayedAmount =
    modalState.status === "success"
      ? formatBalance(+modalState.breadAmount)
      : "";

  return (
    <ModalContainer
      status={modalState.status}
      className="max-w-142 items-stretch gap-6 p-6"
    >
      <ModalHeader title={statusContent.title} />
      <ModalStatus
        status={modalState.status}
        msg={
          modalState.status === "success" ? undefined : statusContent.message
        }
      />
      {modalState.status === "success" && (
        <div>
          <div className="mb-2 flex items-center justify-center gap-1.5">
            <Logo size={24} />
            <Heading2 className="text-[2.5rem] leading-9 mb-[-0.2rem]">
              {displayedAmount} BREAD
            </Heading2>
          </div>
          <Body bold className="mb-9 text-center text-surface-grey-2">
            The same to ~ {parseInt(displayedAmount)} USD
          </Body>
          <Body bold className="mb-4 flex items-center justify-between">
            <span className="text-surface-grey">Account</span>
            <span className="text-surface-ink">
              {user.status === "CONNECTED" ||
              user.status === "UNSUPPORTED_CHAIN"
                ? formatAddress(user.address)
                : "Loading..."}
            </span>
          </Body>
          <div className="h-px w-full bg-paper-2 mb-4" />
          <LocalButton
            as={Link}
            href="/"
            onClick={() => {
              setModal(null);
            }}
            className="mb-4"
            rightIcon={<ArrowRightIcon size={24} />}
          >
            Go to Dashboard
          </LocalButton>
          <div className="lifted-button-container">
            <LocalButton
              onClick={() => {
                setModal(null);
              }}
              variant="secondary"
              rightIcon={<XIcon size={24} />}
            >
              Close
            </LocalButton>
          </div>
        </div>
      )}
      {modalState.status === "error" && (
        <LocalButton
          variant="burn"
          onClick={handleRetry}
          disabled={isRetrying}
          className="font-bold w-full"
        >
          {isRetrying ? "Trying..." : "Try again"}
        </LocalButton>
      )}
    </ModalContainer>
  );
};

export default WalletFundingStatusModal;
