"use client";

import { FeatureGate } from "@/components/feature-gate";
import MicroloanList from "@/components/stack-lists/microloan-list";
import { Address } from "viem";

/** The feature-gated list of loans the profile owner lent or borrows. */
const AccountMicroloans = ({ address }: { address: Address }) => (
  <FeatureGate feature="microloans">
    <MicroloanList address={address} />
  </FeatureGate>
);

export default AccountMicroloans;
