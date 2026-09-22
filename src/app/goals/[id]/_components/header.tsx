"use client";

import Alert from "@/components/alert";
import BackPage from "@/components/back-page";
import LocalButton from "@/components/button";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { useGoalTotalDeposited } from "@/hooks/use-goal";
import { useStackSupabase } from "@/hooks/use-stack-supabase";
import { GOAL_STATE_LABELS, GoalState, isGoalSettled } from "@/lib/goal-state";
import { stackMetadataId } from "@/lib/stack-types";
import { Chip, cn, Heading2, useCopyToClipboard } from "@breadcoop/ui";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

function CopyGoalLink({ id }: { id: string }) {
  const [origin, setOrigin] = useState("");
  const { copy, copied } = useCopyToClipboard({
    textToCopy: `${origin}/goals/${id}`,
  });

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <LocalButton
      variant="light"
      className={cn("h-8 border px-4", copied && "text-system-green")}
      leftIcon={
        copied ? (
          <CheckIcon className="fill-system-green" />
        ) : (
          <CopyIcon className="fill-primary-blue" />
        )
      }
      onClick={() => copy()}
      disabled={!origin}
    >
      {copied ? "Copied!" : "Copy goal link"}
    </LocalButton>
  );
}

const STATE_CHIP_CLASSES: Record<GoalState, string> = {
  [GoalState.Funding]: "border-primary-blue text-primary-blue",
  [GoalState.Funded]: "border-system-green text-system-green",
  [GoalState.Failed]: "border-system-red text-system-red",
  [GoalState.Cancelled]: "border-surface-grey text-surface-grey",
  [GoalState.Released]: "border-system-green text-system-green",
};

function stateAlert({
  state,
  hasBeneficiary,
  depositsClosed,
  settled,
}: {
  state: GoalState;
  hasBeneficiary: boolean;
  depositsClosed: boolean;
  settled: boolean;
}) {
  switch (state) {
    case GoalState.Funding:
      return {
        title: "Contributions are locked until the goal is decided",
        description:
          "Deposits stay locked while the goal is funding. If the goal isn't reached by the deadline, every member can reclaim exactly what they deposited.",
      };
    case GoalState.Funded:
      if (settled) {
        return {
          title: "Goal completed",
          description:
            "The goal was reached and every member has since withdrawn. This goal is finished.",
        };
      }
      return {
        title: "Goal reached!",
        description: hasBeneficiary
          ? `The goal has been reached — the pot can now be released to the beneficiary. ${
              depositsClosed
                ? "The deadline has passed, so deposits are closed."
                : "Deposits stay open until the deadline."
            }`
          : depositsClosed
            ? "The goal has been reached — you can now withdraw your contribution. The deadline has passed, so deposits are closed."
            : "The goal has been reached — you can now withdraw your contribution, or keep depositing until the deadline.",
      };
    case GoalState.Failed:
      return {
        title: "This goal was not reached in time",
        description:
          "The deadline passed before the goal was reached. Every member can withdraw exactly what they deposited.",
      };
    case GoalState.Cancelled:
      return {
        title: "This goal was cancelled",
        description:
          "The organizer cancelled this goal. Every member can withdraw exactly what they deposited.",
      };
    case GoalState.Released:
      return {
        title: "The pot has been released",
        description: "The whole pot was paid out to the beneficiary.",
      };
  }
}

const GoalHeader = ({
  id,
  isMember,
  state,
  hasBeneficiary,
  deadline,
}: {
  id: string;
  isMember: boolean;
  state: GoalState | undefined;
  hasBeneficiary: boolean;
  deadline: bigint | undefined;
}) => {
  const now = useBlockTimestamp();
  const { data: totalDeposited } = useGoalTotalDeposited(BigInt(id));
  const { data: stackMetadata } = useStackSupabase(
    stackMetadataId("goal", id),
    isMember
  );

  const goalName = isMember
    ? (stackMetadata?.stackname ?? `Goal ${id}`)
    : `Goal ${id}`;

  const depositsClosed =
    deadline !== undefined && BigInt(Math.floor(now / 1000)) >= deadline;
  const alert =
    state !== undefined
      ? stateAlert({
          state,
          hasBeneficiary,
          depositsClosed,
          settled: isGoalSettled({ state, hasBeneficiary, totalDeposited }),
        })
      : null;

  return (
    <header className="flex flex-col mb-3.5 md:mb-6">
      <div className="flex flex-col items-start gap-2.5 mb-4 md:flex-row md:items-center md:justify-between md:flex-wrap">
        <BackPage label="Return to Dashboard" href="/" className="m-0!" />
        <CopyGoalLink id={id} />
      </div>
      <div className="flex flex-col flex-wrap gap-4 mb-5.25 sm:flex-row sm:items-center sm:justify-between md:order-first md:mb-7.25">
        <Heading2 className="text-primary-blue text-2xl md:text-5xl">
          {goalName}
        </Heading2>
        <div className="flex items-center gap-2">
          {isMember && (
            <Chip className="border-system-green text-system-green bg-paper-main max-w-max hover:border-current">
              Member
            </Chip>
          )}
          {state !== undefined && (
            <Chip
              className={cn(
                "bg-paper-main max-w-max hover:border-current",
                STATE_CHIP_CLASSES[state]
              )}
            >
              {GOAL_STATE_LABELS[state]}
            </Chip>
          )}
        </div>
      </div>
      {alert && (
        <Alert
          closeAble={false}
          variant={
            state === GoalState.Funded || state === GoalState.Released
              ? "success"
              : "warning"
          }
          title={alert.title}
          description={alert.description}
        />
      )}
    </header>
  );
};

export default GoalHeader;
