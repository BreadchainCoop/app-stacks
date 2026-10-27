"use client";

import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import { GrantTerms } from "@/hooks/use-conditional-grant";
import { useConditionalGrantAction } from "@/hooks/use-conditional-grant-action";
import { CONDITIONAL_GRANT_PAYOUT_ERRORS } from "@/lib/contract-errors";
import { GrantState } from "@/lib/conditional-grant-state";
import { DEPOSIT_TOKEN, formatDepositAmount } from "@/lib/deposit-token";
import { Body, formatBalance, Heading3 } from "@breadcoop/ui";
import type { GrantRole } from "./page-content";

/**
 * Once the advance is paid back, the grant can be released; it can only ever go to
 * the grantee. Any unpaid fee comes out of the grant, and while that would happen
 * the contract only lets the grantee release, so the choice stays theirs.
 */
const GrantPanel = ({
  grantId,
  terms,
  state,
  role,
  feeDue,
}: {
  grantId: bigint;
  terms: GrantTerms;
  state: GrantState;
  role: GrantRole;
  /** Unpaid fee, taken out of the grant on release */
  feeDue: bigint;
}) => {
  const { setModal } = useModal();
  const { runConditionalGrantAction } = useConditionalGrantAction();

  if (state !== GrantState.PaidBack) return null;

  const toGrantee = terms.grant - feeDue;
  const canRelease = feeDue === BigInt(0) || role === "grantee";

  const release = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "conditionalGrant",
      action: "releaseGrant",
      id: grantId,
      amount: toGrantee,
      onConfirm: () =>
        runConditionalGrantAction({
          action: "releaseGrant",
          functionName: "releaseGrant",
          args: [grantId],
          errors: CONDITIONAL_GRANT_PAYOUT_ERRORS,
          amount: toGrantee,
        }),
    });

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">Release the grant</Heading3>
      </header>
      <Body className="text-surface-grey">
        {feeDue === BigInt(0)
          ? "The advance is fully paid back. Anyone can release the grant, and it always goes to the grantee."
          : role === "grantee"
            ? `Release now to receive ${formatToken(toGrantee)}: the unpaid ${formatToken(feeDue)} fee comes out of the grant. Or pay the fee below to receive the full ${formatToken(terms.grant)}.`
            : `Waiting for the grantee to pay the ${formatToken(feeDue)} fee, or release the grant with the fee taken out.`}
      </Body>
      {canRelease && (
        <LocalButton
          variant="positive"
          className="w-full font-bold"
          onClick={release}
        >
          {feeDue === BigInt(0)
            ? "Release grant"
            : `Release ${formatToken(toGrantee)}`}
        </LocalButton>
      )}
    </section>
  );
};

const formatToken = (amount: bigint) =>
  `${formatBalance(+formatDepositAmount(amount), 2)} ${DEPOSIT_TOKEN.symbol}`;

export default GrantPanel;
