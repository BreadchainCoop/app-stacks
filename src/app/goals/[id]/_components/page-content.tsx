"use client";

import { FeatureGate } from "@/components/feature-gate";
import { CircularProgressIcon } from "@/components/icons/circular-progress";
import { useGoal, useGoalState } from "@/hooks/use-goal";
import { useGoalMemberContribution } from "@/hooks/use-goal-member-contribution";
import { Body, useConnectedUser } from "@breadcoop/ui";
import { zeroAddress } from "viem";
import GoalHeader from "./header";
import GoalOverview from "./goal-overview";
import MemberContribution from "./member-contribution";
import ReleasePanel from "./release-panel";
import GoalMembers from "./members";
import OwnerActions from "./owner-actions";

const PageContent = ({ id }: { id: string }) => {
  return (
    <FeatureGate feature="goalSavings">
      <GoalPageContent id={id} />
    </FeatureGate>
  );
};

const GoalPageContent = ({ id }: { id: string }) => {
  const goalId = BigInt(id);
  const { user } = useConnectedUser();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;
  const goalResult = useGoal(goalId);
  const { state } = useGoalState(goalId);
  const { position } = useGoalMemberContribution(goalId, address);
  const isMember = position?.isMember ?? false;
  const hasBeneficiary =
    !!goalResult.data && goalResult.data.beneficiary !== zeroAddress;

  return (
    <>
      <GoalHeader
        id={id}
        isMember={isMember}
        state={state}
        hasBeneficiary={hasBeneficiary}
      />
      {goalResult.data && state !== undefined ? (
        <div className="*:mb-4 last:mb-0 md:mb-6 md:last:mb-0">
          <GoalOverview goalId={goalId} goal={goalResult.data} state={state} />
          {isMember && (
            <MemberContribution
              goalId={goalId}
              goal={goalResult.data}
              state={state}
            />
          )}
          <ReleasePanel goalId={goalId} goal={goalResult.data} state={state} />
          <GoalMembers
            id={id}
            goal={goalResult.data}
            member={address}
            isMember={isMember}
          />
          <OwnerActions goalId={goalId} goal={goalResult.data} state={state} />
        </div>
      ) : goalResult.error ? (
        <Body className="text-system-red">Unable to get goal data!</Body>
      ) : (
        <div className="flex items-center justify-center">
          <CircularProgressIcon />
        </div>
      )}
    </>
  );
};

export default PageContent;
