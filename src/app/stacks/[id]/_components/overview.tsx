"use client";

import { useUserCircleData } from "@/hooks/use-user-circle-data";
import {
  Body,
  cn,
  formatBalance,
  Heading3,
  LiftedButton,
  LoginButton,
  Logo,
  useConnectedUser,
} from "@breadcoop/ui";
import DaysLeft from "./days-left";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";
import { Address, formatEther } from "viem";
import { useCircleStatus } from "@/hooks/use-circle-status";
import StartCircleButton from "@/components/start-circle-button";
import DepositButton from "@/components/deposit-button";
import { useModal } from "@/components/modal/context";
import { useStackSupabase } from "@/hooks/use-stack-supabase";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { getDefaultChainId } from "@/utils/chain";
import { useReadContracts } from "wagmi";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { ICircleStatus } from "@/interfaces/circle";

const failedStatuses: ICircleStatus[] = [
  "decommissioned",
  "expired",
  "failed",
  "finished",
];

const Overview = ({
  circle,
  member,
  status,
}: {
  member: Address;
  status: ReturnType<typeof useCircleStatus>;
  circle: Exclude<
    ReturnType<typeof useUserCircleData>["circleData"],
    undefined
  >;
}) => {
  const now = useBlockTimestamp();
  const { setModal } = useModal();
  const connectedUser = useConnectedUser();
  const nowSeconds = BigInt(Math.floor(now / 1000));
  const formattedCircleStatus = getUserCircleStatus(
    circle,
    member,
    { includeClaimable: true },
    nowSeconds
  );
  const depositCircleStatus = getUserCircleStatus(
    circle,
    member,
    { includeDeposited: true },
    nowSeconds
  );
  const { data: stackMetadata } = useStackSupabase(
    circle.circleId.toString(),
    circle.isMember
  );

  const nonceChecks = (stackMetadata?.invite_links ?? [])
    .map((link) => {
      try {
        const url = new URL(link.long);
        const nonceStr = url.searchParams.get("nonce");
        if (!nonceStr) return null;
        return BigInt(nonceStr);
      } catch {
        return null;
      }
    })
    .filter((n): n is bigint => n !== null);

  const contracts = nonceChecks.map((nonce) => ({
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    abi: savingCirclesAbi,
    functionName: "usedNonces" as const,
    args: [circle.circleId, nonce],
    chainId: getDefaultChainId(),
  }));

  const { data: nonceResults } = useReadContracts({
    contracts,
    query: {
      enabled: circle.isMember && contracts.length > 0,
    },
  });

  const expectedMembers = stackMetadata?.expected_members ?? 0;
  const acceptedMembers = Number(circle.totalRounds);
  const hasEnoughMembersToStart = acceptedMembers >= 2;
  const hasInviteMetadata = expectedMembers > 0 || nonceChecks.length > 0;
  const inviteStatusReady =
    nonceChecks.length === 0 || nonceResults?.length === nonceChecks.length;

  const pendingInvites = inviteStatusReady
    ? nonceChecks.filter((_, index) => {
        const result = nonceResults?.[index];
        if (result?.status !== "success") return true;
        return result.result === false;
      }).length
    : nonceChecks.length;

  const invitesComplete = hasInviteMetadata
    ? hasEnoughMembersToStart && inviteStatusReady && pendingInvites === 0
    : hasEnoughMembersToStart;

  const totalMembers =
    formattedCircleStatus.status === "pending-start"
      ? expectedMembers || "-"
      : Number(circle.totalRounds);

  let roundsCompleted = BigInt(0);
  let membersDeposited: bigint | number = BigInt(0);
  let poolBalance = BigInt(0);

  if (formattedCircleStatus.status === "finished") {
    roundsCompleted = circle.totalRounds;
    membersDeposited = totalMembers as number;
    poolBalance = BigInt(totalMembers) * circle.circleInfo.depositAmount;
  } else {
    roundsCompleted = circle.completedRounds;
    membersDeposited =
      circle.totalPoolBalance /
      BigInt(Math.max(1, +circle.circleInfo.depositAmount.toString()));
    poolBalance = circle.totalPoolBalance;
  }

  return (
    <section className="bg-paper-0 p-5 mb-4 *:mb-4 md:mb-0 md:order-1 md:flex-2 md:max-w-159.75">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <Heading3 className="text-2xl shrink-0">Deposit overview</Heading3>
        <Body bold className="text-xs shrink-0">
          <span className="font-normal">Stack status: </span>
          <span>
            {failedStatuses.includes(formattedCircleStatus.status) ? (
              <>{formattedCircleStatus.status}</>
            ) : totalMembers === "-" ? (
              "-"
            ) : (
              <>
                {roundsCompleted} out of {totalMembers} rounds complete
              </>
            )}
          </span>
        </Body>
      </header>
      <div className="flex flex-col gap-4 border-b border-paper-2 pb-4 md:flex-row md:justify-between">
        <Body className="flex flex-col justify-start md:items-start">
          <span className="text-surface-grey">Deposits made by</span>
          <span>
            {totalMembers === "-" ||
            failedStatuses.includes(formattedCircleStatus.status) ? (
              "-"
            ) : (
              <>
                <span className="font-bold">{membersDeposited}</span> out of{" "}
                <span className="font-bold">{totalMembers}</span> members
              </>
            )}
          </span>
        </Body>
        <Body className="flex flex-col justify-start md:items-center md:justify-center">
          <span className="text-surface-grey">Total Deposit</span>
          <span className="inline-flex items-center justify-start">
            {failedStatuses.includes(formattedCircleStatus.status) ? (
              "-"
            ) : (
              <>
                <Logo size={24} variant="square" className="mr-1" />
                <span className="font-bold mt-[0.2rem]">
                  {formatBalance(+formatEther(poolBalance), 2)} of{" "}
                  {formatBalance(
                    +formatEther(circle.circleInfo.depositAmount) *
                      (typeof totalMembers === "string" ? 0 : totalMembers),
                    2
                  )}{" "}
                  BREAD
                </span>
              </>
            )}
          </span>
        </Body>
        <Body className="flex flex-col justify-start md:justify-end md:items-end">
          <span className="text-surface-grey">Round Status</span>
          <span
            className={cn(
              "font-bold",
              formattedCircleStatus.status === "pending-start" &&
                "text-primary-blue",
              ["payment_due", "in-progress"].includes(
                formattedCircleStatus.status
              ) && "text-system-warning",
              formattedCircleStatus.status === "failed" && "text-system-red",
              ["finished", "claimable", "deposit-completed"].includes(
                formattedCircleStatus.status
              ) && "text-system-green"
            )}
          >
            {formattedCircleStatus.status === "payment_due"
              ? "In Progress"
              : formattedCircleStatus.statusLabel}
          </span>
        </Body>
      </div>
      <DaysLeft
        key={circle.depositWindowEnd}
        depositWindowEnd={circle.depositWindowEnd}
        effectiveCircleStartTime={circle.circleInfo.effectiveCircleStartTime}
        currentIndex={circle.circleInfo.currentIndex}
        depositInterval={circle.circleInfo.depositInterval}
        isActive={
          status.isActive &&
          !failedStatuses.includes(formattedCircleStatus.status)
        }
      />
      <div className="mt-4">
        {formattedCircleStatus.status === "pending-start" ? (
          <>
            {!invitesComplete && circle.isMember ? (
              <Body className="text-center text-surface-grey">
                Waiting for{" "}
                <span className="font-bold text-surface-ink">
                  {pendingInvites}
                </span>{" "}
                {pendingInvites === 1 ? "invite" : "invites"} to be accepted
                before the stack can start.
              </Body>
            ) : member === circle.circleInfo.owner ? (
              <StartCircleButton
                circleId={BigInt(circle.circleId)}
                amount={circle.circleInfo.depositAmount}
                width="full"
              />
            ) : (
              <LiftedButton width="full" className="text-paper-main" disabled>
                Stack creator needs to start stack
              </LiftedButton>
            )}
          </>
        ) : depositCircleStatus.status === "payment_due" ? (
          <>
            {connectedUser.user.status === "CONNECTED" ? (
              <DepositButton
                className="font-bold"
                width="full"
                label={`Deposit ${formatEther(
                  circle.circleInfo.depositAmount
                )} BREAD`}
                amount={circle.circleInfo.depositAmount}
                tokenAddress={circle.circleInfo.token}
                circleId={circle.circleId}
              />
            ) : (
              <LoginButton app="stacks" status={connectedUser.user.status} />
            )}
          </>
        ) : formattedCircleStatus.status === "deposit-completed" ? (
          <Body
            bold
            className="py-4 px-8 text-paper-main bg-surface-grey text-center opacity-50"
          >
            Awaiting current withdrawer to claim
          </Body>
        ) : formattedCircleStatus.status === "failed" &&
          circle.isDecommissionable &&
          !circle.isDecommissioned &&
          circle.isMember ? (
          <>
            {connectedUser.user.status === "CONNECTED" ? (
              <LiftedButton
                preset="secondary"
                width="full"
                className="bg-red-0 text-system-red"
                onClick={() =>
                  setModal({ type: "STACK_FAILED", id: circle.circleId })
                }
              >
                Stack Failed - Retire group & Claim your deposits
              </LiftedButton>
            ) : (
              <LoginButton app="stacks" status={connectedUser.user.status} />
            )}
          </>
        ) : null}
      </div>
    </section>
  );
};

export default Overview;
