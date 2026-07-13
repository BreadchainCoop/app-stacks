"use client";

import { useUserCircleData } from "@/hooks/use-user-circle-data";
import {
  Body,
  cn,
  formatBalance,
  Heading3,
  LoginButton,
  Logo,
  useConnectedUser,
} from "@breadcoop/ui";
import DaysLeft from "./days-left";
import {
  FAILED_STACK_STATUSES,
  getRoundStatus,
  getUserCircleStatus,
} from "@/lib/get-user-circle-status";
import { useCircleState } from "@/hooks/use-circles-state";
import { CircleState, RoundState } from "@/lib/circle-state";
import { Address } from "viem";
import { DEPOSIT_TOKEN, formatDepositAmount } from "@/lib/deposit-token";
import { useCircleStatus } from "@/hooks/use-circle-status";
import StartCircleButton from "@/components/start-circle-button";
import DepositButton from "@/components/deposit-button";
import { AutomaticDeposit } from "@/components/automatic-deposits/toggle";
import { useModal } from "@/components/modal/context";
import { useStackSupabase } from "@/hooks/use-stack-supabase";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { getDefaultChainId } from "@/utils/chain";
import { useReadContracts } from "wagmi";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { useFundsDeposited } from "@/hooks/use-funds-deposited";
import LocalButton from "@/components/button";
import { FeatureGate } from "@/components/feature-gate";

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
  const { circleState, roundState } = useCircleState(circle.circleId);
  const formattedCircleStatus = getUserCircleStatus({
    circle,
    config: { includeClaimable: true },
    now: nowSeconds,
    circleState: circleState ?? CircleState.Active,
  });
  const roundStatus = getRoundStatus(
    formattedCircleStatus,
    roundState ?? RoundState.NotStarted,
    circle.isCurrentWithdrawer
  );
  const depositCircleStatus = getUserCircleStatus({
    circle,
    config: { includeDeposited: true },
    now: nowSeconds,
    circleState: circleState ?? CircleState.Active,
  });
  const { data: stackMetadata, isLoading: isStackMetadataLoading } =
    useStackSupabase(circle.circleId.toString(), circle.isMember);

  const isFailedStack = FAILED_STACK_STATUSES.includes(
    formattedCircleStatus.status
  );

  const fundsDeposited = useFundsDeposited({
    circleId: circle.circleId.toString(),
    enabled: isFailedStack,
    totalRounds: +circle.totalRounds.toString(),
    circleStartsTimestamp: circle.circleInfo.effectiveCircleStartTime,
    depositInterval: circle.circleInfo.depositInterval,
  });

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
  const membersNeededToStart = Math.max(2 - acceptedMembers, 0);
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
  const expectedPendingMembers = Math.max(expectedMembers - acceptedMembers, 0);
  const pendingMembersToJoin = Math.max(
    pendingInvites,
    expectedPendingMembers,
    membersNeededToStart
  );
  const missingExpectedOrInvitedMembers = Math.max(
    pendingInvites,
    expectedPendingMembers
  );

  const invitesComplete = hasInviteMetadata
    ? hasEnoughMembersToStart && inviteStatusReady && pendingMembersToJoin === 0
    : hasEnoughMembersToStart;
  const canResolveMissingMembers = !isStackMetadataLoading && inviteStatusReady;
  const shouldWarnBeforeStart =
    hasInviteMetadata && missingExpectedOrInvitedMembers > 0;

  const totalMembers =
    formattedCircleStatus.status === "pending-start"
      ? expectedMembers || "-"
      : Number(circle.totalRounds);

  const remainingRounds = Math.max(
    0,
    Number(circle.totalRounds) - Number(circle.circleInfo.currentIndex)
  );

  let roundsCompleted = BigInt(0);
  let membersDeposited: bigint | number = BigInt(0);
  let poolBalance = BigInt(0);

  if (isFailedStack) {
    if (fundsDeposited.data) {
      roundsCompleted = BigInt(fundsDeposited.data.lastActiveRound ?? 0);
      membersDeposited = fundsDeposited.data.membersDepositedInCurrentRound;
      poolBalance = fundsDeposited.data.totalDepositInCurrentRound;
    }
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
            {isFailedStack ? (
              fundsDeposited.isLoading ? (
                "loading..."
              ) : fundsDeposited.isError ? (
                "error"
              ) : (
                <>
                  {fundsDeposited.data?.lastActiveRound || 0} out of{" "}
                  {totalMembers} rounds complete
                </>
              )
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
            {isFailedStack && fundsDeposited.isLoading ? (
              "loading..."
            ) : isFailedStack && fundsDeposited.isError ? (
              "error"
            ) : totalMembers === "-" ? (
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
            <>
              <Logo size={24} variant="square" className="mr-1" />
              <span className="font-bold mt-[0.2rem]">
                {formatBalance(+formatDepositAmount(poolBalance), 2)}{" "}
                {DEPOSIT_TOKEN.symbol}
              </span>
            </>
          </span>
        </Body>
        <Body className="flex flex-col justify-start md:justify-end md:items-end">
          <span className="text-surface-grey">Round Status</span>
          <span
            className={cn(
              "font-bold",
              roundStatus.status === "pending-start" && "text-primary-blue",
              ["payment_due", "in-progress"].includes(roundStatus.status) &&
                "text-system-warning",
              roundStatus.status === "failed" && "text-system-red",
              ["finished", "claimable", "deposit-completed"].includes(
                roundStatus.status
              ) && "text-system-green"
            )}
          >
            {roundStatus.label}
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
          !FAILED_STACK_STATUSES.includes(formattedCircleStatus.status)
        }
      />
      <div className="mt-4">
        <FeatureGate feature="automaticDeposit">
          <AutomaticDeposit
            stackId={circle.circleId.toString()}
            depositAmount={circle.circleInfo.depositAmount}
            remainingRounds={remainingRounds}
            depositInterval={circle.circleInfo.depositInterval}
            tokenAddress={circle.circleInfo.token}
            disabled={isFailedStack}
          />
        </FeatureGate>
        {formattedCircleStatus.status === "pending-start" ? (
          <>
            {member === circle.circleInfo.owner &&
            hasEnoughMembersToStart &&
            canResolveMissingMembers ? (
              <StartCircleButton
                circleId={BigInt(circle.circleId)}
                amount={circle.circleInfo.depositAmount}
                pendingMembers={
                  shouldWarnBeforeStart ? missingExpectedOrInvitedMembers : 0
                }
                className="w-full"
              />
            ) : member === circle.circleInfo.owner &&
              hasEnoughMembersToStart ? (
              <Body className="disable-like-btn text-paper-main">
                Checking members...
              </Body>
            ) : !invitesComplete && circle.isMember ? (
              <Body className="text-center text-surface-grey">
                {pendingMembersToJoin} invited{" "}
                {pendingMembersToJoin === 1 ? "member has" : "members have"} not
                joined yet.
              </Body>
            ) : (
              <Body className="disable-like-btn text-paper-main">
                Stack creator needs to start stack
              </Body>
            )}
          </>
        ) : depositCircleStatus.status === "payment_due" ? (
          <>
            {connectedUser.user.status === "CONNECTED" ? (
              <DepositButton
                className="font-bold w-full"
                label={`Deposit ${formatDepositAmount(
                  circle.circleInfo.depositAmount
                )} ${DEPOSIT_TOKEN.symbol}`}
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
              <LocalButton
                variant="burn"
                className="w-full"
                onClick={() =>
                  setModal({ type: "STACK_FAILED", id: circle.circleId })
                }
              >
                Stack Failed - Retire group & Claim your deposits
              </LocalButton>
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
