import { Address } from "viem";

export interface ICircle {
	circleEnd: bigint;
	currentIndex: bigint;
	depositAmount: bigint;
	depositInterval: bigint;
	effectiveCircleStartTime: bigint;
	id: bigint;
	totalMember: number;
	owner: Address;
	token: Address;
}
