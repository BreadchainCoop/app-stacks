"use client";

import BalanceHint from "@/app/microloans/_components/balance-hint";
import LocalButton from "@/components/button";
import NumericInput from "@/components/numeric-input";
import { useModal } from "@/components/modal/context";
import { LoanTerms } from "@/hooks/use-microloan";
import { useMicroloanAction } from "@/hooks/use-microloan-action";
import {
  MICROLOAN_ACCEPT_ERRORS,
  MICROLOAN_REPAY_ERRORS,
} from "@/lib/contract-errors";
import {
  DEPOSIT_TOKEN,
  formatDepositAmount,
  parseDepositAmount,
} from "@/lib/deposit-token";
import { agreementHash } from "@/lib/microloan-terms";
import { isLoanRepayable, LoanState } from "@/lib/microloan-state";
import { Body, formatBalance, Heading3, Logo } from "@breadcoop/ui";
import { useState } from "react";
import { zeroHash } from "viem";

const BorrowerActions = ({
  loanId,
  terms,
  state,
  outstanding,
}: {
  loanId: bigint;
  terms: LoanTerms;
  state: LoanState;
  outstanding: bigint;
}) => {
  if (state === LoanState.Offered) {
    return <AcceptLoan loanId={loanId} terms={terms} />;
  }

  if (isLoanRepayable(state, outstanding)) {
    return (
      <RepayLoan loanId={loanId} terms={terms} outstanding={outstanding} />
    );
  }

  return null;
};

function AcceptLoan({ loanId, terms }: { loanId: bigint; terms: LoanTerms }) {
  const { setModal } = useModal();
  const { runMicroloanAction } = useMicroloanAction();
  const [agreement, setAgreement] = useState("");

  const needsAgreement = terms.termsHash !== zeroHash;
  const matches =
    !needsAgreement || agreementHash(agreement) === terms.termsHash;

  const accept = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "microloan",
      action: "acceptLoan",
      id: loanId,
      amount: terms.principal,
      onConfirm: () =>
        runMicroloanAction({
          action: "acceptLoan",
          functionName: "accept",
          args: [loanId, terms.termsHash],
          errors: MICROLOAN_ACCEPT_ERRORS,
          amount: terms.principal,
        }),
    });

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">Accept the loan</Heading3>
      </header>
      <Body className="text-surface-grey">
        You receive {formatToken(terms.principal)} now with no interest. Repay
        it in full within {Number(terms.repaymentPeriod / BigInt(86400))} days
        to also receive the {formatToken(terms.grant)} grant.
      </Body>
      {needsAgreement && (
        <div className="flex flex-col gap-2">
          <Body bold>Loan agreement</Body>
          <Body className="text-xs text-surface-grey">
            Paste the agreement the lender shared with you. Accepting records
            on-chain that you agreed to exactly this text.
          </Body>
          <textarea
            value={agreement}
            onChange={(e) => setAgreement(e.target.value)}
            rows={4}
            className="w-full border border-paper-2 bg-paper-1 py-3 px-4 placeholder:text-surface-grey text-surface-grey-2 placeholder:font-light"
            placeholder="Paste the agreement here"
          />
          {agreement.trim() && (
            <Body
              className={`text-xs ${matches ? "text-system-green" : "text-system-red"}`}
            >
              {matches
                ? "This matches the lender's agreement."
                : "This doesn't match the lender's agreement. Check you copied all of it."}
            </Body>
          )}
        </div>
      )}
      <LocalButton
        className="w-full font-bold"
        onClick={accept}
        disabled={!matches}
      >
        Accept loan
      </LocalButton>
    </section>
  );
}

function RepayLoan({
  loanId,
  terms,
  outstanding,
}: {
  loanId: bigint;
  terms: LoanTerms;
  outstanding: bigint;
}) {
  const { setModal } = useModal();
  const { runMicroloanAction, balance } = useMicroloanAction(terms.token);
  const [amountInput, setAmountInput] = useState("");

  let amount = BigInt(0);
  try {
    amount = amountInput ? parseDepositAmount(amountInput) : BigInt(0);
  } catch {
    // Unparseable input stays at zero and keeps the button disabled
  }
  // The contract only pulls what is owed, so never ask for more
  const payAmount = amount > outstanding ? outstanding : amount;

  const repay = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "microloan",
      action: "repay",
      id: loanId,
      amount: payAmount,
      onConfirm: () =>
        runMicroloanAction({
          action: "repay",
          functionName: "repay",
          args: [loanId, payAmount],
          errors: MICROLOAN_REPAY_ERRORS,
          approveAmount: payAmount,
          amount: payAmount,
        }),
    });

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">Repay</Heading3>
      </header>
      <Body className="text-surface-grey">
        You still owe {formatToken(outstanding)}. Pay any amount, any time.
      </Body>
      <div className="flex flex-col gap-2">
        <div className="relative">
          <NumericInput
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            className="w-full pr-24"
            placeholder="Amount"
            allowDecimal
          />
          <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-2">
            <button
              type="button"
              className="text-primary-blue text-sm font-bold"
              onClick={() => setAmountInput(formatDepositAmount(outstanding))}
            >
              All
            </button>
            <div className="p-1 bg-paper-main">
              <Logo
                text={DEPOSIT_TOKEN.symbol}
                className="size-6"
                variant="square"
              />
            </div>
          </div>
        </div>
        <LocalButton
          className="w-full font-bold"
          onClick={repay}
          disabled={
            payAmount === BigInt(0) ||
            (balance !== undefined && balance < payAmount)
          }
        >
          Repay
        </LocalButton>
        <BalanceHint balance={balance} amount={payAmount} />
      </div>
    </section>
  );
}

const formatToken = (amount: bigint) =>
  `${formatBalance(+formatDepositAmount(amount), 2)} ${DEPOSIT_TOKEN.symbol}`;

export default BorrowerActions;
