"use client";

import Input from "@/components/input";
import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { GrantStatus, GrantTerms } from "@/hooks/use-conditional-grant";
import { useConditionalGrantAction } from "@/hooks/use-conditional-grant-action";
import {
  CONDITIONAL_GRANT_GRANTOR_ERRORS,
  CONDITIONAL_GRANT_PAYOUT_ERRORS,
} from "@/lib/contract-errors";
import { DEPOSIT_TOKEN, formatDepositAmount } from "@/lib/deposit-token";
import { GrantState } from "@/lib/conditional-grant-state";
import {
  dateInputToMs,
  earliestDeadlineDate,
  formatShortDate,
} from "@/utils/time";
import { Body, formatBalance, Heading3 } from "@breadcoop/ui";
import { ReactNode, useState } from "react";
import { Address, isAddress, zeroAddress } from "viem";

const GrantorActions = ({
  grantId,
  terms,
  status,
  state,
  reclaimableAt,
}: {
  grantId: bigint;
  terms: GrantTerms;
  status: GrantStatus;
  state: GrantState;
  /** From the contract's reclaimableAt(); 0 when the grant can't be reclaimed */
  reclaimableAt: bigint;
}) => {
  const now = useBlockTimestamp();
  const { setModal } = useModal();
  const { runConditionalGrantAction } = useConditionalGrantAction();
  const [granteeInput, setGranteeInput] = useState("");
  const [extendInput, setExtendInput] = useState("");

  const canSetGrantee =
    state === GrantState.Offered && status.grantee === zeroAddress;
  const canCancel =
    state === GrantState.Offered || state === GrantState.Expired;
  // An open-ended grant has no deadline (payBackBy 0) until the grantor sets
  // one, which the contract requires to be at least 30 days away.
  const openEnded = status.payBackBy === BigInt(0);
  const canSetDeadline = state === GrantState.Active && openEnded;
  const canExtend =
    (state === GrantState.Active || state === GrantState.Overdue) && !openEnded;
  const canCollect = status.grantorOwed > BigInt(0);
  // The contract opens reclaiming 7 days after the deadline (or 90 days after
  // pay-back for a grant nobody released); before that, show when it opens.
  const nowSeconds = BigInt(Math.floor(now / 1000));
  const reclaimable =
    terms.grant > BigInt(0) &&
    (state === GrantState.Overdue || state === GrantState.PaidBack) &&
    reclaimableAt > BigInt(0);
  const canReclaim = reclaimable && nowSeconds >= reclaimableAt;
  const reclaimOpensLater =
    reclaimable && !canReclaim && state === GrantState.Overdue;

  if (
    !canSetGrantee &&
    !canCancel &&
    !canExtend &&
    !canSetDeadline &&
    !canReclaim &&
    !reclaimOpensLater &&
    !canCollect
  )
    return null;

  const granteeValid =
    isAddress(granteeInput) &&
    granteeInput.toLowerCase() !== status.grantor.toLowerCase();

  // A date input yields YYYY-MM-DD; the new deadline is midnight at its start
  const extendMs = extendInput ? dateInputToMs(extendInput) : NaN;
  const newPayBackBy = Number.isNaN(extendMs)
    ? undefined
    : BigInt(Math.floor(extendMs / 1000));
  const extendValid =
    newPayBackBy !== undefined &&
    newPayBackBy > status.payBackBy &&
    newPayBackBy > BigInt(Math.floor(now / 1000));
  const setDeadlineValid =
    newPayBackBy !== undefined &&
    newPayBackBy >= BigInt(Math.floor(now / 1000)) + DEADLINE_NOTICE_SECONDS;

  const confirm = (
    action:
      | "setGrantee"
      | "cancelGrant"
      | "extendDeadline"
      | "setDeadline"
      | "reclaimGrant",
    run: () => Promise<void>,
    amount?: bigint
  ) =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "conditionalGrant",
      action,
      id: grantId,
      amount,
      onConfirm: run,
    });

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">Grantor actions</Heading3>
      </header>

      {canCollect && (
        <Action
          note={`${formatToken(status.grantorOwed)} in payments is ready for you.`}
        >
          <LocalButton
            variant="positive"
            className="w-full font-bold"
            onClick={() =>
              setModal({
                type: "STACK_TX_INIT",
                stackType: "conditionalGrant",
                action: "collect",
                id: grantId,
                amount: status.grantorOwed,
                onConfirm: () =>
                  runConditionalGrantAction({
                    action: "collect",
                    functionName: "collect",
                    args: [grantId],
                    errors: CONDITIONAL_GRANT_PAYOUT_ERRORS,
                    amount: status.grantorOwed,
                  }),
              })
            }
          >
            Collect {formatToken(status.grantorOwed)}
          </LocalButton>
        </Action>
      )}

      {canSetGrantee && (
        <Action note="Only this wallet will be able to accept the offer.">
          <Input
            value={granteeInput}
            onChange={(e) => setGranteeInput(e.target.value)}
            className="w-full"
            placeholder="0x… grantee address"
          />
          <LocalButton
            className="w-full font-bold"
            disabled={!granteeValid}
            onClick={() =>
              confirm("setGrantee", () =>
                runConditionalGrantAction({
                  action: "setGrantee",
                  functionName: "setGrantee",
                  args: [grantId, granteeInput as Address],
                  errors: CONDITIONAL_GRANT_GRANTOR_ERRORS,
                })
              )
            }
          >
            Set grantee
          </LocalButton>
        </Action>
      )}

      {canExtend && (
        <Action note="Give the grantee until a later date to pay back and still receive the grant.">
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
              confirm("extendDeadline", () =>
                runConditionalGrantAction({
                  action: "extendDeadline",
                  functionName: "extendPayBackBy",
                  args: [grantId, newPayBackBy!],
                  errors: CONDITIONAL_GRANT_GRANTOR_ERRORS,
                })
              )
            }
          >
            Extend deadline
          </LocalButton>
        </Action>
      )}

      {canSetDeadline && (
        <Action note="There's no deadline yet. You can set one, at least 30 days from now. If the advance isn't paid back by then, you can take the grant back 7 days later.">
          <Input
            value={extendInput}
            onChange={(e) => setExtendInput(e.target.value)}
            type="date"
            min={earliestDeadlineDate(31)}
            className="w-full"
          />
          <LocalButton
            variant="secondary"
            className="w-full font-bold"
            disabled={!setDeadlineValid}
            onClick={() =>
              confirm("setDeadline", () =>
                runConditionalGrantAction({
                  action: "setDeadline",
                  functionName: "setPayBackBy",
                  args: [grantId, newPayBackBy!],
                  errors: CONDITIONAL_GRANT_GRANTOR_ERRORS,
                })
              )
            }
          >
            Set deadline
          </LocalButton>
        </Action>
      )}

      {reclaimOpensLater && (
        <Action
          note={`If the advance still isn't paid back, you can take the grant back from ${formatShortDate(Number(reclaimableAt) * 1000)}, 7 days after the deadline.`}
        />
      )}

      {canReclaim && (
        <Action
          note={
            state === GrantState.PaidBack
              ? "The advance was paid back, but nobody has released the grant for 90 days. You can take it back."
              : "The advance is late. Taking the grant back is permanent; the grantee still owes the rest of the advance."
          }
        >
          <LocalButton
            variant="destructive"
            className="w-full font-bold"
            onClick={() =>
              confirm(
                "reclaimGrant",
                () =>
                  runConditionalGrantAction({
                    action: "reclaimGrant",
                    functionName: "reclaimGrant",
                    args: [grantId],
                    errors: CONDITIONAL_GRANT_GRANTOR_ERRORS,
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
        <Action note="Cancelling returns the advance and the grant to you. It can't be undone.">
          <LocalButton
            variant="destructive"
            className="w-full font-bold"
            onClick={() =>
              confirm(
                "cancelGrant",
                () =>
                  runConditionalGrantAction({
                    action: "cancelGrant",
                    functionName: "cancel",
                    args: [grantId],
                    errors: CONDITIONAL_GRANT_GRANTOR_ERRORS,
                  }),
                terms.advance + terms.grant
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

function Action({ note, children }: { note: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-paper-2 pb-4 last:border-b-0 last:pb-0">
      <Body className="text-surface-grey">{note}</Body>
      {children}
    </div>
  );
}

// The contract's DEADLINE_NOTICE_PERIOD
const DEADLINE_NOTICE_SECONDS = BigInt(30 * 86400);

const formatToken = (amount: bigint) =>
  `${formatBalance(+formatDepositAmount(amount), 2)} ${DEPOSIT_TOKEN.symbol}`;

export default GrantorActions;
