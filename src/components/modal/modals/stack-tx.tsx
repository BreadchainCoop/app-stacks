"use client";

import LocalButton from "@/components/button";
import { Body, formatBalance, Heading2, Logo } from "@breadcoop/ui";
import { formatEther } from "viem";
import { ModalContainer, ModalHeader, ModalStatus } from "../components";
import {
  StackTxAction,
  StackTxInitModalState,
  StackTxLoadingModalState,
  StackTxResultModalState,
  TModalStatus,
  useModal,
} from "../context";

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
  borrow: {
    title: "Borrow from the pool",
    description:
      "You are about to open a loan against your own savings. Your savings stay locked as collateral until the loan is repaid.",
    confirmLabel: "Borrow",
    loadingTitle: "Borrowing",
    successTitle: "Loan opened",
    successMsg: "Successfully borrowed",
  },
  repay: {
    title: "Repay your loan",
    description:
      "You are about to repay your loan. The payment settles accrued interest first, then principal.",
    confirmLabel: "Repay",
    loadingTitle: "Repaying",
    successTitle: "Repayment successful",
    successMsg: "Successfully repaid",
  },
  claimInterest: {
    title: "Claim your interest",
    description: "You are about to claim the interest you have earned.",
    confirmLabel: "Claim interest",
    loadingTitle: "Claiming interest",
    successTitle: "Interest claimed",
    successMsg: "Successfully claimed",
  },
  liquidate: {
    title: "Liquidate overdue loan",
    description:
      "You are about to liquidate an overdue loan. The borrower's savings are seized to cover their debt and the interest is distributed to savers.",
    confirmLabel: "Liquidate",
    loadingTitle: "Liquidating",
    successTitle: "Loan liquidated",
    successMsg: "The overdue loan was liquidated",
  },
  deactivate: {
    title: "Deactivate fund?",
    description:
      "Deactivating is irreversible: it blocks new deposits, borrows and invites. Withdrawals, repayments and interest claims stay open so everyone can exit.",
    confirmLabel: "Deactivate fund",
    loadingTitle: "Deactivating",
    successTitle: "Fund deactivated",
    successMsg: "The fund was deactivated",
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
  donate: {
    title: "Donate to the pool",
    description:
      "You are about to donate money to this fund without receiving shares.",
    confirmLabel: "Donate",
    loadingTitle: "Donating",
    successTitle: "Donation successful",
    successMsg: "Successfully donated",
  },
  propose: {
    title: "Create proposal",
    description: "You are about to create a new funding proposal.",
    confirmLabel: "Create proposal",
    loadingTitle: "Creating proposal",
    successTitle: "Proposal created",
    successMsg: "Your proposal was created",
  },
  vote: {
    title: "Cast your vote",
    description: "You are about to vote on this proposal.",
    confirmLabel: "Vote",
    loadingTitle: "Voting",
    successTitle: "Vote cast",
    successMsg: "Your vote was cast",
  },
  execute: {
    title: "Execute proposal",
    description:
      "You are about to execute this proposal and pay out its recipient.",
    confirmLabel: "Execute",
    loadingTitle: "Executing",
    successTitle: "Proposal executed",
    successMsg: "The proposal was executed",
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
              {formatBalance(+formatEther(modalState.amount), 2)}
            </Heading2>
            <Body>BREAD</Body>
          </div>
          <div>
            <Body className="text-xs text-surface-grey">
              ${formatBalance(+formatEther(modalState.amount), 2)} USD
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
              +formatEther(modalState.amount),
              2
            )} BREAD`
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
