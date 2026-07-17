"use client";

import Loading from "@/app/loading";
import Alert from "@/components/alert";
import LocalButton from "@/components/button";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { Body, LoginButton, useConnectedUser } from "@breadcoop/ui";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useReadContract } from "wagmi";
import AcceptInvite from "./accept-invite";

interface JoinRequest {
  id: string;
  status: "pending" | "approved" | "rejected";
  invite_link: { short: string; long: string; nonce: string } | null;
}

const LoadingBlock = () => (
  <div className="flex items-center justify-center">
    <Loading />
  </div>
);

const RequestToJoin = ({ circleId }: { circleId: string }) => {
  const { user } = useConnectedUser();
  const { user: privyUser } = usePrivy();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const address = user.status === "CONNECTED" ? user.address : undefined;
  const parsedId = BigInt(circleId || "0");

  const { data: isMember, error: isMemberError } = useReadContract({
    abi: savingCirclesAbi,
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    functionName: "isMember",
    args: [parsedId, address as `0x${string}`],
    query: {
      enabled:
        (user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN") &&
        !!address,
    },
    chainId: getDefaultChainId(),
  });

  const requestQueryKey = ["join-request", circleId, privyUser?.id];

  const { data: myRequest, isLoading: isLoadingRequest } = useQuery({
    queryKey: requestQueryKey,
    queryFn: async (): Promise<JoinRequest | null> => {
      const res = await fetch(
        `/api/stacks/join-requests?circleId=${circleId}&privyUserId=${privyUser?.id}`
      );
      const body = await res.json();

      if (!res.ok || !body.success) {
        throw new Error(body.error ?? "Failed to load request status");
      }

      return body.requests[0] ?? null;
    },
    enabled: !!privyUser?.id && isMember === false,
  });

  const requestToJoin = async () => {
    if (!privyUser?.id) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/stacks/join-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ circleId, privyUserId: privyUser.id }),
      });
      const body = await res.json();

      if (!res.ok || !body.success) {
        throw new Error(body.error ?? "Failed to request to join");
      }

      queryClient.setQueryData(requestQueryKey, body.request);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message || "Failed to request to join");
    } finally {
      setSubmitting(false);
    }
  };

  if (user.status !== "CONNECTED") {
    return <LoginButton app="stacks" status={user.status} />;
  }

  if (!address) {
    return (
      <Body className="text-center">Reconnect your wallet to continue.</Body>
    );
  }

  if (typeof isMember === "boolean") {
    if (isMember) {
      return (
        <Body className="text-system-green text-center">
          You are already a member of this circle!
        </Body>
      );
    }

    if (isLoadingRequest) return <LoadingBlock />;

    if (myRequest?.status === "approved" && myRequest.invite_link) {
      const signature =
        new URL(myRequest.invite_link.long).searchParams.get("signature") ?? "";

      return (
        <>
          <Alert
            closeAble={false}
            variant="success"
            title="You're approved!"
            description="Accept your invite below to join this stack."
          />
          <AcceptInvite
            circleId={circleId}
            nonce={myRequest.invite_link.nonce}
            signature={signature}
          />
        </>
      );
    }

    if (myRequest?.status === "pending") {
      return (
        <Body className="text-center text-surface-grey">
          Request sent. You&apos;ll be able to join once the stack creator
          approves it.
        </Body>
      );
    }

    if (myRequest?.status === "rejected") {
      return (
        <Body className="text-system-red text-center">
          Your request to join this stack wasn&apos;t approved.
        </Body>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <LocalButton
          onClick={requestToJoin}
          leftIcon={submitting ? undefined : <PaperPlaneTiltIcon size={24} />}
          className="w-full"
          variant="positive"
          isLoading={submitting}
        >
          Request to join
        </LocalButton>
        {error && <Body className="text-system-red text-center">{error}</Body>}
      </div>
    );
  }

  if (isMemberError) {
    return (
      <Body className="text-system-red text-center">
        Unable to get data! Please refresh the page!
      </Body>
    );
  }

  return <LoadingBlock />;
};

export default RequestToJoin;
