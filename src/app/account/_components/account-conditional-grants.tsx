"use client";

import { ConditionalGrantsGate } from "@/components/conditional-grants-gate";
import ConditionalGrantList from "@/components/stack-lists/conditional-grant-list";
import { Address } from "viem";

/** The feature-gated list of conditional grants the profile owner gave or received. */
const AccountConditionalGrants = ({ address }: { address: Address }) => (
  <ConditionalGrantsGate>
    <ConditionalGrantList address={address} />
  </ConditionalGrantsGate>
);

export default AccountConditionalGrants;
