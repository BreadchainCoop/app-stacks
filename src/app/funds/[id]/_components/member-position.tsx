"use client";

import LocalButton from "@/components/button";
import NumericInput from "@/components/numeric-input";
import { useModal } from "@/components/modal/context";
import { CollectiveFund } from "@/hooks/use-collective-fund";
import { useCollectiveMemberPosition } from "@/hooks/use-collective-member-position";
import {
  COLLECTIVE_DEPOSIT_ERRORS,
  COLLECTIVE_WITHDRAW_ERRORS,
} from "@/lib/contract-errors";
import { previewSharesPayout } from "@/lib/collective-state";
import {
  Body,
  formatBalance,
  Heading3,
  Logo,
  useConnectedUser,
} from "@breadcoop/ui";
import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useCollectiveAction } from "./use-collective-action";

const MemberPosition = ({
  fundId,
  fund,
}: {
  fundId: bigint;
  fund: CollectiveFund;
}) => {
  const { setModal } = useModal();
  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;
  const { position } = useCollectiveMemberPosition(fundId, address);
  const { runCollectiveAction } = useCollectiveAction(fund.token);
  const [amountInput, setAmountInput] = useState("");
  const [sharesInput, setSharesInput] = useState("");

  const amount = amountInput ? parseEther(amountInput) : BigInt(0);
  const hasAmount = amount > BigInt(0);

  const shares = sharesInput ? parseEther(sharesInput) : BigInt(0);
  const ownedShares = position?.shares ?? BigInt(0);
  const sharesValid = shares > BigInt(0) && shares <= ownedShares;
  const sharesPayout = previewSharesPayout({
    shares,
    poolBalance: fund.poolBalance,
    totalShares: fund.totalShares,
  });

  const deposit = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "collective",
      action: "deposit",
      id: fundId,
      amount,
      onConfirm: () =>
        runCollectiveAction({
          action: "deposit",
          functionName: "deposit",
          args: [fundId, amount],
          errors: COLLECTIVE_DEPOSIT_ERRORS,
          approveAmount: amount,
          amount,
        }),
    });

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

  const withdraw = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "collective",
      action: "withdraw",
      id: fundId,
      amount: sharesPayout,
      onConfirm: () =>
        runCollectiveAction({
          action: "withdraw",
          functionName: "withdraw",
          args: [fundId, shares],
          errors: COLLECTIVE_WITHDRAW_ERRORS,
          amount: sharesPayout,
        }),
    });

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">Your position</Heading3>
      </header>
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <PositionValue
          label="Your shares"
          amount={position?.shares}
          unit="Shares"
          className="md:items-start"
        />
        <PositionValue
          label="Redeemable now"
          amount={position?.redeemable}
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
            disabled={!hasAmount}
          >
            Deposit
          </LocalButton>
          <LocalButton
            className="w-full font-bold"
            variant="secondary"
            onClick={donate}
            disabled={!hasAmount}
          >
            Donate
          </LocalButton>
        </div>
        <Body className="text-xs text-surface-grey">
          Deposits mint shares 1:1; donations grow the pool without minting
          shares.
        </Body>
      </div>
      <div className="border-t border-paper-2 pt-4 flex flex-col gap-2">
        <div className="relative">
          <NumericInput
            value={sharesInput}
            onChange={(e) => setSharesInput(e.target.value)}
            className="w-full"
            placeholder="Shares to burn"
            allowDecimal
          />
          <Body
            bold
            className="absolute top-1/2 -translate-y-1/2 right-3 text-surface-grey"
          >
            Shares
          </Body>
        </div>
        <LocalButton
          className="w-full font-bold"
          variant="secondary"
          onClick={withdraw}
          disabled={!sharesValid}
        >
          Withdraw
        </LocalButton>
        <Body className="text-xs text-surface-grey">
          {shares > ownedShares
            ? "You don't hold that many shares."
            : sharesValid
              ? `Burning ${formatBalance(+formatEther(shares), 2)} shares pays out ${formatBalance(
                  +formatEther(sharesPayout),
                  2
                )} BREAD.`
              : "Burn shares anytime for your pro-rata slice of the current pool."}
        </Body>
      </div>
    </section>
  );
};

function PositionValue({
  label,
  amount,
  className,
  unit = "BREAD",
}: {
  label: string;
  amount: bigint | undefined;
  className?: string;
  unit?: string;
}) {
  return (
    <Body className={`flex flex-col justify-start ${className}`}>
      <span className="text-surface-grey">{label}</span>
      <span className="inline-flex items-center justify-start">
        <Logo size={24} variant="square" className="mr-1" />
        <span className="font-bold mt-[0.2rem]">
          {amount !== undefined ? formatBalance(+formatEther(amount), 2) : "-"}{" "}
          {unit}
        </span>
      </span>
    </Body>
  );
}

export default MemberPosition;
