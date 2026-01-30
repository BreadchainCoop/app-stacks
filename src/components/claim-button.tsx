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
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Address } from "viem";
import { formatBalance } from "@breadcoop/ui";

const ClaimButton = ({
	amount,
	circleId,
	label,
	className,
	nextDeposit,
	roundsLeft,
	nextDepositAddress,
}: {
	amount: number;
	circleId: bigint;
	label?: string;
	className?: string;
	nextDeposit: bigint;
	roundsLeft: bigint;
	nextDepositAddress: Address
}) => {
	const queryClient = useQueryClient();
	const { setModal } = useModal();
	const [claiming, setClaiming] = useState(false);
	const writeContract = useWriteContract();

	console.log({nextDeposit, roundsLeft, nextDepositAddress})

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

			queryClient.invalidateQueries({ queryKey: ["readContract"] });

			setModal({
				type: "CLAIM_RESULT",
				result: "success",
				amount,
				nextDeposit,
				roundsLeft,
				nextDepositAddress,
				circleId,
			});
		} catch (error) {
			console.log("__ ERROR __", error);
			setModal({ type: "CLAIM_RESULT", result: "error", msg: "Unknown" });
		}
	};

	return (
		<LocalLiftedButton
			className={cn("font-bold", className)}
			width="full"
			preset="stroke"
			leftIcon={<HandWithdrawIcon />}
			onClick={claim}
		>
			{label || `Claim ${formatBalance(amount, 2)} BREAD`}
		</LocalLiftedButton>
	);
};

export default ClaimButton;
