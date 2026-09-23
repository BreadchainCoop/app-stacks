"use client";

import LocalButton from "@/components/button";
import NumericInput from "@/components/numeric-input";
import { useModal } from "@/components/modal/context";
import { GoalInfo, useGoalTotalDeposited } from "@/hooks/use-goal";
import { useGoalMemberContribution } from "@/hooks/use-goal-member-contribution";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import {
  GOAL_DEPOSIT_ERRORS,
  GOAL_WITHDRAW_ERRORS,
} from "@/lib/contract-errors";
import {
  GoalState,
  isGoalOpen,
  isGoalSettled,
  isGoalWithdrawable,
} from "@/lib/goal-state";
import {
  Body,
  formatBalance,
  Heading3,
  Logo,
  useConnectedUser,
} from "@breadcoop/ui";
import { useState } from "react";
import { zeroAddress } from "viem";
import { useGoalAction } from "./use-goal-action";
import {
  DEPOSIT_TOKEN,
  formatDepositAmount,
  parseDepositAmount,
} from "@/lib/deposit-token";

const MemberContribution = ({
  goalId,
  goal,
  state,
}: {
  goalId: bigint;
  goal: GoalInfo;
  state: GoalState;
}) => {
  const now = useBlockTimestamp();
  const { setModal } = useModal();
  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;
  const { position } = useGoalMemberContribution(goalId, address);
  const { data: totalDeposited } = useGoalTotalDeposited(goalId);
  const { runGoalAction } = useGoalAction(goal.token);
  const [amountInput, setAmountInput] = useState("");

  const amount = amountInput ? parseDepositAmount(amountInput) : BigInt(0);
  const hasAmount = amount > BigInt(0);

  const nowSeconds = BigInt(Math.floor(now / 1000));
  const hasBeneficiary = goal.beneficiary !== zeroAddress;
  const settled = isGoalSettled({ state, hasBeneficiary, totalDeposited });
  const depositOpen =
    !settled &&
    isGoalOpen({
      state,
      deadline: goal.deadline,
      now: nowSeconds,
    });
  const withdrawable = isGoalWithdrawable({ state, hasBeneficiary });
  const withdrawNote = withdrawable
    ? "Withdrawing returns your entire contribution."
    : state === GoalState.Released
      ? "Your contribution was paid out to the beneficiary with the rest of the pot."
      : "Contributions are locked until the goal is decided.";
  const contribution = position?.contribution ?? BigInt(0);

  const deposit = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "goal",
      action: "deposit",
      id: goalId,
      amount,
      onConfirm: () =>
        runGoalAction({
          action: "deposit",
          functionName: "deposit",
          args: [goalId, amount],
          errors: GOAL_DEPOSIT_ERRORS,
          approveAmount: amount,
          amount,
        }),
    });

  const withdraw = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "goal",
      action: "withdraw",
      id: goalId,
      amount: contribution,
      onConfirm: () =>
        runGoalAction({
          action: "withdraw",
          functionName: "withdraw",
          args: [goalId],
          errors: GOAL_WITHDRAW_ERRORS,
          amount: contribution,
        }),
    });

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">Your contribution</Heading3>
      </header>
      <Body className="flex flex-col justify-start">
        <span className="text-surface-grey">Your contribution</span>
        <span className="inline-flex items-center justify-start">
          <Logo size={24} variant="square" className="mr-1" />
          <span className="font-bold mt-[0.2rem]">
            {position !== undefined
              ? formatBalance(+formatDepositAmount(contribution), 2)
              : "-"}{" "}
            {DEPOSIT_TOKEN.symbol}
          </span>
        </span>
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
            <Logo
              text={DEPOSIT_TOKEN.symbol}
              className="size-6"
              variant="square"
            />
          </div>
        </div>
        <LocalButton
          className="w-full font-bold"
          onClick={deposit}
          disabled={!hasAmount || !depositOpen}
        >
          Deposit
        </LocalButton>
        {!depositOpen && (
          <Body className="text-xs text-surface-grey">
            {settled
              ? "This goal is completed and no longer accepting deposits."
              : "This goal is no longer accepting deposits."}
          </Body>
        )}
        {depositOpen && !hasAmount && (
          <Body className="text-xs text-surface-grey">
            Enter an amount to deposit.
          </Body>
        )}
      </div>
      <div className="border-t border-paper-2 pt-4 flex flex-col gap-2">
        <LocalButton
          className="w-full font-bold"
          variant="secondary"
          onClick={withdraw}
          disabled={!withdrawable || contribution === BigInt(0)}
        >
          Withdraw everything
        </LocalButton>
        <Body className="text-xs text-surface-grey">{withdrawNote}</Body>
      </div>
    </section>
  );
};

export default MemberContribution;
