"use client";

import { FeatureGate } from "@/components/feature-gate";
import ConditionalGrantList from "@/components/stack-lists/conditional-grant-list";
import { Address } from "viem";

/** The feature-gated list of conditional grants the profile owner gave or received. */
const AccountConditionalGrants = ({ address }: { address: Address }) => (
  <FeatureGate feature="conditionalGrants">
    <ConditionalGrantList address={address} />
  </FeatureGate>
);

export default AccountConditionalGrants;
