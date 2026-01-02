import React, { useState } from "react";
import LocalLiftedButton from "./lifted-button";
import { HandWithdrawIcon } from "@phosphor-icons/react";
import { useModal } from "./modal/context";
import { sleep } from "@/utils/sleep";
import { useWriteContract } from "wagmi";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "./providers/web3";

const ClaimButton = ({
	amount,
	circleId,
}: {
	amount: number;
	circleId: bigint;
}) => {
	const { setModal } = useModal();
	const [claiming, setClaiming] = useState(false);
	const writeContract = useWriteContract();

	const claim = async () => {
		if (claiming) return;

		setClaiming(true);

		setModal({ type: "CLAIM_LOADING" });

		try {
			const hash = await writeContract.writeContractAsync({
				address: SAVING_CIRCLES_CONTRACT_ADDRESS,
				abi: savingCirclesAbi,
				functionName: "withdraw",
				args: [circleId],
			});

			await waitForTransactionReceipt(wagmiConfig, {
				hash,
			});

			setModal({ type: "CLAIM_RESULT", result: "success", amount });
		} catch (error) {
			console.log("__ ERROR __", error);
			setModal({ type: "CLAIM_RESULT", result: "error", msg: "Unknown" });
		}
	};

	return (
		<LocalLiftedButton
			className="font-bold"
			width="full"
			preset="stroke"
			leftIcon={<HandWithdrawIcon />}
			onClick={claim}
		>
			Claim {amount} BREAD
		</LocalLiftedButton>
	);
};

export default ClaimButton;
