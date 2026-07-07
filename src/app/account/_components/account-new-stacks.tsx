"use client";

import NewStackLists from "@/components/stack-lists/new-stack-lists";
import { useConnectedUser } from "@breadcoop/ui";
import { Address } from "viem";

/**
 * The feature-gated new-type stack lists on the account page. Lists the
 * profile owner's stacks, but resolves ASCA/goal names from the *viewer's* own
 * metadata so a visitor only sees names of stacks they share.
 */
const AccountNewStacks = ({ address }: { address: Address }) => {
  const { user } = useConnectedUser();
  const viewerAddress =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;

  return <NewStackLists address={address} nameAddress={viewerAddress} />;
};

export default AccountNewStacks;
