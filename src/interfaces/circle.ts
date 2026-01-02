import { Address } from "viem";

export type ICircleStatus =
	| "member"
	| "payment_due"
	| "claimable"
	| "expired"
	| "decommissioned"
	| "completed";

interface ICircleBaseList {
	circleEnd: bigint;
	currentIndex: bigint;
	depositAmount: bigint;
	depositInterval: bigint;
	effectiveCircleStartTime: bigint;
	id: bigint;
	totalMember: number;
	owner: Address;
	token: Address;
	totalPoolBalance?: bigint
}

type ICircleWithdraw = {
	canWithdraw?: true;
	withdrawAmount: number;
}

type ICircleNoWithdraw = {
	canWithdraw?: false;
	withdrawAmount?: never;
}

export type ICircleList = ICircleBaseList & (ICircleWithdraw | ICircleNoWithdraw) & {
	status?: ICircleStatus;
}

// export interface CircleFullInfo {
// 	id: bigint;
// 	owner: `0x${string}`;
// 	depositAmount: bigint;
// 	token: `0x${string}`;
// 	depositInterval: bigint; // in seconds
// 	effectiveCircleStartTime: bigint;
// 	circleEnd: bigint;
// 	currentIndex: bigint;

// 	// Derived / calculated
// 	memberCount: number;
// 	totalRounds: bigint; // usually = memberCount
// 	completedRounds: bigint;
// 	totalPoolBalance: bigint;
// 	isActive: boolean;
// 	isExpired: boolean;
// 	isDecommissioned: boolean;
// 	isDecommissionable: boolean;

// 	// User-specific (requires connected address)
// 	userBalance?: bigint;
// 	isMember?: boolean;
// 	isOwner?: boolean;
// 	isCurrentWithdrawer?: boolean;
// 	canWithdraw?: boolean;
// 	nextWithdrawTime?: bigint;
// 	depositWindowEnd?: bigint;
// 	remainingDepositsNeeded?: bigint;
// };
