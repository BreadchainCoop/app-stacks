import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { Address } from "viem";

export type ICircleStatus =
  | "decommissioned"
  | "pending-start"
  | "finished"
  | "failed"
  | "expired"
  | "claimable"
  | "deposit-completed"
  | "deposited"
  | "payment_due"
  | "in-progress";

export type ICircleRoundState =
  | "not-started"
  | "in-progress"
  | "deposits-complete"
  | "finished"
  | "failed";

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
  totalPoolBalance?: bigint;
  roundState?: ICircleRoundState;
  isMember?: boolean;
  isDecommissionable?: boolean;
  userBalance?: bigint;
}

type ICircleWithdraw = {
  canWithdraw?: true;
  withdrawAmount: number;
};

type ICircleNoWithdraw = {
  canWithdraw?: false;
  withdrawAmount?: never;
};

export type ICircleList = ICircleBaseList &
  (ICircleWithdraw | ICircleNoWithdraw) & {
    status?: ICircleStatus;
  };

export interface LocalStorageCircle {
  name: string;
  invite_links?: string[];
  totalMembers: number;
}

export type LocalStorageCircles = Record<string, LocalStorageCircle>;

type CircleInfo = Exclude<
  ReturnType<typeof useUserCircleData>["circleData"],
  undefined
>;

export type MemberCircleInfo = Pick<CircleInfo, "circleInfo">["circleInfo"];

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
