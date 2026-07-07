"use client";

import { FeatureGate } from "@/components/feature-gate";
import { Address } from "viem";
import AscaList from "./asca-list";
import CollectiveList from "./collective-list";
import GoalList from "./goal-list";

/**
 * The feature-gated per-type lists for the three new stack types, shared by the
 * home dashboard and the account page. Each list is wrapped in its own
 * FeatureGate so a deployment with the flags off renders exactly as before.
 *
 * `hideWhenEmpty` collapses empty lists entirely (used on home, where the
 * lists sit under the ROSCA carousel); on the account page they always show so
 * the member sees an explicit empty state.
 */
const NewStackLists = ({
  address,
  nameAddress,
  hideWhenEmpty = false,
}: {
  /** Whose stacks to list (per-type reverse indexes). */
  address: Address | undefined;
  /**
   * Whose Supabase metadata resolves ASCA/goal names. Defaults to `address`;
   * pass the viewer on account pages so visitors only see names of stacks they
   * also belong to. Collective fund names are on-chain and ignore this.
   */
  nameAddress?: Address | undefined;
  hideWhenEmpty?: boolean;
}) => {
  return (
    <>
      <FeatureGate feature="asca">
        <AscaList
          address={address}
          nameAddress={nameAddress}
          hideWhenEmpty={hideWhenEmpty}
        />
      </FeatureGate>
      <FeatureGate feature="goalSavings">
        <GoalList
          address={address}
          nameAddress={nameAddress}
          hideWhenEmpty={hideWhenEmpty}
        />
      </FeatureGate>
      <FeatureGate feature="collectiveFund">
        <CollectiveList address={address} hideWhenEmpty={hideWhenEmpty} />
      </FeatureGate>
    </>
  );
};

export default NewStackLists;
