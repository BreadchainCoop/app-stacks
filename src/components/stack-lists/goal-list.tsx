"use client";

import { useGoalMemberGoals } from "@/hooks/use-goal-member-goals";
import { useUserStacksMetadata } from "@/hooks/use-user-stacks-metadata";
import { GOAL_STATE_LABELS, GoalState } from "@/lib/goal-state";
import { stackMetadataId, stackTypeDetailPath } from "@/lib/stack-types";
import { formatShortDate } from "@/utils/time";
import { formatBalance } from "@breadcoop/ui";
import { Address, formatEther } from "viem";
import StackCard from "./stack-card";
import StackListSection from "./stack-list-section";

const STATE_CHIP_CLASSES: Record<GoalState, string> = {
  [GoalState.Funding]: "border-primary-blue text-primary-blue",
  [GoalState.Funded]: "border-system-green text-system-green",
  [GoalState.Failed]: "border-system-red text-system-red",
  [GoalState.Cancelled]: "border-surface-grey text-surface-grey",
  [GoalState.Released]: "border-system-green text-system-green",
};

const formatBread = (amount: bigint) =>
  `${formatBalance(+formatEther(amount), 2)} BREAD`;

/**
 * The connected member's Goal savings circles. Rendered feature-gated on the
 * home dashboard (hidden when empty) and on the account page.
 */
const GoalList = ({
  address,
  nameAddress,
  hideWhenEmpty = false,
}: {
  /** Whose goals to list (getMemberGoals reverse index). */
  address: Address | undefined;
  /**
   * Whose Supabase metadata resolves goal names (member-only). Defaults to
   * `address`; on account pages pass the viewer so visitors only see names of
   * goals they also belong to.
   */
  nameAddress?: Address | undefined;
  hideWhenEmpty?: boolean;
}) => {
  const { goals, isLoading } = useGoalMemberGoals(address);
  const { stacksMap } = useUserStacksMetadata(nameAddress ?? address);

  return (
    <StackListSection
      title="Goal savings"
      isLoading={isLoading}
      isEmpty={goals.length === 0}
      hideWhenEmpty={hideWhenEmpty}
      emptyMessage="You haven't joined any goal savings circle yet."
    >
      {goals.map(({ id, goal, state, totalDeposited }) => {
        const name =
          stacksMap[stackMetadataId("goal", id)]?.stackname ?? `Goal ${id}`;

        return (
          <StackCard
            key={id.toString()}
            href={stackTypeDetailPath("goal", id)}
            name={name}
            chip={{
              label: GOAL_STATE_LABELS[state],
              className: STATE_CHIP_CLASSES[state],
            }}
            stats={[
              {
                label: "Raised",
                value: `${formatBread(totalDeposited)} / ${formatBread(goal.goalAmount)}`,
              },
              {
                label: "Deadline",
                value: formatShortDate(Number(goal.deadline) * 1000),
              },
            ]}
          />
        );
      })}
    </StackListSection>
  );
};

export default GoalList;
