"use client";

import Countdown from "@/components/countdown";
import { GoalInfo, useGoalTotalDeposited } from "@/hooks/use-goal";
import { GoalState } from "@/lib/goal-state";
import { formatAddress } from "@/utils/address";
import { formatShortDate } from "@/utils/time";
import { Body, formatBalance, Heading3, Logo } from "@breadcoop/ui";
import Link from "next/link";
import { ReactNode } from "react";
import { formatEther, zeroAddress } from "viem";

const GoalOverview = ({
  goalId,
  goal,
  state,
}: {
  goalId: bigint;
  goal: GoalInfo;
  state: GoalState;
}) => {
  const { data: totalDeposited } = useGoalTotalDeposited(goalId);

  const percentage =
    totalDeposited !== undefined && goal.goalAmount > BigInt(0)
      ? Number((totalDeposited * BigInt(10000)) / goal.goalAmount) / 100
      : 0;
  const hasBeneficiary = goal.beneficiary !== zeroAddress;
  const isDecided =
    state === GoalState.Cancelled || state === GoalState.Released;

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <Heading3 className="text-2xl shrink-0">Goal overview</Heading3>
        <Body bold className="text-xs shrink-0">
          <span className="font-normal">ID: </span>
          <span>{goalId.toString()}</span>
        </Body>
      </header>
      <div className="border-b border-paper-2 pb-4">
        <div className="flex items-center justify-between mb-2">
          <Body bold>Goal progress</Body>
          <Body bold>{Math.round(percentage * 100) / 100}%</Body>
        </div>
        <div className="w-full h-3.5 p-0.75 bg-paper-main">
          <div
            className="h-full bg-primary-blue"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 border-b border-paper-2 pb-4 md:flex-row md:justify-between">
        <PotBalance
          label="Raised so far"
          amount={totalDeposited}
          className="md:items-start"
        />
        <PotBalance
          label="Goal amount"
          amount={goal.goalAmount}
          className="md:justify-end md:items-end"
        />
      </div>
      <div>
        <BreakdownRow label="Deadline">
          <p className="text-h2 text-2xl leading-6 tracking-[-2%]">
            {formatShortDate(Number(goal.deadline) * 1000)}
          </p>
        </BreakdownRow>
        {!isDecided && (
          <BreakdownRow label="Time left">
            <Countdown targetSeconds={Number(goal.deadline)} />
          </BreakdownRow>
        )}
        <BreakdownRow label="On success">
          {hasBeneficiary ? (
            <>
              <p>Pot released to</p>
              <p className="text-h2 text-2xl leading-6 tracking-[-2%]">
                <Link
                  href={`/account/${goal.beneficiary}`}
                  className="hover:text-primary-blue"
                >
                  {formatAddress(goal.beneficiary)}
                </Link>
              </p>
            </>
          ) : (
            <p>Members reclaim their own contributions</p>
          )}
        </BreakdownRow>
      </div>
    </section>
  );
};

function PotBalance({
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

function BreakdownRow({
  label,
  children,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="bg-paper-1 py-2 px-4 flex flex-col gap-2.5 mb-2 last:mb-0 md:flex-row md:justify-between">
      <Body className="text-surface-grey-2 capitalize">{label}</Body>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

export default GoalOverview;
