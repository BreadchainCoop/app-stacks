"use client";

import BalanceHint from "@/app/conditional-grants/_components/balance-hint";
import LocalButton from "@/components/button";
import NumericInput from "@/components/numeric-input";
import { useModal } from "@/components/modal/context";
import { GrantTerms } from "@/hooks/use-conditional-grant";
import { useConditionalGrantAction } from "@/hooks/use-conditional-grant-action";
import {
  CONDITIONAL_GRANT_ACCEPT_ERRORS,
  CONDITIONAL_GRANT_PAY_BACK_ERRORS,
} from "@/lib/contract-errors";
import {
  DEPOSIT_TOKEN,
  formatDepositAmount,
  parseDepositAmount,
} from "@/lib/deposit-token";
import { agreementHash } from "@/lib/conditional-grant-terms";
import {
  canPayBack,
  GrantState,
  unlockAmount,
} from "@/lib/conditional-grant-state";
import { Body, formatBalance, Heading3, Logo } from "@breadcoop/ui";
import { useState } from "react";
import { zeroHash } from "viem";

const GranteeActions = ({
  grantId,
  terms,
  state,
  outstanding,
  noDeadline,
}: {
  grantId: bigint;
  terms: GrantTerms;
  state: GrantState;
  outstanding: bigint;
  /** Open-ended grant with no deadline set yet */
  noDeadline: boolean;
}) => {
  if (state === GrantState.Offered) {
    return <AcceptGrant grantId={grantId} terms={terms} />;
  }

  if (canPayBack(state, outstanding)) {
    return (
      <PayBackAdvance
        grantId={grantId}
        terms={terms}
        outstanding={outstanding}
        noDeadline={noDeadline}
        state={state}
      />
    );
  }

  return null;
};

function AcceptGrant({
  grantId,
  terms,
}: {
  grantId: bigint;
  terms: GrantTerms;
}) {
  const { setModal } = useModal();
  const { runConditionalGrantAction } = useConditionalGrantAction();
  const [agreement, setAgreement] = useState("");

  const needsAgreement = terms.termsHash !== zeroHash;
  const matches =
    !needsAgreement || agreementHash(agreement) === terms.termsHash;

  const accept = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "conditionalGrant",
      action: "acceptGrant",
      id: grantId,
      amount: terms.advance,
      onConfirm: () =>
        runConditionalGrantAction({
          action: "acceptGrant",
          functionName: "accept",
          args: [grantId, terms.termsHash],
          errors: CONDITIONAL_GRANT_ACCEPT_ERRORS,
          amount: terms.advance,
        }),
    });

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">Accept the offer</Heading3>
      </header>
      <Body className="text-surface-grey">
        You receive {formatToken(terms.advance)} now with no interest.{" "}
        {terms.payBackPeriod === BigInt(0)
          ? `There's no deadline: pay it back in full whenever you can to also receive the ${formatToken(terms.grant)} grant. The grantor can set a deadline later, but must give you at least 30 days.`
          : `Pay it back in full within ${Number(terms.payBackPeriod / BigInt(86400))} days to also receive the ${formatToken(terms.grant)} grant.`}
        {terms.fee > BigInt(0) && ` ${feeNote(terms)}`}
      </Body>
      {needsAgreement && (
        <div className="flex flex-col gap-2">
          <Body bold>Agreement</Body>
          <Body className="text-xs text-surface-grey">
            Paste the agreement the grantor shared with you. Accepting records
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
                ? "This matches the grantor's agreement."
                : "This doesn't match the grantor's agreement. Check you copied all of it."}
            </Body>
          )}
        </div>
      )}
      <LocalButton
        className="w-full font-bold"
        onClick={accept}
        disabled={!matches}
      >
        Accept offer
      </LocalButton>
    </section>
  );
}

function PayBackAdvance({
  grantId,
  terms,
  outstanding,
  noDeadline,
  state,
}: {
  grantId: bigint;
  terms: GrantTerms;
  outstanding: bigint;
  noDeadline: boolean;
  state: GrantState;
}) {
  // Cash still needed to unlock the grant; the rest of the fee can come out of it
  const paid = terms.advance + terms.fee - outstanding;
  const unlock = unlockAmount(terms);
  const toUnlock = unlock > paid ? unlock - paid : BigInt(0);
  const onlyFeeLeft = state === GrantState.PaidBack;
  const { setModal } = useModal();
  const { runConditionalGrantAction, balance } = useConditionalGrantAction(
    terms.token
  );
  const [amountInput, setAmountInput] = useState("");

  let amount = BigInt(0);
  try {
    amount = amountInput ? parseDepositAmount(amountInput) : BigInt(0);
  } catch {
    // Unparseable input stays at zero and keeps the button disabled
  }
  // The contract only pulls what is owed, so never ask for more
  const payBackAmount = amount > outstanding ? outstanding : amount;

  const payBack = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "conditionalGrant",
      action: "payBack",
      id: grantId,
      amount: payBackAmount,
      onConfirm: () =>
        runConditionalGrantAction({
          action: "payBack",
          functionName: "payBack",
          args: [grantId, payBackAmount],
          errors: CONDITIONAL_GRANT_PAY_BACK_ERRORS,
          approveAmount: payBackAmount,
          amount: payBackAmount,
        }),
    });

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">
          {onlyFeeLeft ? "Pay the fee" : "Pay back"}
        </Heading3>
      </header>
      <Body className="text-surface-grey">
        {onlyFeeLeft
          ? `Pay the ${formatToken(outstanding)} fee to receive the full ${formatToken(terms.grant)} grant, or skip this and release the grant above with the fee taken out.`
          : terms.fee === BigInt(0)
            ? `You still owe ${formatToken(outstanding)}. ${
                noDeadline
                  ? "Pay any amount whenever you like. There's no deadline, so the grant is yours once it's all paid back."
                  : "Pay any amount whenever you like before the deadline to keep the grant."
              }`
            : `You still owe ${formatToken(outstanding)}, including the ${formatToken(terms.fee)} fee. Paying ${formatToken(toUnlock)} unlocks the grant${noDeadline ? "" : " (pay it before the deadline)"}; the rest of the fee can be paid or taken out of the grant.`}
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
          onClick={payBack}
          disabled={
            payBackAmount === BigInt(0) ||
            (balance !== undefined && balance < payBackAmount)
          }
        >
          {onlyFeeLeft ? "Pay fee" : "Pay back"}
        </LocalButton>
        <BalanceHint balance={balance} amount={payBackAmount} />
      </div>
    </section>
  );
}

/** How the fee works, in the grantee's terms */
const feeNote = (terms: GrantTerms) =>
  terms.fee <= terms.grant
    ? `There's also a ${formatToken(terms.fee)} fee: pay it to receive the full grant, or have it taken out of the grant.`
    : `There's also a ${formatToken(terms.fee)} fee. The grant covers ${formatToken(terms.grant)} of it; the other ${formatToken(terms.fee - terms.grant)} must be paid before the grant unlocks.`;

const formatToken = (amount: bigint) =>
  `${formatBalance(+formatDepositAmount(amount), 2)} ${DEPOSIT_TOKEN.symbol}`;

export default GranteeActions;
