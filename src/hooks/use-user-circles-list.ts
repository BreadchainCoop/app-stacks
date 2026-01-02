import { useAccount, useReadContract } from "wagmi";
import { SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS } from "@/lib/constants";
import { savingCirclesViewerAbi } from "@/lib/abis/saving-circles-viewers";
import { Address } from "viem";
import { ICircleList, ICircleStatus } from "@/interfaces/circle";
import { useMemo } from "react";

export function useUserCirclesList(address: Address) {
	const { data, isLoading, error } = useReadContract({
		address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
		abi: savingCirclesViewerAbi,
		functionName: "getComprehensiveUserData",
		args: address ? [address] : undefined,
	});

	console.log("__ DATA __", data);

	const circles = useMemo(() => {
		if (!data) return [];

		const parsedCircle: ICircleList[] = data.circleData.map((c) => {
      const totalRounds = c.totalRounds;

			const now = BigInt(Math.floor(Date.now() / 1000));
			const isDepositWindowOpen = c.depositWindowEnd > now;
			const hasDepositedCurrentRound =
				c.userBalance >=
				c.circleInfo.depositAmount * (c.completedRounds + BigInt(1));

			const canDeposit =
				c.isMember &&
				!c.isExpired &&
				!c.isDecommissioned &&
				isDepositWindowOpen &&
				!hasDepositedCurrentRound;

      let status: ICircleStatus;
      let statusLabel: string;

      if (c.isDecommissioned) {
        status = 'decommissioned';
        statusLabel = 'Decommissioned';
      } else if (c.isExpired) {
        status = 'expired';
        statusLabel = 'Expired';
      } else if (c.completedRounds >= totalRounds && totalRounds > BigInt(0)) {
        status = 'completed';
        statusLabel = 'Completed';
      } else if (c.canWithdraw && c.isCurrentWithdrawer) {
        status = 'claimable';
        statusLabel = 'Claimable';
      } else if (canDeposit) {
        status = 'payment_due';
        statusLabel = 'Payment due';
      } else {
        status = 'member';
        statusLabel = 'Member';
      }


			return {
				...c.circleInfo,
				totalMember: Number(totalRounds),
				id: c.circleId,
        status,
				totalPoolBalance: c.totalPoolBalance,
				// canWithdraw,
				// ...(canWithdraw ? {withdrawAmount: 2} : undefined)
			};
		});

		return parsedCircle;
	}, [data]);

	return { circles, isLoading, error };
}
