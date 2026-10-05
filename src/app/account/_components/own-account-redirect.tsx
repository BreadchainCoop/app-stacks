"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Body, useConnectedUser } from "@breadcoop/ui";
import Loading from "@/app/loading";
import { useChainPath } from "@/components/providers/active-chain";

const OwnAccountRedirect = () => {
  const chainHref = useChainPath();
  const router = useRouter();
  const { user } = useConnectedUser();

  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : null;

  useEffect(() => {
    if (address) router.replace(chainHref(`/account/${address}`));
  }, [address]);

  if (address) return <Loading />;

  return (
    <Body className="text-surface-grey">
      Please sign in to view your account activity.
    </Body>
  );
};

export default OwnAccountRedirect;
