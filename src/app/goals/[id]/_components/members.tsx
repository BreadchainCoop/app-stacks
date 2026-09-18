"use client";

import { DisplayName } from "@/components/display-name";
import { useUserIdentity } from "@/components/providers/user-identity";
import { useGoalContributions } from "@/hooks/use-goal-members";
import { GoalInfo } from "@/hooks/use-goal";
import { JoinRequest, useJoinRequests } from "@/hooks/use-join-requests";
import { useGoalSavingsTx } from "@/hooks/use-goal-savings-tx";
import { GOAL_ADD_MEMBERS_ERRORS } from "@/lib/contract-errors";
import { DEPOSIT_TOKEN, formatDepositAmount } from "@/lib/deposit-token";
import { stackMetadataId } from "@/lib/stack-types";
import { parseContractError } from "@/utils/parse-contract-error";
import { Body, Chip, formatBalance, Heading3 } from "@breadcoop/ui";
import { Icon } from "@phosphor-icons/react";
import {
  CheckIcon,
  HourglassIcon,
  UsersIcon,
  XCircleIcon,
} from "@phosphor-icons/react/ssr";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Address } from "viem";

const TopRowInfo = ({
  LIcon,
  title,
  value,
}: {
  LIcon: Icon;
  title: string;
  value: string | number;
}) => {
  return (
    <div className="flex items-center justify-start gap-1.5 p-2">
      <LIcon size={24} className="fill-blue-2" />
      <Body className="text-surface-grey-2">{title}</Body>
      <Body className="text-surface-ink">{value}</Body>
    </div>
  );
};

const JoinRequestItem = ({
  id,
  request,
}: {
  id: string;
  request: JoinRequest;
}) => {
  const { sendGoalSavingsTx } = useGoalSavingsTx();
  const { getAuthToken } = useUserIdentity();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<"accepting" | "dismissing" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decide = async (status: "added" | "dismissed") => {
    const token = await getAuthToken();
    if (!token) throw new Error("Not signed in");

    const res = await fetch("/api/stacks/join-request", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requestId: request.id, status }),
    });
    const body = await res.json();

    if (!res.ok || !body.success) {
      throw new Error(body.error ?? "Failed to update join request");
    }

    queryClient.invalidateQueries({
      queryKey: ["join-requests", stackMetadataId("goal", id)],
    });
  };

  const accept = async () => {
    setBusy("accepting");
    setError(null);

    try {
      await sendGoalSavingsTx({
        functionName: "addMembers",
        args: [BigInt(id), [request.wallet_address as Address]],
      });

      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });

      await decide("added");
    } catch (err) {
      setError(parseContractError(err, GOAL_ADD_MEMBERS_ERRORS));
    } finally {
      setBusy(null);
    }
  };

  const dismiss = async () => {
    setBusy("dismissing");
    setError(null);

    try {
      await decide("dismissed");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to dismiss request"
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-paper-1 py-3 px-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Body bold>
          <DisplayName address={request.wallet_address as Address} />
        </Body>
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-1 text-system-green text-xs font-bold disabled:opacity-50"
            disabled={busy !== null}
            onClick={accept}
          >
            <CheckIcon size={16} />
            {busy === "accepting" ? "Adding..." : "Add"}
          </button>
          <button
            className="flex items-center gap-1 text-system-red text-xs font-bold disabled:opacity-50"
            disabled={busy !== null}
            onClick={dismiss}
          >
            <XCircleIcon size={16} />
            {busy === "dismissing" ? "Dismissing..." : "Dismiss"}
          </button>
        </div>
      </div>
      {error && <Body className="text-system-red text-xs">{error}</Body>}
    </div>
  );
};

const GoalMembers = ({
  id,
  goal,
  member,
}: {
  id: string;
  goal: GoalInfo;
  member: Address | undefined;
}) => {
  const { contributions, isLoading } = useGoalContributions(BigInt(id));
  const isOwner = !!member && goal.owner.toLowerCase() === member.toLowerCase();

  // Only the owner gets the pending list back (the API verifies it
  // server-side); everyone else just gets their own request status.
  const { data: joinRequests } = useJoinRequests(
    stackMetadataId("goal", id),
    member,
    isOwner
  );
  const pendingRequests = joinRequests?.requests ?? [];

  const totalMembers = isLoading ? "-" : contributions.length;

  return (
    <section className="p-4 flex flex-col gap-4">
      <header>
        <Heading3 className="pb-1 leading-[100%] text-2xl">
          Members ({totalMembers})
        </Heading3>
      </header>

      <div className="border-t border-paper-2 pt-4 md:flex md:items-center md:justify-between">
        <TopRowInfo
          LIcon={UsersIcon}
          title="Total Members:"
          value={totalMembers}
        />

        {isOwner && (
          <TopRowInfo
            LIcon={HourglassIcon}
            title="Requests:"
            value={joinRequests ? pendingRequests.length : "..."}
          />
        )}
      </div>

      <div className="*:mb-2 *:last:mb-0">
        {contributions.map((contribution) => (
          <div
            key={contribution.member}
            className="bg-paper-1 py-3 px-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-center justify-start gap-2 flex-wrap">
              <Body bold>
                <DisplayName address={contribution.member} />
              </Body>
              {contribution.member.toLowerCase() ===
                goal.owner.toLowerCase() && (
                <Chip className="font-bold text-blue-1 bg-paper-main border-current text-xs">
                  Goal organizer
                </Chip>
              )}
            </div>
            <div className="flex items-center justify-between gap-4 md:justify-end">
              <Body>
                <span className="text-surface-grey">Contribution: </span>
                <span className="font-bold">
                  {formatBalance(+formatDepositAmount(contribution.amount), 2)}{" "}
                  {DEPOSIT_TOKEN.symbol}
                </span>
              </Body>
            </div>
          </div>
        ))}
      </div>

      {isOwner && pendingRequests.length > 0 && (
        <div>
          <Body bold className="mb-2 text-system-warning">
            Join requests
          </Body>
          <div className="*:mb-2 *:last:mb-0">
            {pendingRequests.map((request) => (
              <JoinRequestItem key={request.id} id={id} request={request} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default GoalMembers;
