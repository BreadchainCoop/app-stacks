"use client";

import { Heading1 } from "@breadcoop/ui";
import { Address } from "viem";
import { useIsOwnAddress } from "@/hooks/use-is-own-address";

// Server can't tell whose account this is, so the owner-vs-visitor wording is
// resolved client-side: "My account" for the connected owner, "Account" otherwise.
const AccountHeading = ({ address }: { address: Address }) => {
  const isOwner = useIsOwnAddress(address);

  return (
    <Heading1 className="text-3xl">
      {isOwner ? "My account" : "Account"}
    </Heading1>
  );
};

export default AccountHeading;
