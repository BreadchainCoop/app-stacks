"use client";

import { useCircleStatus } from "@/hooks/use-circle-status";
import DepositStatus from "./deposit-status";
import TotalStacked from "./total-stacked";
import { useCircleInfo } from "@/hooks/use-circle-info";
import { useUserCircleData } from "@/hooks/use-user-circle-data";

const StackedStatus = ({
	id,
	circle,
}: {
	id: string;
	circle: ReturnType<typeof useCircleInfo>["circle"];
}) => {
	const status = useCircleStatus(BigInt(id));
	const userCircleData = useUserCircleData({circleId: BigInt(id)});

	return (
		<div className="md:flex md:justify-between md:gap-6">
			<TotalStacked
				id={id}
				status={status}
				userCircleData={userCircleData}
			/>
			<DepositStatus
				id={id}
				status={status}
				circle={circle}
				userCircleData={userCircleData}
			/>
		</div>
	);
};

export default StackedStatus;
