import { AlertProps } from "@/components/alert";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { ICircleRoundState, ICircleStatus } from "@/interfaces/circle";
import { HandDepositIcon, Icon } from "@phosphor-icons/react";
import { Address } from "viem";

export interface IFormattedUserCircleStatusResult {
  status: ICircleStatus;
  roundState: ICircleRoundState;
  roundStateLabel: string;
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

const roundStateLabels: Record<ICircleRoundState, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  "deposits-complete": "Deposits complete",
  finished: "Finished",
  failed: "Failed",
};

export const getUserCircleStatus = (
  circle: Exclude<
    ReturnType<typeof useUserCircleData>["circleData"],
    undefined
  >,
  currentAccount: Address | undefined,
  config: GetUserCircleStatusConfig = {},
  now = BigInt(Math.floor(Date.now() / 1000))
): IFormattedUserCircleStatusResult => {
  const isOwner = circle.isOwner;
  // const now = BigInt(Math.floor(Date.now() / 1000));
  const hasDepositedThisRound =
    circle.userBalance >= circle.circleInfo.depositAmount;
  const depositWindowOpen = circle.depositWindowEnd > now;
  const canDeposit =
    circle.isMember &&
    !circle.isExpired &&
    !circle.isDecommissioned &&
    depositWindowOpen &&
    !hasDepositedThisRound;
  const completedRounds = circle.completedRounds;
  const hasStarted = circle.circleInfo.effectiveCircleStartTime > BigInt(0);
  const isCompleted =
    hasStarted &&
    completedRounds >= circle.totalRounds &&
    circle.totalPoolBalance === BigInt(0);

  if (circle.isDecommissioned) {
    return {
      status: "decommissioned",
      roundState: "failed",
      roundStateLabel: roundStateLabels.failed,
      statusLabel: "Decommissioned",
      variant: "stop",
      title: "Circle has been decommissioned",
      desc: "The circle was cancelled and funds were returned to members.",
    };
  }

  if (!hasStarted) {
    return {
      status: "pending-start",
      roundState: "not-started",
      roundStateLabel: roundStateLabels["not-started"],
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

  if (circle.isDecommissionable) {
    return {
      status: "failed",
      roundState: "failed",
      roundStateLabel: roundStateLabels.failed,
      statusLabel: "Failed",
      variant: "stop",
      title: "Circle has failed",
      desc: "A user didn't deposit before the round ended. The circle can now be decommissioned to return funds.",
    };
  }

  if (isCompleted) {
    return {
      status: "finished",
      roundState: "finished",
      roundStateLabel: roundStateLabels.finished,
      statusLabel: "Finished",
      variant: "success",
      title: "Circle completed successfully",
      desc: "Everyone has deposited and withdrawn their funds. No more actions can be taken.",
    };
  }

  if (circle.isExpired) {
    return {
      status: "expired",
      roundState: "failed",
      roundStateLabel: roundStateLabels.failed,
      statusLabel: "Expired",
      variant: "warning",
      title: "Circle has expired",
      desc: "The overall circle duration has ended. Check if any actions are still possible or decommission if needed.",
    };
  }

  if (config.includeClaimable && circle.canWithdraw) {
    return {
      status: "claimable",
      roundState: "deposits-complete",
      roundStateLabel: roundStateLabels["deposits-complete"],
      statusLabel: "Claimable",
      variant: "success",
      title: "It's your turn to claim",
      desc: "All deposits for your claim round are complete. Withdraw the full pot now.",
    };
  }

  if (
    config.includeClaimable &&
    circle.totalPoolBalance ===
      circle.circleInfo.depositAmount * circle.totalRounds
  ) {
    return {
      status: "deposit-completed",
      roundState: "deposits-complete",
      roundStateLabel: roundStateLabels["deposits-complete"],
      statusLabel: "Deposits complete",
      variant: "success",
      title: "Round deposits complete",
      desc: "Waiting for the eligible member to claim this round's payout.",
    };
  }

  if (config.includeDeposited && hasDepositedThisRound) {
    return {
      status: "deposited",
      roundState: "in-progress",
      roundStateLabel: roundStateLabels["in-progress"],
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
      roundState: "in-progress",
      roundStateLabel: roundStateLabels["in-progress"],
      statusLabel: "Payment Due",
      variant: "warning",
      title: "Deposit required",
      desc: "Please make your deposit for the current round before the window closes.",
    };
  }

  return {
    status: "in-progress",
    roundState: "in-progress",
    roundStateLabel: roundStateLabels["in-progress"],
    statusLabel: "In Progress",
    variant: "success",
    title: "Circle is in progress",
    desc: isOwner
      ? "The circle is running. Monitor progress and remind members as needed."
      : "The circle is ongoing. You'll be notified when action is required.",
  };
};
