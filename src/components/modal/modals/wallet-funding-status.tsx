"use client";

import {
  Body,
  formatBalance,
  Heading2,
  LiftedButton,
  Logo,
  useConnectedUser,
} from "@breadcoop/ui";
import { useState } from "react";
import { ModalContainer, ModalHeader, ModalStatus } from "../components";
import { useModal, WalletFundingStatusModalState } from "../context";
import LocalLiftedButton from "@/components/lifted-button";
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
          <Link
            href="/"
            onClick={() => {
              setModal(null);
            }}
            className="lifted-button-container mb-4 block"
          >
            <LocalLiftedButton rightIcon={<ArrowRightIcon size={24} />}>
              Go to Dashboard
            </LocalLiftedButton>
          </Link>
          <div className="lifted-button-container">
            <LocalLiftedButton
              onClick={() => {
                setModal(null);
              }}
              preset="secondary"
              rightIcon={<XIcon size={24} />}
            >
              Close
            </LocalLiftedButton>
          </div>
        </div>
      )}
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
