"use client";

import LocalButton from "@/components/button";
import Countdown from "@/components/countdown";
import NumericInput from "@/components/numeric-input";
import { useModal } from "@/components/modal/context";
import { useAscaLoan } from "@/hooks/use-asca-loan";
import { AscaFund } from "@/hooks/use-asca-fund";
import { useAscaMemberPosition } from "@/hooks/use-asca-member-position";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { getAscaLoanStatus } from "@/lib/asca-state";
import { ASCA_BORROW_ERRORS, ASCA_REPAY_ERRORS } from "@/lib/contract-errors";
import {
  Body,
  cn,
  formatBalance,
  Heading3,
  Logo,
  useConnectedUser,
} from "@breadcoop/ui";
import { CalendarStarIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAscaAction } from "./use-asca-action";

const LoanPanel = ({ fundId, fund }: { fundId: bigint; fund: AscaFund }) => {
  const now = useBlockTimestamp();
  const { setModal } = useModal();
  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;
  const { position } = useAscaMemberPosition(fundId, address);
  const { loan, dueDate } = useAscaLoan(fundId, address);
  const { runAscaAction } = useAscaAction(fund.token);
  const [amountInput, setAmountInput] = useState("");

  const amount = amountInput ? parseEther(amountInput) : BigInt(0);
  const hasAmount = amount > BigInt(0);

  const nowSeconds = BigInt(Math.floor(now / 1000));
  const loanStatus =
    loan && dueDate !== undefined
      ? getAscaLoanStatus({
          principal: loan.principal,
          dueDate,
          now: nowSeconds,
        })
      : "none";
  const hasLoan = loanStatus !== "none";
  const totalDebt = loan ? loan.principal + loan.interestOwed : BigInt(0);

  const borrow = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "asca",
      action: "borrow",
      id: fundId,
      amount,
      onConfirm: () =>
        runAscaAction({
          action: "borrow",
          functionName: "borrow",
          args: [fundId, amount],
          errors: ASCA_BORROW_ERRORS,
          amount,
        }),
    });

  const repay = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "asca",
      action: "repay",
      id: fundId,
      amount,
      onConfirm: () =>
        runAscaAction({
          action: "repay",
          functionName: "repay",
          args: [fundId, amount],
          errors: ASCA_REPAY_ERRORS,
          approveAmount: amount,
          amount,
        }),
    });

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="flex items-center justify-between flex-wrap gap-2 border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl shrink-0">Your credit line</Heading3>
        <Body bold className="text-xs shrink-0">
          <span className="font-normal">Loan status: </span>
          <span
            className={cn(
              loanStatus === "none" && "text-system-green",
              loanStatus === "open" && "text-system-warning",
              loanStatus === "overdue" && "text-system-red"
            )}
          >
            {loanStatus === "none"
              ? "No open loan"
              : loanStatus === "open"
                ? "Loan open"
                : "Loan overdue"}
          </span>
        </Body>
      </header>
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <LoanValue
          label="Credit line"
          amount={position?.creditLine}
          className="md:items-start"
        />
        <LoanValue
          label="Available to borrow"
          amount={position?.maxBorrowable}
          className="md:items-center md:justify-center"
        />
        <LoanValue
          label="Outstanding debt"
          amount={hasLoan ? totalDebt : BigInt(0)}
          className="md:justify-end md:items-end"
        />
      </div>
      {hasLoan && loan && dueDate !== undefined && (
        <div className="bg-paper-1 py-3 px-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Body className="text-surface-grey-2">Principal</Body>
            <Body bold>
              {formatBalance(+formatEther(loan.principal), 2)} BREAD
            </Body>
          </div>
          <div className="flex items-center justify-between">
            <Body className="text-surface-grey-2">Interest owed</Body>
            <Body bold>
              {formatBalance(+formatEther(loan.interestOwed), 2)} BREAD
            </Body>
          </div>
          <div className="flex items-center justify-start gap-0.5 mt-2">
            <CalendarStarIcon size={24} className="fill-blue-2" />
            <Body>
              {loanStatus === "overdue"
                ? "This loan is overdue and can be liquidated"
                : "Time left until the loan is due"}
            </Body>
          </div>
          {loanStatus !== "overdue" && (
            <Countdown targetSeconds={Number(dueDate)} />
          )}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <NumericInput
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            className="w-full"
            placeholder="Amount"
            allowDecimal
          />
          <div className="absolute top-1/2 -translate-y-1/2 right-3 p-1 bg-paper-main">
            <Logo text="BREAD" className="size-6" variant="square" />
          </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <LocalButton
            className="w-full font-bold"
            onClick={borrow}
            disabled={!hasAmount || hasLoan || fund.deactivated}
          >
            Borrow
          </LocalButton>
          <LocalButton
            className="w-full font-bold"
            variant="secondary"
            onClick={repay}
            disabled={!hasAmount || !hasLoan}
          >
            Repay
          </LocalButton>
        </div>
        {hasLoan ? (
          <Body className="text-xs text-surface-grey">
            Repay {formatBalance(+formatEther(totalDebt), 2)} BREAD to close
            your loan. Payments settle interest first, then principal.
          </Body>
        ) : fund.deactivated ? (
          <Body className="text-xs text-surface-grey">
            This fund is deactivated — new loans are closed.
          </Body>
        ) : null}
      </div>
    </section>
  );
};

function LoanValue({
  label,
  amount,
  className,
}: {
  label: string;
  amount: bigint | undefined;
  className?: string;
}) {
  return (
    <Body className={`flex flex-col justify-start ${className}`}>
      <span className="text-surface-grey">{label}</span>
      <span className="inline-flex items-center justify-start">
        <Logo size={24} variant="square" className="mr-1" />
        <span className="font-bold mt-[0.2rem]">
          {amount !== undefined ? formatBalance(+formatEther(amount), 2) : "-"}{" "}
          BREAD
        </span>
      </span>
    </Body>
  );
}

export default LoanPanel;
