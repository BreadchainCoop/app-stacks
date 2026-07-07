"use client";

import LocalButton from "@/components/button";
import NumericInput from "@/components/numeric-input";
import { useModal } from "@/components/modal/context";
import { AscaFund } from "@/hooks/use-asca-fund";
import { useAscaMemberPosition } from "@/hooks/use-asca-member-position";
import {
  ASCA_CLAIM_INTEREST_ERRORS,
  ASCA_DEPOSIT_ERRORS,
  ASCA_WITHDRAW_ERRORS,
} from "@/lib/contract-errors";
import {
  Body,
  formatBalance,
  Heading3,
  Logo,
  useConnectedUser,
} from "@breadcoop/ui";
import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAscaAction } from "./use-asca-action";

const MemberPosition = ({
  fundId,
  fund,
}: {
  fundId: bigint;
  fund: AscaFund;
}) => {
  const { setModal } = useModal();
  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;
  const { position } = useAscaMemberPosition(fundId, address);
  const { runAscaAction } = useAscaAction(fund.token);
  const [amountInput, setAmountInput] = useState("");

  const amount = amountInput ? parseEther(amountInput) : BigInt(0);
  const hasAmount = amount > BigInt(0);

  const deposit = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "asca",
      action: "deposit",
      id: fundId,
      amount,
      onConfirm: () =>
        runAscaAction({
          action: "deposit",
          functionName: "deposit",
          args: [fundId, amount],
          errors: ASCA_DEPOSIT_ERRORS,
          approveAmount: amount,
          amount,
        }),
    });

  const withdraw = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "asca",
      action: "withdraw",
      id: fundId,
      amount,
      onConfirm: () =>
        runAscaAction({
          action: "withdraw",
          functionName: "withdraw",
          args: [fundId, amount],
          errors: ASCA_WITHDRAW_ERRORS,
          amount,
        }),
    });

  const claimInterest = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "asca",
      action: "claimInterest",
      id: fundId,
      amount: position?.pendingInterest,
      onConfirm: () =>
        runAscaAction({
          action: "claimInterest",
          functionName: "claimInterest",
          args: [fundId],
          errors: ASCA_CLAIM_INTEREST_ERRORS,
          amount: position?.pendingInterest,
        }),
    });

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">Your savings</Heading3>
      </header>
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <PositionValue
          label="Your savings"
          amount={position?.savings}
          className="md:items-start"
        />
        <PositionValue
          label="Withdrawable"
          amount={position?.withdrawable}
          className="md:items-center md:justify-center"
        />
        <PositionValue
          label="Unclaimed interest"
          amount={position?.pendingInterest}
          className="md:justify-end md:items-end"
        />
      </div>
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
            onClick={deposit}
            disabled={!hasAmount || fund.deactivated}
          >
            Deposit
          </LocalButton>
          <LocalButton
            className="w-full font-bold"
            variant="secondary"
            onClick={withdraw}
            disabled={!hasAmount}
          >
            Withdraw
          </LocalButton>
        </div>
        {fund.deactivated && (
          <Body className="text-xs text-surface-grey">
            This fund is deactivated — deposits are closed.
          </Body>
        )}
      </div>
      <div className="border-t border-paper-2 pt-4">
        <LocalButton
          className="w-full font-bold"
          variant="positive"
          onClick={claimInterest}
          disabled={!position || position.pendingInterest === BigInt(0)}
        >
          Claim interest
        </LocalButton>
      </div>
    </section>
  );
};

function PositionValue({
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

export default MemberPosition;
