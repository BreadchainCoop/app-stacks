"use client";

import LocalButton from "@/components/button";
import { Body, formatBalance, Heading2, Logo } from "@breadcoop/ui";

import { ModalContainer, ModalHeader, ModalStatus } from "../components";
import {
  StackTxAction,
  StackTxInitModalState,
  StackTxLoadingModalState,
  StackTxResultModalState,
  TModalStatus,
  useModal,
} from "../context";
import { DEPOSIT_TOKEN, formatDepositAmount } from "@/lib/deposit-token";

/**
 * Copy for the generic per-action tx modals shared by the new stack types
 * (STACK_TX_INIT / STACK_TX_LOADING / STACK_TX_RESULT). Covers every
 * StackTxAction so each type's flows can reuse these modals.
 */
const ACTION_COPY: Record<
  StackTxAction,
  {
    title: string;
    description: string;
    confirmLabel: string;
    loadingTitle: string;
    successTitle: string;
    successMsg: string;
  }
> = {
  deposit: {
    title: "Pay your deposit",
    description: "You are about to deposit money into this fund.",
    confirmLabel: "Deposit",
    loadingTitle: "Depositing",
    successTitle: "Deposit successful",
    successMsg: "Successfully deposited",
  },
  withdraw: {
    title: "Withdraw savings",
    description: "You are about to withdraw money from this fund.",
    confirmLabel: "Withdraw",
    loadingTitle: "Withdrawing",
    successTitle: "Withdrawal successful",
    successMsg: "Successfully withdrawn",
  },
  release: {
    title: "Release the pot",
    description: "You are about to release the pot to the beneficiary.",
    confirmLabel: "Release",
    loadingTitle: "Releasing",
    successTitle: "Pot released",
    successMsg: "Successfully released",
  },
  cancel: {
    title: "Cancel goal?",
    description:
      "You are about to cancel this goal. Members can reclaim their contributions afterwards.",
    confirmLabel: "Cancel goal",
    loadingTitle: "Cancelling",
    successTitle: "Goal cancelled",
    successMsg: "The goal was cancelled",
  },
};

export const StackTxInitModal = ({
  modalState,
}: {
  modalState: StackTxInitModalState;
}) => {
  const modal = useModal();
  const copy = ACTION_COPY[modalState.action];

  return (
    <ModalContainer>
      <ModalHeader title={copy.title} />
      <Body className="text-center">{copy.description}</Body>
      {modalState.amount !== undefined && (
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center gap-2">
            <Logo variant="square" size={24} />
            <Heading2 className="text-5xl leading-12">
              {formatBalance(+formatDepositAmount(modalState.amount), 2)}
            </Heading2>
            <Body>{DEPOSIT_TOKEN.symbol}</Body>
          </div>
          <div>
            <Body className="text-xs text-surface-grey">
              ${formatBalance(+formatDepositAmount(modalState.amount), 2)} USD
            </Body>
          </div>
        </div>
      )}
      <div className="flex items-center justify-center gap-4">
        <div className="flex-1 w-full">
          <LocalButton
            variant="burn"
            className="w-full"
            onClick={() => modal.setModal(null)}
          >
            Cancel
          </LocalButton>
        </div>
        <div className="flex-2 w-full">
          <LocalButton
            className="w-full"
            onClick={() => modalState.onConfirm()}
          >
            {copy.confirmLabel}
          </LocalButton>
        </div>
      </div>
    </ModalContainer>
  );
};

export const StackTxStatusModal = ({
  modalState,
}: {
  modalState: StackTxLoadingModalState | StackTxResultModalState;
}) => {
  const copy = ACTION_COPY[modalState.action];

  const status: TModalStatus =
    modalState.type === "STACK_TX_LOADING" ? "loading" : modalState.result;

  let title = copy.loadingTitle,
    msg = "";

  if (modalState.type === "STACK_TX_RESULT") {
    if (modalState.result === "success") {
      title = copy.successTitle;
      msg =
        modalState.amount !== undefined
          ? `${copy.successMsg}: ${formatBalance(
              +formatDepositAmount(modalState.amount),
              2
            )} ${DEPOSIT_TOKEN.symbol}`
          : copy.successMsg;
    } else {
      title = `${copy.loadingTitle} failed`;
      msg = modalState.msg || "Something went wrong. Please try again!";
    }
  }

  return (
    <ModalContainer status={status}>
      <ModalHeader title={title} />
      <ModalStatus status={status} msg={msg} />
    </ModalContainer>
  );
};
