"use client";

import { useUserCirclesList } from "@/hooks/use-user-circles-list";
import { FormattedDecimalNumber, NavAccountWidgetItem } from "@breadcoop/ui";
import { HandArrowDownIcon } from "@phosphor-icons/react";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";

const ClaimableWidget = () => {
	const { address } = useAccount();
	const { circles } = useUserCirclesList(address ?? zeroAddress);

	let withdrawableAmount = 0;
	circles.forEach((circle) => {
		if (circle.canWithdraw && circle.withdrawAmount) {
			withdrawableAmount += circle.withdrawAmount;
		}
	});

	return (
		<>
			<NavAccountWidgetItem
				I={HandArrowDownIcon}
				label="Claimable"
				appIconColor="text-primary-blue"
			>
				<FormattedDecimalNumber
					className="text-[#EA5817]"
					value={withdrawableAmount}
					withBreadIcon
				/>
			</NavAccountWidgetItem>
		</>
	);
};

export default ClaimableWidget;
