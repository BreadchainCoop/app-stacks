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

interface GetuserCircleStatusConfig {
	includeDeposited?: boolean;
	includeClaimable?: boolean;
}

export const getuserCircleStatus = (
	circle: Exclude<
		ReturnType<typeof useUserCircleData>["circleData"],
		undefined
	>,
	currentAccount: Address | undefined,
	config?: GetuserCircleStatusConfig
): IFormattedUserCircleStatusResult => {
	if (circle.isDecommissioned) {
		return {
			status: "decommissioned",
			statusLabel: "Decommissioned",
			variant: "stop",
			title: "Ask for decommissioned title",
			desc: "Ask for decommissioned description",
		};
	}

	// TODO: Change this logic when there is a way to know the total members and number that have accepted invites
	if (!circle.circleInfo.effectiveCircleStartTime) {
		return {
			status: "start",
			statusLabel: "Start",
			variant: "success",
			title: "Ready to start stacking",
			desc: `All members have accepted their invite. ${
				currentAccount === circle.circleInfo.owner ? "You" : "Owner"
			} can now start the Stacks group.`,
		};
	}

	if (circle.isExpired) {
		return {
			status: "expired",
			statusLabel: "Expired",
			variant: "warning",
			title: "Ask for expired title",
			desc: "Ask for expired description",
		};
	}

	const totalRounds = circle.totalRounds;

	if (circle.completedRounds >= totalRounds && totalRounds > BigInt(0)) {
		return {
			status: "completed",
			statusLabel: "Completed",
			variant: "success",
			title: "Rounds completed",
			desc: "This Stacks is retired. No more claims or deposits can be made.",
		};
	}

	if (
		config?.includeClaimable &&
		circle.canWithdraw &&
		circle.isCurrentWithdrawer
	) {
		return {
			status: "claimable",
			statusLabel: "Claimable",
			variant: "success",
			title: "Ask for claimable title",
			desc: "Ask for claimable description",
		};
	}

	const now = BigInt(Math.floor(Date.now() / 1000));
	const isDepositWindowOpen = circle.depositWindowEnd > now;

	const hasDepositedCurrentRound = circle.userBalance >= circle.circleInfo.depositAmount;

	if (config?.includeDeposited && hasDepositedCurrentRound) {
		return {
			status: "deposited",
			statusLabel: "Deposited",
			variant: "success",
			title: "Total deposits made",
			desc: `${Number(
				circle.userBalance / circle.circleInfo.depositAmount
			)} of ${Number(totalRounds)}.`,
			icon: HandDepositIcon,
		};
	}

	const canDeposit =
		circle.isMember &&
		!circle.isExpired &&
		!circle.isDecommissioned &&
		isDepositWindowOpen &&
		!hasDepositedCurrentRound;

	if (canDeposit) {
		return {
			status: "payment_due",
			statusLabel: "Payment due",
			variant: "success",
			title: "Proceed to deposit",
			desc: "All members have accepted their invite. You can now deposit your sum.",
		};
	}

	return {
		status: "member",
		statusLabel: "Member",
		variant: "success",
		title: "Ask for member title",
		desc: "Ask for member description",
	};
};
