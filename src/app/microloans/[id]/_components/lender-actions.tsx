"use client";

import Input from "@/components/input";
import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { LoanStatus, LoanTerms } from "@/hooks/use-microloan";
import { useMicroloanAction } from "@/hooks/use-microloan-action";
import {
  MICROLOAN_LENDER_ERRORS,
  MICROLOAN_PAYOUT_ERRORS,
} from "@/lib/contract-errors";
import { DEPOSIT_TOKEN, formatDepositAmount } from "@/lib/deposit-token";
import { LoanState } from "@/lib/microloan-state";
import { dateInputToMs, earliestDeadlineDate } from "@/utils/time";
import { Body, formatBalance, Heading3 } from "@breadcoop/ui";
import { ReactNode, useState } from "react";
import { Address, isAddress, zeroAddress } from "viem";

const LenderActions = ({
  loanId,
  terms,
  status,
  state,
}: {
  loanId: bigint;
  terms: LoanTerms;
  status: LoanStatus;
  state: LoanState;
}) => {
  const now = useBlockTimestamp();
  const { setModal } = useModal();
  const { runMicroloanAction } = useMicroloanAction();
  const [borrowerInput, setBorrowerInput] = useState("");
  const [extendInput, setExtendInput] = useState("");

  const canSetBorrower =
    state === LoanState.Offered && status.borrower === zeroAddress;
  const canCancel = state === LoanState.Offered || state === LoanState.Expired;
  const canExtend = state === LoanState.Active || state === LoanState.Overdue;
  const canReclaim = state === LoanState.Overdue && terms.grant > BigInt(0);
  const canCollect = status.lenderOwed > BigInt(0);

  if (!canSetBorrower && !canCancel && !canExtend && !canReclaim && !canCollect)
    return null;

  const borrowerValid =
    isAddress(borrowerInput) &&
    borrowerInput.toLowerCase() !== status.lender.toLowerCase();

  // A date input yields YYYY-MM-DD; the new deadline is midnight at its start
  const extendMs = extendInput ? dateInputToMs(extendInput) : NaN;
  const newRepayBy = Number.isNaN(extendMs)
    ? undefined
    : BigInt(Math.floor(extendMs / 1000));
  const extendValid =
    newRepayBy !== undefined &&
    newRepayBy > status.repayBy &&
    newRepayBy > BigInt(Math.floor(now / 1000));

  const confirm = (
    action: "setBorrower" | "cancelLoan" | "extendLoan" | "reclaimGrant",
    run: () => Promise<void>,
    amount?: bigint
  ) =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "microloan",
      action,
      id: loanId,
      amount,
      onConfirm: run,
    });

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">Lender actions</Heading3>
      </header>

      {canCollect && (
        <Action
          note={`${formatToken(status.lenderOwed)} in repayments and yield is ready for you.`}
        >
          <LocalButton
            variant="positive"
            className="w-full font-bold"
            onClick={() =>
              setModal({
                type: "STACK_TX_INIT",
                stackType: "microloan",
                action: "collect",
                id: loanId,
                amount: status.lenderOwed,
                onConfirm: () =>
                  runMicroloanAction({
                    action: "collect",
                    functionName: "collect",
                    args: [loanId],
                    errors: MICROLOAN_PAYOUT_ERRORS,
                    amount: status.lenderOwed,
                  }),
              })
            }
          >
            Collect {formatToken(status.lenderOwed)}
          </LocalButton>
        </Action>
      )}

      {canSetBorrower && (
        <Action note="Only this wallet will be able to accept the loan.">
          <Input
            value={borrowerInput}
            onChange={(e) => setBorrowerInput(e.target.value)}
            className="w-full"
            placeholder="0x… borrower address"
          />
          <LocalButton
            className="w-full font-bold"
            disabled={!borrowerValid}
            onClick={() =>
              confirm("setBorrower", () =>
                runMicroloanAction({
                  action: "setBorrower",
                  functionName: "setBorrower",
                  args: [loanId, borrowerInput as Address],
                  errors: MICROLOAN_LENDER_ERRORS,
                })
              )
            }
          >
            Set borrower
          </LocalButton>
        </Action>
      )}

      {canExtend && (
        <Action note="Give the borrower until a later date to repay and still receive the grant.">
          <Input
            value={extendInput}
            onChange={(e) => setExtendInput(e.target.value)}
            type="date"
            min={earliestDeadlineDate()}
            className="w-full"
          />
          <LocalButton
            variant="secondary"
            className="w-full font-bold"
            disabled={!extendValid}
            onClick={() =>
              confirm("extendLoan", () =>
                runMicroloanAction({
                  action: "extendLoan",
                  functionName: "extendRepayBy",
                  args: [loanId, newRepayBy!],
                  errors: MICROLOAN_LENDER_ERRORS,
                })
              )
            }
          >
            Extend deadline
          </LocalButton>
        </Action>
      )}

      {canReclaim && (
        <Action note="The loan is late. Taking the grant back is permanent; the borrower still owes the rest of the loan.">
          <LocalButton
            variant="destructive"
            className="w-full font-bold"
            onClick={() =>
              confirm(
                "reclaimGrant",
                () =>
                  runMicroloanAction({
                    action: "reclaimGrant",
                    functionName: "reclaimGrant",
                    args: [loanId],
                    errors: MICROLOAN_LENDER_ERRORS,
                  }),
                terms.grant
              )
            }
          >
            Reclaim grant
          </LocalButton>
        </Action>
      )}

      {canCancel && (
        <Action note="Cancelling returns the loan amount, the grant and any yield to you. It can't be undone.">
          <LocalButton
            variant="destructive"
            className="w-full font-bold"
            onClick={() =>
              confirm(
                "cancelLoan",
                () =>
                  runMicroloanAction({
                    action: "cancelLoan",
                    functionName: "cancel",
                    args: [loanId],
                    errors: MICROLOAN_LENDER_ERRORS,
                  }),
                terms.principal + terms.grant
              )
            }
          >
            Cancel offer
          </LocalButton>
        </Action>
      )}
    </section>
  );
};

function Action({ note, children }: { note: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-paper-2 pb-4 last:border-b-0 last:pb-0">
      <Body className="text-surface-grey">{note}</Body>
      {children}
    </div>
  );
}

const formatToken = (amount: bigint) =>
  `${formatBalance(+formatDepositAmount(amount), 2)} ${DEPOSIT_TOKEN.symbol}`;

export default LenderActions;
