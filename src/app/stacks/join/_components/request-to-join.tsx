"use client";

import Loading from "@/app/loading";
import LocalButton from "@/components/button";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useEffectiveMemberAddress } from "@/hooks/use-effective-member-address";
import { useAutomaticClaims } from "@/hooks/use-automatic-claims";
import { useCirclePreview } from "@/hooks/use-circle-preview";
import { useJoinRequests } from "@/hooks/use-join-requests";
import { useStackSupabase } from "@/hooks/use-stack-supabase";
import { Body, LoginButton, useConnectedUser } from "@breadcoop/ui";
import { CheckIcon } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useReadContract } from "wagmi";

type RequestToJoinProps = {
  circleId: string;
};

// A hand-edited/corrupted invite link can hand us a non-numeric circleId —
// BigInt() throws synchronously, so validate before parsing it for real.
const isValidCircleId = (circleId: string) => {
  try {
    BigInt(circleId);
    return true;
  } catch {
    return false;
  }
};

export default function RequestToJoin({ circleId }: RequestToJoinProps) {
  const router = useRouter();
  const { user } = useConnectedUser();
  const { getAccessToken } = usePrivy();

  if (!circleId || !isValidCircleId(circleId)) {
    return (
      <Body className="text-system-warning text-center">
        This invite link is invalid or missing a Stack ID.
      </Body>
    );
  }

  return (
    <RequestToJoinWithCircleId
      circleId={circleId}
      user={user}
      getAccessToken={getAccessToken}
      router={router}
    />
  );
}

function RequestToJoinWithCircleId({
  circleId,
  user,
  getAccessToken,
  router,
}: {
  circleId: string;
  user: ReturnType<typeof useConnectedUser>["user"];
  getAccessToken: ReturnType<typeof usePrivy>["getAccessToken"];
  router: ReturnType<typeof useRouter>;
}) {
  const parsedId = BigInt(circleId);
  const address = useEffectiveMemberAddress(parsedId);
  const { activate: enableAutomaticClaims } = useAutomaticClaims();
  const hasEnabledAutoClaims = useRef(false);

  // InviteDetails (rendered alongside this component) already shows "This
  // stack does not exist." for a bogus circleId - don't also render a live
  // "Request to join" button underneath it.
  const { data: stackMetadata, isLoading: isLoadingMetadata } =
    useStackSupabase(circleId);

  const [status, setStatus] = useState<"idle" | "requesting" | "requested">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const { data: circle, isLoading: isLoadingCircle } =
    useCirclePreview(circleId);

  // Whether we already have a pending request server-side — checked so the
  // "Request sent" state survives a page refresh, not just in-memory state.
  const {
    data: joinRequestData,
    isLoading: isLoadingOwnRequest,
    isFetched: hasFetchedOwnRequest,
  } = useJoinRequests(
    circleId,
    address,
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
  );
  const isRequestPending =
    status === "requested" || joinRequestData?.ownRequestStatus === "pending";

  // Mirrors the contract's own addMembers guard (onlyCommissioned +
  // AlreadyActive): a circle that's started can never accept a new member.
  // effectiveCircleStartTime is set once at start() and never reset — and
  // decommission() itself requires the circle to already be active — so this
  // one field also covers a decommissioned circle, without an extra read.
  const hasStarted = circle
    ? circle.effectiveCircleStartTime !== BigInt(0)
    : false;

  const { data: isMember, error: isMemberError } = useReadContract({
    abi: savingCirclesAbi,
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    functionName: "isMember",
    args: [parsedId, address as `0x${string}`],
    query: {
      enabled:
        (user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN") &&
        !!address,
      refetchInterval: isRequestPending ? 5000 : false,
    },
    chainId: getDefaultChainId(),
  });

  useEffect(() => {
    if (isRequestPending && isMember) {
      if (!hasEnabledAutoClaims.current) {
        hasEnabledAutoClaims.current = true;
        // Not awaited: the redirect shouldn't wait on the opt-in tx landing.
        enableAutomaticClaims(parsedId, true);
      }
      router.push(`/stacks/${circleId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRequestPending, isMember, circleId]);

  const requestToJoin = async () => {
    if (!address) return;

    setStatus("requesting");
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not signed in");

      const res = await fetch("/api/stacks/join-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          circleId,
          walletAddress: address,
        }),
      });
      const body = await res.json();

      if (!res.ok || !body.success) {
        throw new Error(body.error ?? "Failed to send join request");
      }

      setStatus("requested");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message || "Failed to send join request");
      setStatus("idle");
    }
  };

  if (!isLoadingMetadata && !stackMetadata) {
    return null;
  }

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

    if (isLoadingCircle || (isLoadingOwnRequest && !hasFetchedOwnRequest)) {
      return (
        <div className="flex items-center justify-center">
          <Loading />
        </div>
      );
    }

    if (hasStarted) {
      return (
        <Body className="text-system-warning text-center">
          This Stack has already started and can no longer accept new members.
        </Body>
      );
    }

    if (isRequestPending) {
      return (
        <Body className="text-surface-grey text-center">
          Request sent. Ask the Stack owner to add you — this page will update
          automatically once you&apos;re in.
        </Body>
      );
    }

    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <LocalButton
          onClick={requestToJoin}
          leftIcon={
            status === "requesting" ? undefined : <CheckIcon size={24} />
          }
          className="w-full"
          variant="positive"
          isLoading={status === "requesting"}
        >
          Request to join
        </LocalButton>
        {error && (
          <Body className="text-system-warning text-center">{error}</Body>
        )}
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

  return (
    <div className="flex items-center justify-center">
      <Loading />
    </div>
  );
}
