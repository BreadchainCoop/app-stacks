"use client";

import { FeatureGate } from "@/components/feature-gate";
import { useConnectedUser } from "@breadcoop/ui";
import GoalList from "./goal-list";

/** The connected user's Goal savings, under the ROSCA carousel on home. */
const HomeGoals = () => {
  const { user } = useConnectedUser();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;

  return (
    <FeatureGate feature="goalSavings">
      <GoalList address={address} hideWhenEmpty />
    </FeatureGate>
  );
};

export default HomeGoals;
