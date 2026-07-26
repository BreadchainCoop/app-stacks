"use client";

import { useConnectedUser } from "@breadcoop/ui";
import { usePreferredEnsName } from "@/hooks/use-preferred-ens-name";
import { formatAddress } from "@/utils/address";

export function useConnectedAccount() {
  const { user } = useConnectedUser();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;
  const { ensName } = usePreferredEnsName({ address });

  return {
    user,
    address,
    displayName: address ? (ensName ?? formatAddress(address)) : undefined,
  };
}
