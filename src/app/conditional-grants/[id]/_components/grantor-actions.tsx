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
import { dateInputToMs, earliestDeadlineDate } from "@/utils/time";
import { Body, formatBalance, Heading3 } from "@breadcoop/ui";
import { ReactNode, useState } from "react";
import { Address, isAddress, zeroAddress } from "viem";

const GrantorActions = ({
  grantId,
  terms,
  status,
  state,
}: {
  grantId: bigint;
  terms: GrantTerms;
  status: GrantStatus;
  state: GrantState;
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
  const canExtend = state === GrantState.Active || state === GrantState.Overdue;
  const canReclaim = state === GrantState.Overdue && terms.grant > BigInt(0);
  const canCollect = status.grantorOwed > BigInt(0);

  if (!canSetGrantee && !canCancel && !canExtend && !canReclaim && !canCollect)
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

  const confirm = (
    action: "setGrantee" | "cancelGrant" | "extendDeadline" | "reclaimGrant",
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
          note={`${formatToken(status.grantorOwed)} in payments and yield is ready for you.`}
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

      {canReclaim && (
        <Action note="The advance is late. Taking the grant back is permanent; the grantee still owes the rest of the advance.">
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
        <Action note="Cancelling returns the advance, the grant and any yield to you. It can't be undone.">
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

export default GrantorActions;
