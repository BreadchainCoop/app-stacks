"use client";

import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import { GrantTerms } from "@/hooks/use-conditional-grant";
import { useConditionalGrantAction } from "@/hooks/use-conditional-grant-action";
import { CONDITIONAL_GRANT_PAYOUT_ERRORS } from "@/lib/contract-errors";
import { GrantState } from "@/lib/conditional-grant-state";
import { Body, Heading3 } from "@breadcoop/ui";

/**
 * Once the advance is paid back, anyone can release the grant; it can only ever go
 * to the grantee.
 */
const GrantPanel = ({
  grantId,
  terms,
  state,
}: {
  grantId: bigint;
  terms: GrantTerms;
  state: GrantState;
}) => {
  const { setModal } = useModal();
  const { runConditionalGrantAction } = useConditionalGrantAction();

  if (state !== GrantState.PaidBack) return null;

  const release = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "conditionalGrant",
      action: "releaseGrant",
      id: grantId,
      amount: terms.grant,
      onConfirm: () =>
        runConditionalGrantAction({
          action: "releaseGrant",
          functionName: "releaseGrant",
          args: [grantId],
          errors: CONDITIONAL_GRANT_PAYOUT_ERRORS,
          amount: terms.grant,
        }),
    });

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">Release the grant</Heading3>
      </header>
      <Body className="text-surface-grey">
        The advance is fully paid back. Anyone can release the grant, and it
        always goes to the grantee.
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
