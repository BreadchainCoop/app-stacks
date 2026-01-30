import { AlertProps } from "@/components/alert";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { ICircleStatus } from "@/interfaces/circle";
import { HandDepositIcon, Icon } from "@phosphor-icons/react";
import { Address } from "viem";

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

export const getUserCircleStatus = (
	circle: Exclude<
		ReturnType<typeof useUserCircleData>["circleData"],
		undefined
	>,
	currentAccount: Address | undefined,
	config: GetUserCircleStatusConfig = {},
): IFormattedUserCircleStatusResult => {
	const isOwner = circle.isOwner;
	const isCurrentWithdrawer = circle.isCurrentWithdrawer;
	const canWithdraw = circle.canWithdraw;
	const now = BigInt(Math.floor(Date.now() / 1000));
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
	const totalRounds = circle.totalRounds;

	// ────────────────────────────────────────────────
	// Highest priority terminal / exceptional states
	// ────────────────────────────────────────────────

	if (circle.isDecommissioned) {
		return {
			status: "decommissioned",
			statusLabel: "Decommissioned",
			variant: "stop",
			title: "Circle has been decommissioned",
			desc: "The circle was cancelled and funds were returned to members.",
		};
	}

	if (circle.circleInfo.effectiveCircleStartTime === BigInt(0)) {
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

	// Finished: currentIndex (completedRounds) reset to 0 after full cycle, started, decommissionable, and no pool balance (balances cleared)
	if (
		completedRounds === BigInt(0) &&
		circle.circleInfo.effectiveCircleStartTime > BigInt(0) &&
		circle.isDecommissionable &&
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

	// Failed: decommissionable (past window with incomplete deposits), either non-zero index or pool balance >0 (funds locked)
	if (
		circle.isDecommissionable &&
		(completedRounds > BigInt(0) || circle.totalPoolBalance > BigInt(0))
	) {
		return {
			status: "failed",
			statusLabel: "Failed",
			variant: "stop",
			title: "Circle has failed",
			desc: "A user didn't deposit before the round ended. The circle can now be decommissioned to return funds.",
		};
	}

	// Expired but still actionable (e.g., final claim possible)
	if (circle.isExpired) {
		return {
			status: "expired",
			statusLabel: "Expired",
			variant: "warning",
			title: "Circle has expired",
			desc: "The overall circle duration has ended. Check if any actions are still possible or decommission if needed.",
		};
	}

	// ────────────────────────────────────────────────
	// Claim / Withdrawal phase
	// ────────────────────────────────────────────────

	// if (config.includeClaimable && canWithdraw) {
	if (
		config.includeClaimable &&
		circle.totalPoolBalance ===
			circle.circleInfo.depositAmount * circle.totalRounds
	) {
		if (isCurrentWithdrawer) {
			return {
				status: "claimable",
				statusLabel: "Claimable",
				variant: "success",
				title: "It's your turn to claim",
				desc: "All deposits for this round are complete. Withdraw the full pot now.",
			};
		} else {
			return {
				status: "deposit-completed",
				statusLabel: "Deposits Completed",
				variant: "success",
				title: "Round deposits complete",
				desc: "Waiting for the current withdrawer to claim this round's payout.",
			};
		}
	}

	// ────────────────────────────────────────────────
	// Deposit phase
	// ────────────────────────────────────────────────

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

	// ────────────────────────────────────────────────
	// Default active state
	// ────────────────────────────────────────────────

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
