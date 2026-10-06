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
      "Cancelling this goal is permanent and stops new deposits. Each member will need to withdraw their full contribution afterwards; refunds are not automatic.",
    confirmLabel: "Cancel goal",
    loadingTitle: "Cancelling",
    successTitle: "Goal cancelled",
    successMsg: "The goal was cancelled",
  },
  createLoan: {
    title: "Offer this loan",
    description:
      "You are about to move the loan amount and the grant into escrow. You can cancel for a full refund until the borrower accepts.",
    confirmLabel: "Offer loan",
    loadingTitle: "Offering loan",
    successTitle: "Loan offered",
    successMsg: "Moved into escrow",
  },
  setBorrower: {
    title: "Set the borrower",
    description:
      "Only this address will be able to accept the loan. This can't be changed later.",
    confirmLabel: "Set borrower",
    loadingTitle: "Setting borrower",
    successTitle: "Borrower set",
    successMsg: "The borrower can now accept the loan",
  },
  cancelLoan: {
    title: "Cancel loan offer?",
    description:
      "Cancelling is permanent. The loan amount, the grant and any yield come back to you.",
    confirmLabel: "Cancel offer",
    loadingTitle: "Cancelling",
    successTitle: "Offer cancelled",
    successMsg: "Escrow returned to you",
  },
  acceptLoan: {
    title: "Accept this loan",
    description:
      "You are about to receive this loan. The repayment deadline starts now.",
    confirmLabel: "Accept loan",
    loadingTitle: "Accepting",
    successTitle: "Loan accepted",
    successMsg: "Received",
  },
  repay: {
    title: "Repay loan",
    description: "You are about to pay back part of this loan.",
    confirmLabel: "Repay",
    loadingTitle: "Repaying",
    successTitle: "Repayment sent",
    successMsg: "Successfully repaid",
  },
  releaseGrant: {
    title: "Release the grant",
    description:
      "The loan is fully repaid. The grant will be sent to the borrower.",
    confirmLabel: "Release grant",
    loadingTitle: "Releasing grant",
    successTitle: "Grant released",
    successMsg: "Sent to the borrower",
  },
  extendLoan: {
    title: "Give more time",
    description:
      "The borrower will have until the new deadline to repay and still receive the grant.",
    confirmLabel: "Extend deadline",
    loadingTitle: "Extending",
    successTitle: "Deadline extended",
    successMsg: "The new deadline is set",
  },
  reclaimGrant: {
    title: "Reclaim the grant?",
    description:
      "Reclaiming is permanent. The borrower will no longer receive the grant, but still owes the rest of the loan.",
    confirmLabel: "Reclaim grant",
    loadingTitle: "Reclaiming",
    successTitle: "Grant reclaimed",
    successMsg: "Returned to you",
  },
  collect: {
    title: "Collect repayments",
    description: "You are about to collect the repayments made so far.",
    confirmLabel: "Collect",
    loadingTitle: "Collecting",
    successTitle: "Repayments collected",
    successMsg: "Successfully collected",
  },
};

/** Actions that permanently give something up, styled like goal cancel. */
const DESTRUCTIVE_ACTIONS: StackTxAction[] = ["cancelLoan", "reclaimGrant"];

export const StackTxInitModal = ({
  modalState,
}: {
  modalState: StackTxInitModalState;
}) => {
  const modal = useModal();
  const copy = ACTION_COPY[modalState.action];
  const isCancellingGoal =
    (modalState.stackType === "goal" && modalState.action === "cancel") ||
    DESTRUCTIVE_ACTIONS.includes(modalState.action);

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
            variant={isCancellingGoal ? "secondary" : "burn"}
            className="w-full"
            onClick={() => modal.setModal(null)}
          >
            {isCancellingGoal ? "Go back" : "Cancel"}
          </LocalButton>
        </div>
        <div className="flex-2 w-full">
          <LocalButton
            variant={isCancellingGoal ? "destructive" : undefined}
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
