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
  createGrant: {
    title: "Offer this conditional grant",
    description:
      "You are about to move the advance and the grant into escrow. You can cancel for a full refund until the grantee accepts.",
    confirmLabel: "Offer",
    loadingTitle: "Offering",
    successTitle: "Offer sent",
    successMsg: "Moved into escrow",
  },
  setGrantee: {
    title: "Set the grantee",
    description:
      "Only this address will be able to accept the offer. This can't be changed later.",
    confirmLabel: "Set grantee",
    loadingTitle: "Setting grantee",
    successTitle: "Grantee set",
    successMsg: "The grantee can now accept the offer",
  },
  cancelGrant: {
    title: "Cancel this offer?",
    description:
      "Cancelling is permanent. The advance, the grant and any yield come back to you.",
    confirmLabel: "Cancel offer",
    loadingTitle: "Cancelling",
    successTitle: "Offer cancelled",
    successMsg: "Escrow returned to you",
  },
  acceptGrant: {
    title: "Accept this offer",
    description:
      "You are about to receive the advance. The pay-back deadline starts now.",
    confirmLabel: "Accept offer",
    loadingTitle: "Accepting",
    successTitle: "Offer accepted",
    successMsg: "Received",
  },
  payBack: {
    title: "Pay back the advance",
    description: "You are about to pay back part of the advance.",
    confirmLabel: "Pay back",
    loadingTitle: "Paying back",
    successTitle: "Payment sent",
    successMsg: "Successfully paid back",
  },
  releaseGrant: {
    title: "Release the grant",
    description:
      "The advance is fully paid back. The grant will be sent to the grantee.",
    confirmLabel: "Release grant",
    loadingTitle: "Releasing grant",
    successTitle: "Grant released",
    successMsg: "Sent to the grantee",
  },
  extendDeadline: {
    title: "Give more time",
    description:
      "The grantee will have until the new deadline to pay back and still receive the grant.",
    confirmLabel: "Extend deadline",
    loadingTitle: "Extending",
    successTitle: "Deadline extended",
    successMsg: "The new deadline is set",
  },
  reclaimGrant: {
    title: "Reclaim the grant?",
    description:
      "Reclaiming is permanent. The grantee will no longer receive the grant, but still owes the rest of the advance.",
    confirmLabel: "Reclaim grant",
    loadingTitle: "Reclaiming",
    successTitle: "Grant reclaimed",
    successMsg: "Returned to you",
  },
  collect: {
    title: "Collect payments",
    description: "You are about to collect the payments made so far.",
    confirmLabel: "Collect",
    loadingTitle: "Collecting",
    successTitle: "Payments collected",
    successMsg: "Successfully collected",
  },
};

/** Actions that permanently give something up, styled like goal cancel. */
const DESTRUCTIVE_ACTIONS: StackTxAction[] = ["cancelGrant", "reclaimGrant"];

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
