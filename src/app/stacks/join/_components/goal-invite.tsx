"use client";

import Loading from "@/app/loading";
import LocalButton from "@/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "@/components/accordion";
import { useUserIdentity } from "@/components/providers/user-identity";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { useGoal, GoalInfo, useGoalState } from "@/hooks/use-goal";
import { useJoinRequests } from "@/hooks/use-join-requests";
import { useStackSupabase } from "@/hooks/use-stack-supabase";
import { goalSavingCirclesAbi } from "@/lib/abis/goal-saving-circles";
import { GOAL_SAVINGS_CONTRACT_ADDRESS } from "@/lib/constants";
import { DEPOSIT_TOKEN, formatDepositAmount } from "@/lib/deposit-token";
import { isGoalOpen } from "@/lib/goal-state";
import { stackMetadataId, stackTypeDetailPath } from "@/lib/stack-types";
import { formatAddress } from "@/utils/address";
import { getDefaultChainId } from "@/utils/chain";
import { formatShortDate } from "@/utils/time";
import {
  Body,
  formatBalance,
  Heading1,
  LoginButton,
  useConnectedUser,
} from "@breadcoop/ui";
import { CheckIcon, ConfettiIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zeroAddress } from "viem";
import { useReadContract } from "wagmi";

// A hand-edited/corrupted invite link can hand us a non-numeric circleId —
// BigInt() throws synchronously, so validate before parsing it for real.
const parseGoalId = (goalId: string): bigint | undefined => {
  try {
    return goalId ? BigInt(goalId) : undefined;
  } catch {
    return undefined;
  }
};

export default function GoalInvite({ goalId }: { goalId: string }) {
  const parsedId = parseGoalId(goalId);
  const goalResult = useGoal(parsedId);
  const { data: stackMetadata } = useStackSupabase(
    stackMetadataId("goal", goalId),
    parsedId !== undefined
  );

  return (
    <div className="*:mb-6 last:mb-0 page-layout py-6 w-full max-w-142 mx-auto card-shadow-bg">
      <div className="flex flex-col text-center items-center justify-center gap-3">
        <ConfettiIcon className="size-20 fill-primary-blue" />
        <Heading1 className="text-2xl leading-6">You are invited!</Heading1>
        <Body className="">
          Request to join this shared goal and its organizer will add you.
        </Body>
      </div>

      {parsedId === undefined ? (
        <Body className="text-system-warning text-center">
          This invite link is invalid or missing a Goal ID.
        </Body>
      ) : goalResult.data ? (
        <>
          <GoalInviteDetails
            goal={goalResult.data}
            goalId={goalId}
            goalName={stackMetadata?.stackname}
          />

          <GoalRequestToJoin goalId={goalId} goal={goalResult.data} />
        </>
      ) : goalResult.error ? (
        <Body className="text-system-red text-center">
          Unable to load goal details. Please try again.
        </Body>
      ) : (
        <div className="flex items-center justify-center">
          <Loading />
        </div>
      )}
    </div>
  );
}

function GoalInviteDetails({
  goal,
  goalId,
  goalName,
}: {
  goal: GoalInfo;
  goalId: string;
  goalName?: string;
}) {
  return (
    <div className="border-t border-blue-0 pt-6">
      <Body className="text-center mb-6">
        {goalName
          ? `You have been invited to join the "${goalName}" shared goal.`
          : "You have been invited to join a shared goal."}
      </Body>

      <Accordion defaultValue="details">
        <AccordionItem
          value="details"
          className="border-blue-0! bg-transparent!"
        >
          <AccordionHeader>Goal details</AccordionHeader>
          <AccordionContent>
            <div className="">
              {goalName && <RowDetail label="Goal name" body={goalName} />}
              <RowDetail label="Goal ID" body={goalId} />
              <RowDetail
                label="Goal amount"
                body={`${formatBalance(+formatDepositAmount(goal.goalAmount), 2)} ${DEPOSIT_TOKEN.symbol}`}
              />
              <RowDetail
                label="Deadline"
                body={formatShortDate(Number(goal.deadline) * 1000)}
              />
              <RowDetail
                label="Beneficiary"
                body={
                  goal.beneficiary !== zeroAddress
                    ? formatAddress(goal.beneficiary)
                    : "None — members reclaim their share"
                }
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function RowDetail({ label, body }: { label: string; body: string | number }) {
  return (
    <div className="flex items-center justify-between mb-2.5 last:mb-0">
      <Body className="text-surface-grey">{label}</Body>
      <Body bold className="text-surface-ink">
        {body}
      </Body>
    </div>
  );
}

function GoalRequestToJoin({
  goalId,
  goal,
}: {
  goalId: string;
  goal: GoalInfo;
}) {
  const router = useRouter();
  const { user } = useConnectedUser();
  const { getAuthToken } = useUserIdentity();
  const now = useBlockTimestamp();

  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;

  const metadataId = stackMetadataId("goal", goalId);
  const parsedId = BigInt(goalId);
  const { state } = useGoalState(parsedId);

  const [status, setStatus] = useState<"idle" | "requesting" | "requested">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  // Whether we already have a pending request server-side, so "Request sent"
  // survives a page refresh and not just in-memory state.
  const {
    data: joinRequestData,
    isLoading: isLoadingOwnRequest,
    isFetched: hasFetchedOwnRequest,
  } = useJoinRequests(metadataId, address, !!address);
  const isRequestPending =
    status === "requested" || joinRequestData?.ownRequestStatus === "pending";

  const { data: isMember, error: isMemberError } = useReadContract({
    abi: goalSavingCirclesAbi,
    address: GOAL_SAVINGS_CONTRACT_ADDRESS,
    functionName: "isMember",
    args: [parsedId, address as `0x${string}`],
    query: {
      enabled: !!address,
      refetchInterval: isRequestPending ? 5000 : false,
    },
    chainId: getDefaultChainId(),
  });

  useEffect(() => {
    if (isRequestPending && isMember) {
      router.push(stackTypeDetailPath("goal", goalId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRequestPending, isMember, goalId]);

  const requestToJoin = async () => {
    if (!address) return;

    setStatus("requesting");
    setError(null);

    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Not signed in");

      const res = await fetch("/api/stacks/join-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ circleId: metadataId, walletAddress: address }),
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
          You are already a member of this goal!
        </Body>
      );
    }

    if (state === undefined || (isLoadingOwnRequest && !hasFetchedOwnRequest)) {
      return (
        <div className="flex items-center justify-center">
          <Loading />
        </div>
      );
    }

    if (
      !isGoalOpen({
        state,
        deadline: goal.deadline,
        now: BigInt(Math.floor(now / 1000)),
      })
    ) {
      return (
        <Body className="text-system-warning text-center">
          This goal is no longer accepting new members.
        </Body>
      );
    }

    if (isRequestPending) {
      return (
        <Body className="text-surface-grey text-center">
          Request sent. Ask the goal organizer to add you — this page will
          update automatically once you&apos;re in.
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
