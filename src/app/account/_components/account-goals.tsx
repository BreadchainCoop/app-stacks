"use client";

import { FeatureGate } from "@/components/feature-gate";
import GoalList from "@/components/stack-lists/goal-list";
import { useConnectedUser } from "@breadcoop/ui";
import { Address } from "viem";

/**
 * The feature-gated Goal savings list on the account page. Lists the profile
 * owner's goals, but resolves names from the *viewer's* own metadata so a
 * visitor only sees names of goals they also belong to.
 */
const AccountGoals = ({ address }: { address: Address }) => {
  const { user } = useConnectedUser();
  const viewerAddress =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;

  return (
    <FeatureGate feature="goalSavings">
      <GoalList address={address} nameAddress={viewerAddress} />
    </FeatureGate>
  );
};

export default AccountGoals;
