"use client";

import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import { GoalInfo } from "@/hooks/use-goal";
import { GOAL_CANCEL_ERRORS } from "@/lib/contract-errors";
import { GoalState } from "@/lib/goal-state";
import { Body, Heading3, useConnectedUser } from "@breadcoop/ui";
import { useGoalAction } from "./use-goal-action";

const OwnerActions = ({
  goalId,
  goal,
  state,
}: {
  goalId: bigint;
  goal: GoalInfo;
  state: GoalState;
}) => {
  const { setModal } = useModal();
  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;
  const { runGoalAction } = useGoalAction();

  const isOwner =
    !!address && goal.owner.toLowerCase() === address.toLowerCase();

  if (!isOwner || state !== GoalState.Funding) return null;

  const cancel = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "goal",
      action: "cancel",
      id: goalId,
      onConfirm: () =>
        runGoalAction({
          action: "cancel",
          functionName: "cancel",
          args: [goalId],
          errors: GOAL_CANCEL_ERRORS,
        }),
    });

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">Goal organizer actions</Heading3>
      </header>
      <Body className="text-surface-grey">
        Cancelling is irreversible: it closes the goal and unlocks full refunds
        for every member.
      </Body>
      <LocalButton
        variant="destructive"
        className="w-full font-bold"
        onClick={cancel}
      >
        Cancel goal
      </LocalButton>
    </section>
  );
};

export default OwnerActions;
