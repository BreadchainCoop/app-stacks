"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Body, useConnectedUser } from "@breadcoop/ui";
import Loading from "@/app/loading";

const OwnAccountRedirect = () => {
  const router = useRouter();
  const { user } = useConnectedUser();

  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : null;

  useEffect(() => {
    if (address) router.replace(`/account/${address}`);
  }, [address]);

  if (address) return <Loading />;

  return (
    <Body className="text-surface-grey">
      Please sign in to view your account activity.
    </Body>
  );
};

export default OwnAccountRedirect;
