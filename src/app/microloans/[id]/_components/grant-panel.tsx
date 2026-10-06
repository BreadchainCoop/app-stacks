"use client";

import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import { LoanTerms } from "@/hooks/use-microloan";
import { useMicroloanAction } from "@/hooks/use-microloan-action";
import { MICROLOAN_PAYOUT_ERRORS } from "@/lib/contract-errors";
import { LoanState } from "@/lib/microloan-state";
import { Body, Heading3 } from "@breadcoop/ui";

/**
 * Once the loan is repaid, anyone can release the grant; it can only ever go
 * to the borrower.
 */
const GrantPanel = ({
  loanId,
  terms,
  state,
}: {
  loanId: bigint;
  terms: LoanTerms;
  state: LoanState;
}) => {
  const { setModal } = useModal();
  const { runMicroloanAction } = useMicroloanAction();

  if (state !== LoanState.Repaid) return null;

  const release = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "microloan",
      action: "releaseGrant",
      id: loanId,
      amount: terms.grant,
      onConfirm: () =>
        runMicroloanAction({
          action: "releaseGrant",
          functionName: "releaseGrant",
          args: [loanId],
          errors: MICROLOAN_PAYOUT_ERRORS,
          amount: terms.grant,
        }),
    });

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">Release the grant</Heading3>
      </header>
      <Body className="text-surface-grey">
        The loan is fully repaid. Anyone can release the grant, and it always
        goes to the borrower.
      </Body>
      <LocalButton
        variant="positive"
        className="w-full font-bold"
        onClick={release}
      >
        Release grant
      </LocalButton>
    </section>
  );
};

export default GrantPanel;
