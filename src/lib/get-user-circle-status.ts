import { AlertProps } from "@/components/alert";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { CircleState, RoundState } from "@/lib/circle-state";
import { ICircleStatus } from "@/interfaces/circle";
import { HandDepositIcon, Icon } from "@phosphor-icons/react";

// Circle-lifecycle statuses that aren't tied to a specific round. When a circle
// is in one of these, the round-level display defers to the circle status.
const LIFECYCLE_STATUSES: ICircleStatus[] = [
  "decommissioned",
  "pending-start",
  "failed",
  "finished",
  "expired",
];

// Terminal statuses where the circle can no longer be acted upon (e.g. no more
// deposits or claims are possible). Used to disable actions like automatic
// deposits/claims toggles.
export const FAILED_STACK_STATUSES: ICircleStatus[] = [
  "decommissioned",
  "expired",
  "failed",
  "finished",
];

/**
 * The status of the *current round*, for the "Round Status" display.
 *
 * This is round-centric on purpose and differs from `getUserCircleStatus`:
 * - It reads the contract's canonical `RoundState` (so it's correct in round 1,
 *   where `CircleState` never reports deposit sub-states), and uses
 *   `isCurrentWithdrawer` rather than `canWithdraw`. `canWithdraw` stays true for
 *   an unclaimed *past* round, which would wrongly keep showing "Claimable" after
 *   the round advances — `getUserCircleStatus`/`canWithdraw` still drive the
 *   actual claim affordances, but the round label must track the current round.
 * - For terminal lifecycle states (failed/finished/decommissioned/…) it defers
 *   to the already-computed circle status.
 */
export const getRoundStatus = (
  circleStatus: IFormattedUserCircleStatusResult,
  roundState: RoundState,
  isCurrentWithdrawer: boolean
): { status: ICircleStatus; label: string } => {
  if (LIFECYCLE_STATUSES.includes(circleStatus.status)) {
    return { status: circleStatus.status, label: circleStatus.statusLabel };
  }

  // All members have deposited for the current round.
  if (roundState === RoundState.Claimable) {
    return isCurrentWithdrawer
      ? { status: "claimable", label: "Claimable" }
      : { status: "deposit-completed", label: "Deposits Completed" };
  }

  // DepositInProgress / Claimed / NotStarted — the round is still running.
  return { status: "in-progress", label: "In Progress" };
};

export interface IFormattedUserCircleStatusResult {
  status: ICircleStatus;
  statusLabel: string;
  variant: AlertProps["variant"];
  title: string;
  desc: string;
  icon?: Icon;
}

interface GetUserCircleStatusConfig {
  includeDeposited?: boolean;
  includeClaimable?: boolean;
}

export interface GetUserCircleStatusParams {
  circle: Exclude<
    ReturnType<typeof useUserCircleData>["circleData"],
    undefined
  >;
  config?: GetUserCircleStatusConfig;
  // `now` must be chain time (block.timestamp), not Date.now(): all of the
  // circle's timing fields are measured against block.timestamp, and local dev
  // warps Anvil's clock. Pass it from `useBlockTimestamp`.
  now: bigint;
  // The contract's canonical lifecycle state (from the viewer's
  // `getCirclesState`, via `useCircleState`). The lifecycle branches below read
  // this instead of re-deriving it from raw fields. While it's still loading,
  // callers pass `CircleState.Active`, which falls through to the per-user
  // branches; the terminal `decommissioned`/`expired` cases stay driven by the
  // struct booleans so they remain correct during that window.
  circleState: CircleState;
}

export const getUserCircleStatus = ({
  circle,
  config = {},
  now,
  circleState,
}: GetUserCircleStatusParams): IFormattedUserCircleStatusResult => {
  const isOwner = circle.isOwner;
  const hasDepositedThisRound =
    circle.userBalance >= circle.circleInfo.depositAmount;
  const depositWindowOpen = circle.depositWindowEnd > now;
  const canDeposit =
    circle.isMember &&
    !circle.isExpired &&
    !circle.isDecommissioned &&
    depositWindowOpen &&
    !hasDepositedThisRound;

  if (circle.isDecommissioned) {
    return {
      status: "decommissioned",
      statusLabel: "Decommissioned",
      variant: "stop",
      title: "Circle has been decommissioned",
      desc: "The circle was cancelled and funds were returned to members.",
    };
  }

  if (circleState === CircleState.NotStarted) {
    // A cleanly completed circle also reports `NotStarted`: when the final
    // member claims, the contract sets `isActive = false`, and `circleState()`
    // has no terminal "completed" value, so a finished circle is neither
    // decommissioned nor active and falls through to `NotStarted`. Distinguish
    // the two via `effectiveCircleStartTime`, which is only non-zero once the
    // circle has actually been started — so `NotStarted` with a start time set
    // means "finished", not "pending start".
    if (circle.circleInfo.effectiveCircleStartTime > BigInt(0)) {
      return {
        status: "finished",
        statusLabel: "Finished",
        variant: "success",
        title: "Circle completed successfully",
        desc: "Everyone has deposited and withdrawn their funds. No more actions can be taken.",
      };
    }

    return {
      status: "pending-start",
      statusLabel: "Not started",
      variant: "warning",
      title: isOwner
        ? "Ready to start the circle"
        : "Waiting for owner to start",
      desc: isOwner
        ? "All invited members have joined. You can now start the circle."
        : "All members have accepted invites. Waiting for the owner to begin.",
    };
  }

  // "Failed" must key off `isDecommissionable`, not `CircleState.MissedDeposit`.
  // MissedDeposit is only returned while time-based `currentRound < members`;
  // once enough time elapses the contract returns `Expired` instead, but a
  // missed-deposit circle is still failed. `isDecommissionable` ("a prior round
  // ended with incomplete deposits") stays true across both, so it's the durable
  // signal. It must be checked before `finished` below.
  if (circle.isDecommissionable) {
    return {
      status: "failed",
      statusLabel: "Failed",
      variant: "stop",
      title: "Circle has failed",
      desc: "A user didn't deposit before the round ended. The circle can now be decommissioned to return funds.",
    };
  }

  // `CircleState.Expired` means every round slot has elapsed (it's derived purely
  // from `block.timestamp`, not from deposits), so it alone does NOT mean success
  // — a timed-out circle reaches it too. Failed circles are already handled above
  // via `isDecommissionable`, so here `Expired` implies no missed rounds; we then
  // require the pool to be fully drained (all payouts claimed) to call it
  // finished. An unclaimed Expired circle falls through to the claim branches.
  if (
    circleState === CircleState.Expired &&
    circle.totalPoolBalance === BigInt(0)
  ) {
    return {
      status: "finished",
      statusLabel: "Finished",
      variant: "success",
      title: "Circle completed successfully",
      desc: "Everyone has deposited and withdrawn their funds. No more actions can be taken.",
    };
  }

  // Wall-clock overlay: the circle's overall duration ended (block.timestamp >=
  // circleEnd) but it isn't a clean finish (e.g. a final payout is still
  // claimable). Distinct from a fully-claimed `Expired`, surfaced as `finished`
  // above.
  if (circle.isExpired) {
    return {
      status: "expired",
      statusLabel: "Expired",
      variant: "warning",
      title: "Circle has expired",
      desc: "The overall circle duration has ended. Check if any actions are still possible or decommission if needed.",
    };
  }

  if (config.includeClaimable && circle.canWithdraw) {
    return {
      status: "claimable",
      statusLabel: "Claimable",
      variant: "success",
      title: "It's your turn to claim",
      desc: "All deposits for your claim round are complete. Withdraw the full pot now.",
    };
  }

  if (config.includeClaimable && circleState === CircleState.DepositComplete) {
    return {
      status: "deposit-completed",
      statusLabel: "Deposits Completed",
      variant: "success",
      title: "Round deposits complete",
      desc: "Waiting for the eligible member to claim this round's payout.",
    };
  }

  if (config.includeDeposited && hasDepositedThisRound) {
    return {
      status: "deposited",
      statusLabel: "Deposited",
      variant: "success",
      title: "Your deposit is complete",
      desc: `Waiting for remaining members (${circle.remainingDepositsNeeded}) to deposit this round.`,
      icon: HandDepositIcon,
    };
  }

  if (canDeposit) {
    return {
      status: "payment_due",
      statusLabel: "Payment Due",
      variant: "warning",
      title: "Deposit required",
      desc: "Please make your deposit for the current round before the window closes.",
    };
  }

  return {
    status: "in-progress",
    statusLabel: "In Progress",
    variant: "success",
    title: "Circle is in progress",
    desc: isOwner
      ? "The circle is running. Monitor progress and remind members as needed."
      : "The circle is ongoing. You'll be notified when action is required.",
  };
};
