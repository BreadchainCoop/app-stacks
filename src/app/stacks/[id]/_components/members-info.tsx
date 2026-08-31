"use client";

import {
  Accordion,
  AccordionHeader,
  AccordionContent,
  AccordionItem,
} from "@/components/accordion";
import { DisplayName } from "@/components/display-name";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { useCircleMembersWithBalances } from "@/hooks/use-circle-members";
import { useGetCircleCreated } from "@/hooks/use-get-cricle-created";
import { useGetLastDeposit } from "@/hooks/use-get-last-deposit";
import { useInviteRedeemed } from "@/hooks/use-invite-redeemed";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { useFundsDeposited } from "@/hooks/use-funds-deposited";
import { JoinRequest } from "@/hooks/use-join-requests";
import { useMemberAlias } from "@/hooks/use-member-aliases";
import { useSavingCirclesTx } from "@/hooks/use-saving-circles-tx";
import { ICircleStatus } from "@/interfaces/circle";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";
import { useCircleState } from "@/hooks/use-circles-state";
import { CircleState } from "@/lib/circle-state";
import { useMembersClaimed } from "@/hooks/use-members-claimed";
import { parseContractError } from "@/utils/parse-contract-error";
import { formatRelativeTime, formatShortDate } from "@/utils/time";
import { formatAmount } from "@/utils/format-amount";
import { Body, Chip } from "@breadcoop/ui";
import { CheckIcon, XCircleIcon } from "@phosphor-icons/react/ssr";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Address, formatEther } from "viem";
import { ModalState, useModal } from "@/components/modal/context";

const FAILED_STATUSES: ICircleStatus[] = [
  "decommissioned",
  "expired",
  "failed",
  "finished",
];

const INCOMPLETE_ROUND_STATUSES: ICircleStatus[] = [
  "decommissioned",
  "expired",
  "failed",
];

function DepositRow({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex items-center justify-between mb-2.5 last:mb-0">
      <Body>{label}</Body>
      <Body bold>{body}</Body>
    </div>
  );
}

const MembersInfo = ({
  owner,
  info,
  id,
  totalBaseDeposit,
  depositAmount,
  pendingJoinRequests,
  totalRounds,
  circleStartsTimestamp,
  depositInterval,
  circleStatus,
  isOwner: isCurrentUserOwner,
}: {
  owner: Address;
  id: string;
  info: ReturnType<typeof useCircleMembersWithBalances>;
  totalBaseDeposit: number;
  depositAmount: bigint;
  pendingJoinRequests?: JoinRequest[];
  totalRounds: number;
  circleStartsTimestamp: bigint;
  depositInterval: bigint;
  circleStatus: ICircleStatus | null;
  isOwner: boolean;
}) => {
  const now = useBlockTimestamp();
  const { setModal } = useModal();
  const { claimedByMember } = useMembersClaimed({
    circleId: id,
    members: info.members,
  });
  const { circleState } = useCircleState(BigInt(id));

  const isFinished = circleStatus === "finished";
  const showLastActiveRoundDeposits = circleStatus
    ? INCOMPLETE_ROUND_STATUSES.includes(circleStatus)
    : false;

  // For a decommissioned/expired/failed circle, deposit status comes from the
  // last round that was actually attempted (via event logs) rather than the
  // live contract round, which is unusable here — see `INCOMPLETE_ROUND_STATUSES`.
  const fundsDeposited = useFundsDeposited({
    circleId: id,
    enabled: showLastActiveRoundDeposits,
    totalRounds,
    circleStartsTimestamp,
    depositInterval,
  });
  const lastAttemptedRound = Math.min(
    (fundsDeposited.data?.lastActiveRound ?? 0) + 1,
    totalRounds
  );

  const hasStarted =
    circleStartsTimestamp !== BigInt(0) &&
    BigInt(Math.floor(now / 1000)) >= circleStartsTimestamp;
  const showDepositChips =
    isFinished ||
    showLastActiveRoundDeposits ||
    (hasStarted &&
      Boolean(info.memberBalances) &&
      circleState !== CircleState.Expired);

  const [selectedRequestIds, setSelectedRequestIds] = useState<Set<string>>(
    new Set()
  );

  const toggleRequestSelected = (requestId: string) => {
    setSelectedRequestIds((prev) => {
      const next = new Set(prev);
      if (next.has(requestId)) {
        next.delete(requestId);
      } else {
        next.add(requestId);
      }
      return next;
    });
  };

  return (
    <div>
      {pendingJoinRequests && pendingJoinRequests.length > 1 && (
        <JoinRequestsBulkBar
          id={id}
          requests={pendingJoinRequests}
          selectedRequestIds={selectedRequestIds}
          onSelectedRequestIdsChange={setSelectedRequestIds}
        />
      )}
      <Accordion>
        {info.members.map((member, index) => {
          const totalDeposits = +formatEther(
            info.memberBalances?.balances[index] || BigInt(0)
          );

          const hasDeposited = isFinished
            ? true
            : showLastActiveRoundDeposits
              ? (fundsDeposited.data?.depositsByMember[
                  member.toLowerCase() as Address
                ]?.length ?? 0) >= lastAttemptedRound
              : (info.memberBalances?.balances[index] ?? BigInt(0)) >=
                depositAmount;

          const canRemove =
            isCurrentUserOwner &&
            member.toLowerCase() !== owner.toLowerCase() &&
            circleStatus === "pending-start";

          return (
            <MemberRow
              key={member}
              member={member}
              owner={owner}
              id={id}
              hasDeposited={hasDeposited}
              showDepositChips={showDepositChips}
              claimed={Boolean(claimedByMember[member.toLowerCase()])}
              canRemove={canRemove}
              setModal={setModal}
              totalDeposits={totalDeposits}
              totalBaseDeposit={totalBaseDeposit}
              totalRounds={totalRounds}
              circleStartsTimestamp={circleStartsTimestamp}
              depositInterval={depositInterval}
            />
          );
        })}
        {pendingJoinRequests?.map((request) => (
          <JoinRequestItem
            key={request.id}
            id={id}
            request={request}
            selectable={pendingJoinRequests.length > 1}
            selected={selectedRequestIds.has(request.id)}
            onToggleSelected={() => toggleRequestSelected(request.id)}
          />
        ))}
      </Accordion>
    </div>
  );
};

function MemberRow({
  member,
  owner,
  id,
  hasDeposited,
  showDepositChips,
  claimed,
  canRemove,
  setModal,
  totalDeposits,
  totalBaseDeposit,
  totalRounds,
  circleStartsTimestamp,
  depositInterval,
}: {
  member: Address;
  owner: Address;
  id: string;
  hasDeposited: boolean;
  showDepositChips: boolean;
  claimed: boolean;
  canRemove: boolean;
  setModal: (modalState: ModalState) => void;
  totalDeposits: number;
  totalBaseDeposit: number;
  totalRounds: number;
  circleStartsTimestamp: bigint;
  depositInterval: bigint;
}) {
  const { alias } = useMemberAlias(member);
  const memberDisplayName =
    alias || `${member.slice(0, 6)}...${member.slice(-4)}`;

  return (
    <AccordionItem value={member}>
      <AccordionHeader>
        <div className="flex w-full flex-col items-start gap-1 md:flex-row md:items-center md:justify-between md:gap-x-4 md:gap-y-1">
          <Body bold>
            <DisplayName address={member} />
          </Body>
          {/* Chips stack under the name on mobile (they'd otherwise
              overflow the row and clip). From md up they sit
              right-aligned; the shared AccordionTrigger adds gap-2.5
              (10px) before the chevron, so md:mr-1.5 (6px) brings the
              group to 16px from the arrow. */}
          <div className="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-end md:mr-1.5">
            {member === owner && (
              <Chip className="font-bold text-blue-1 bg-paper-main border-current text-xs">
                Group owner
              </Chip>
            )}
            {showDepositChips &&
              (hasDeposited ? (
                <Chip className="font-bold border-current! text-system-green text-xs">
                  Deposited
                </Chip>
              ) : (
                <Chip className="font-bold border-current! text-system-warning text-xs">
                  Not deposited
                </Chip>
              ))}
            {claimed && (
              <Chip className="font-bold border-system-green! bg-system-green! text-paper-main text-xs">
                Claimed
              </Chip>
            )}
            {canRemove && (
              <button
                className="flex items-center gap-1 text-system-warning hover:text-system-red text-xs font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  setModal({
                    type: "REMOVE_MEMBER_WARNING",
                    memberAddress: member,
                    memberName: memberDisplayName,
                    circleId: BigInt(id),
                  });
                }}
              >
                <XCircleIcon size={16} />
                Remove
              </button>
            )}
          </div>
        </div>
      </AccordionHeader>
      <AccordionContent>
        <MemberInfoContent
          totalDeposits={String(totalDeposits + totalBaseDeposit)}
          member={member}
          circleId={id}
          isOWner={member.toLowerCase() === owner.toLowerCase()}
          totalRounds={totalRounds}
          circleStartsTimestamp={circleStartsTimestamp}
          depositInterval={depositInterval}
        />
      </AccordionContent>
    </AccordionItem>
  );
}

function JoinRequestsBulkBar({
  id,
  requests,
  selectedRequestIds,
  onSelectedRequestIdsChange,
}: {
  id: string;
  requests: JoinRequest[];
  selectedRequestIds: Set<string>;
  onSelectedRequestIdsChange: (ids: Set<string>) => void;
}) {
  const { sendSavingCirclesTx } = useSavingCirclesTx();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allSelected =
    requests.length > 0 && selectedRequestIds.size === requests.length;

  const toggleSelectAll = () => {
    onSelectedRequestIdsChange(
      allSelected ? new Set() : new Set(requests.map((r) => r.id))
    );
  };

  const acceptSelected = async () => {
    const selected = requests.filter((r) => selectedRequestIds.has(r.id));
    if (selected.length === 0) return;

    setBusy(true);
    setError(null);

    try {
      await sendSavingCirclesTx({
        functionName: "addMembers",
        args: [BigInt(id), selected.map((r) => r.wallet_address as Address)],
      });

      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });

      const results = await Promise.all(
        selected.map((r) =>
          fetch("/api/stacks/join-request", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestId: r.id, status: "added" }),
          }).then((res) => res.json())
        )
      );

      if (results.some((body) => !body.success)) {
        setError(
          "Members were added, but some requests failed to update — refresh to check."
        );
      }

      queryClient.invalidateQueries({ queryKey: ["join-requests", id] });
      onSelectedRequestIdsChange(new Set());
    } catch (err) {
      setError(parseContractError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 mb-2 p-3 bg-paper-1 border border-surface-ink">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="flex items-center gap-2 text-sm font-bold">
          <input
            type="checkbox"
            className="accent-primary-blue"
            checked={allSelected}
            onChange={toggleSelectAll}
          />
          Select all ({requests.length})
        </label>
        <button
          className="flex items-center gap-1 text-system-green text-xs font-bold disabled:opacity-50"
          disabled={busy || selectedRequestIds.size === 0}
          onClick={acceptSelected}
        >
          <CheckIcon size={16} />
          {busy ? "Adding..." : `Accept selected (${selectedRequestIds.size})`}
        </button>
      </div>
      {error && <Body className="text-system-red text-xs">{error}</Body>}
    </div>
  );
}

function JoinRequestItem({
  id,
  request,
  selectable,
  selected,
  onToggleSelected,
}: {
  id: string;
  request: JoinRequest;
  selectable: boolean;
  selected: boolean;
  onToggleSelected: () => void;
}) {
  const { sendSavingCirclesTx } = useSavingCirclesTx();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<"accepting" | "dismissing" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decide = async (status: "added" | "dismissed") => {
    const res = await fetch("/api/stacks/join-request", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: request.id, status }),
    });
    const body = await res.json();

    if (!res.ok || !body.success) {
      throw new Error(body.error ?? "Failed to update join request");
    }

    queryClient.invalidateQueries({ queryKey: ["join-requests", id] });
  };

  const accept = async () => {
    setBusy("accepting");
    setError(null);

    try {
      await sendSavingCirclesTx({
        functionName: "addMembers",
        args: [BigInt(id), [request.wallet_address as Address]],
      });

      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });

      await decide("added");
    } catch (err) {
      setError(parseContractError(err));
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
    <AccordionItem value={request.id}>
      <AccordionHeader>
        <div className="flex items-center justify-start gap-x-4 gap-y-1 flex-wrap flex-1">
          {selectable && (
            <input
              type="checkbox"
              className="accent-primary-blue"
              checked={selected}
              onClick={(e) => e.stopPropagation()}
              onChange={onToggleSelected}
            />
          )}
          <Body bold>
            <DisplayName address={request.wallet_address as Address} />
          </Body>
          <Chip className="font-bold border-current! text-system-warning text-xs">
            Requested to join
          </Chip>
          <div className="ml-auto flex items-center gap-3">
            <button
              className="flex items-center gap-1 text-system-green hover:text-system-green text-xs font-bold disabled:opacity-50"
              disabled={busy !== null}
              onClick={(e) => {
                e.stopPropagation();
                accept();
              }}
            >
              <CheckIcon size={16} />
              {busy === "accepting" ? "Adding..." : "Accept"}
            </button>
            <button
              className="flex items-center gap-1 text-system-warning hover:text-system-red text-xs font-bold disabled:opacity-50"
              disabled={busy !== null}
              onClick={(e) => {
                e.stopPropagation();
                dismiss();
              }}
            >
              <XCircleIcon size={16} />
              {busy === "dismissing" ? "Dismissing..." : "Dismiss"}
            </button>
          </div>
        </div>
      </AccordionHeader>
      <AccordionContent>
        {error ? (
          <Body className="text-system-red text-xs">{error}</Body>
        ) : (
          <Body className="text-surface-grey text-xs">
            Requested {formatShortDate(new Date(request.created_at))}
          </Body>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function MemberInfoContent({
  totalDeposits,
  member,
  isOWner,
  circleId,
  totalRounds,
  circleStartsTimestamp,
  depositInterval,
}: {
  totalDeposits: string;
  member: Address;
  isOWner: boolean;
  circleId: string;
  totalRounds: number;
  circleStartsTimestamp: bigint;
  depositInterval: bigint;
}) {
  const now = useBlockTimestamp();
  const { data: creationTimestamp } = useGetCircleCreated({
    circleId,
    enabled: isOWner,
  });
  const { data: redeemedTimestamp } = useInviteRedeemed({
    circleId,
    member,
    enabled: !isOWner,
  });
  const circleData = useUserCircleData({
    circleId: BigInt(circleId),
    member,
  });
  const { lastDepositTime } = useGetLastDeposit({
    circleId,
    enabled: true,
    member,
  });

  const nowSeconds = BigInt(Math.floor(now / 1000));
  const { circleState } = useCircleState(BigInt(circleId));
  const formattedStatus = circleData.circleData
    ? getUserCircleStatus({
        circle: circleData.circleData,
        now: nowSeconds,
        circleState: circleState ?? CircleState.Active,
      })
    : null;
  const isFailedStack = formattedStatus
    ? FAILED_STATUSES.includes(formattedStatus.status)
    : false;

  const fundsDeposited = useFundsDeposited({
    circleId,
    enabled: isFailedStack,
    totalRounds,
    circleStartsTimestamp,
    depositInterval,
  });

  let memberTotal = "-";

  if (isFailedStack) {
    if (fundsDeposited.data) {
      memberTotal = formatAmount(
        +formatEther(
          (
            fundsDeposited.data.depositsByMember[
              member.toLowerCase() as Address
            ] ?? []
          ).reduce((sum, d) => sum + d.amount, BigInt(0))
        ),
        2
      );
    }
  } else {
    memberTotal = totalDeposits;
  }

  const joinedTimestamp = creationTimestamp || redeemedTimestamp;

  let daysNextDeposit: number | undefined;

  if (circleData.circleData) {
    daysNextDeposit =
      circleData.circleData.circleInfo.effectiveCircleStartTime === BigInt(0)
        ? undefined
        : Math.ceil(
            (Number(circleData.circleData.depositWindowEnd) - now / 1000) /
              86_400
          );
  }

  if (daysNextDeposit !== undefined) {
    daysNextDeposit = Math.max(0, daysNextDeposit);
  }

  return (
    <div>
      <DepositRow
        label="Next deposit"
        body={
          daysNextDeposit
            ? `${daysNextDeposit} ${daysNextDeposit === 1 ? "day" : "days"}`
            : "-"
        }
      />
      <DepositRow
        label="Last deposit"
        body={`${
          lastDepositTime
            ? formatRelativeTime(lastDepositTime, new Date(now))
            : "-"
        }`}
      />
      {/* <DepositRow label="Total deposits" body={`${memberTotal} BREAD`} /> */}
      <DepositRow
        label="Total deposits"
        body={
          isFailedStack && fundsDeposited.isLoading
            ? "Loading"
            : isFailedStack && fundsDeposited.error
              ? "Error"
              : `$${memberTotal}`
        }
      />
      <DepositRow
        label="Joined"
        body={joinedTimestamp ? formatShortDate(joinedTimestamp) : "-"}
      />
    </div>
  );
}

export default MembersInfo;
