"use client";

import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import { GoalInfo, useGoalTotalDeposited } from "@/hooks/use-goal";
import { GOAL_RELEASE_ERRORS } from "@/lib/contract-errors";
import { GoalState, isGoalReleasable } from "@/lib/goal-state";
import { formatAddress } from "@/utils/address";
import { Body, Heading3 } from "@breadcoop/ui";
import { zeroAddress } from "viem";
import { useGoalAction } from "./use-goal-action";

const ReleasePanel = ({
  goalId,
  goal,
  state,
}: {
  goalId: bigint;
  goal: GoalInfo;
  state: GoalState;
}) => {
  const { setModal } = useModal();
  const { data: totalDeposited } = useGoalTotalDeposited(goalId);
  const { runGoalAction } = useGoalAction();

  if (
    !isGoalReleasable({
      state,
      hasBeneficiary: goal.beneficiary !== zeroAddress,
    })
  )
    return null;

  const release = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "goal",
      action: "release",
      id: goalId,
      amount: totalDeposited,
      onConfirm: () =>
        runGoalAction({
          action: "release",
          functionName: "release",
          args: [goalId],
          errors: GOAL_RELEASE_ERRORS,
          amount: totalDeposited,
        }),
    });

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">Release the pot</Heading3>
      </header>
      <Body className="text-surface-grey">
        The goal has been reached. Anyone can now release the whole pot
        (including any overshoot) to the beneficiary{" "}
        {formatAddress(goal.beneficiary)}.
      </Body>
      <LocalButton
        variant="positive"
        className="w-full font-bold"
        onClick={release}
      >
        Release to beneficiary
      </LocalButton>
    </section>
  );
};

export default ReleasePanel;
