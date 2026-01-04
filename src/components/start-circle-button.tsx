"use client";

import { LiftedButtonProps } from "@breadcoop/ui";
import { Address, formatEther } from "viem";
import LocalLiftedButton from "./lifted-button";
import { useState } from "react";
import { useWriteContract } from "wagmi";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "./providers/web3";

interface StartCircleButtonProps extends Omit<LiftedButtonProps, "children"> {
	amount: bigint;
	circleId: bigint;
}

const StartCircleButton = ({
	amount,
	circleId,
	...props
}: StartCircleButtonProps) => {
	const contract = useWriteContract();
	const [starting, setStarting] = useState(false);

	const start = async () => {
		if (starting) return;

		setStarting(true);

		try {
			const hash = await contract.writeContractAsync({
				address: SAVING_CIRCLES_CONTRACT_ADDRESS,
				abi: savingCirclesAbi,
				functionName: "start",
				args: [BigInt(circleId)],
			});

			await waitForTransactionReceipt(wagmiConfig, { hash });

			console.log("__ CIRCLE STARTED HASH __", hash);
		} catch (error) {
			console.log("___ START CIRCLE ERROR ___", error);
		} finally {
			setStarting(false);
		}
	};

	return (
		<LocalLiftedButton
			{...props}
			onClick={start}
			className={`${props.className || ""} font-semibold`}
		>
			Start Stacks - {formatEther(amount)} BREAD
		</LocalLiftedButton>
	);
};

export default StartCircleButton;
