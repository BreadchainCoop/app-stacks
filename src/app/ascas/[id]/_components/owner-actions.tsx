"use client";

import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import { AscaFund } from "@/hooks/use-asca-fund";
import { ASCA_DEACTIVATE_ERRORS } from "@/lib/contract-errors";
import { Body, Heading3, useConnectedUser } from "@breadcoop/ui";
import { useAscaAction } from "./use-asca-action";

const OwnerActions = ({ fundId, fund }: { fundId: bigint; fund: AscaFund }) => {
  const { setModal } = useModal();
  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;
  const { runAscaAction } = useAscaAction();

  const isOwner =
    !!address && fund.owner.toLowerCase() === address.toLowerCase();

  if (!isOwner || fund.deactivated) return null;

  const deactivate = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "asca",
      action: "deactivate",
      id: fundId,
      onConfirm: () =>
        runAscaAction({
          action: "deactivate",
          functionName: "deactivate",
          args: [fundId],
          errors: ASCA_DEACTIVATE_ERRORS,
        }),
    });

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">Fund owner actions</Heading3>
      </header>
      <Body className="text-surface-grey">
        Deactivating the fund is irreversible: it closes new deposits, loans and
        invites. Members can still withdraw savings, repay loans and claim
        interest.
      </Body>
      <LocalButton
        variant="destructive"
        className="w-full font-bold"
        onClick={deactivate}
      >
        Deactivate fund
      </LocalButton>
    </section>
  );
};

export default OwnerActions;
