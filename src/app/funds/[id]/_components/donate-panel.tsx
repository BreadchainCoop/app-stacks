"use client";

import LocalButton from "@/components/button";
import NumericInput from "@/components/numeric-input";
import { useModal } from "@/components/modal/context";
import { CollectiveFund } from "@/hooks/use-collective-fund";
import { COLLECTIVE_DEPOSIT_ERRORS } from "@/lib/contract-errors";
import { Body, Heading3, Logo, useConnectedUser } from "@breadcoop/ui";
import { useState } from "react";
import { parseEther } from "viem";
import { useCollectiveAction } from "./use-collective-action";

/**
 * Donations are open to anyone — this panel is what non-members see instead
 * of the member position panel (members donate from there).
 */
const DonatePanel = ({
  fundId,
  fund,
}: {
  fundId: bigint;
  fund: CollectiveFund;
}) => {
  const { setModal } = useModal();
  const { user } = useConnectedUser();
  const { runCollectiveAction } = useCollectiveAction(fund.token);
  const [amountInput, setAmountInput] = useState("");

  const amount = amountInput ? parseEther(amountInput) : BigInt(0);
  const hasAmount = amount > BigInt(0);

  if (user.status !== "CONNECTED") return null;

  const donate = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "collective",
      action: "donate",
      id: fundId,
      amount,
      onConfirm: () =>
        runCollectiveAction({
          action: "donate",
          functionName: "donate",
          args: [fundId, amount],
          errors: COLLECTIVE_DEPOSIT_ERRORS,
          approveAmount: amount,
          amount,
        }),
    });

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">Donate to the pool</Heading3>
      </header>
      <Body className="text-surface-grey">
        Anyone can donate. Donations grow the shared pool without minting shares
        — they belong to the fund&apos;s members.
      </Body>
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
        <LocalButton
          className="w-full font-bold"
          onClick={donate}
          disabled={!hasAmount}
        >
          Donate
        </LocalButton>
      </div>
    </section>
  );
};

export default DonatePanel;
