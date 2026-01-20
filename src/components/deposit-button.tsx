"use client";

import { LiftedButton, LiftedButtonProps } from "@breadcoop/ui";
import { useModal } from "./modal/context";
import { localButtonClassNames } from "./lifted-button";
import {
	useAccount,
	useReadContract,
	useSimulateContract,
	useWriteContract,
} from "wagmi";
import { Address, erc20Abi } from "viem";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { useMemo, useState } from "react";
import { waitForTransactionReceipt } from "@wagmi/core";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { wagmiConfig } from "./providers/web3";
import { getDefaultChainId } from "@/utils/chain";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/app/loading";
import { MAX_UINT256 } from "@/utils/solidity";

interface DepositButtonProps extends Omit<LiftedButtonProps, "children"> {
	label?: string;
	amount: bigint;
	tokenAddress: Address;
	circleId: bigint;
}

const DepositButton = ({
	label = "Pay Deposit",
	className = "",
	amount,
	tokenAddress,
	circleId,
	...props
}: DepositButtonProps) => {
	const [depositing, setDepositing] = useState(false);
	const queryClient = useQueryClient();
	const { address: userAddress } = useAccount();
	const modal = useModal();
	const allClassName = `${className} ${
		!props.preset || props.preset === "primary"
			? localButtonClassNames.primary
			: ""
	}`;

	const { data: allowance = BigInt(0) } = useReadContract({
		address: tokenAddress,
		abi: erc20Abi,
		functionName: "allowance",
		args: [userAddress!, SAVING_CIRCLES_CONTRACT_ADDRESS],
		query: { enabled: !!userAddress },
		chainId: getDefaultChainId(),
	});

	const needsApproval = useMemo(() => {
		if (!userAddress) return false;
		return allowance < amount;
	}, [allowance, amount, userAddress]);

	const { data: approveConfig } = useSimulateContract({
		address: tokenAddress,
		abi: erc20Abi,
		functionName: "approve",
		args: [SAVING_CIRCLES_CONTRACT_ADDRESS, MAX_UINT256],
		query: { enabled: needsApproval && !!userAddress },
	});

	const { writeContractAsync: writeApprove } = useWriteContract();
	const { writeContractAsync: writeDeposit } = useWriteContract();

	const deposit = async () => {
		if (depositing) return;

		modal.setModal({ type: "DEPOSIT_LOADING" });
		setDepositing(true);

		try {
			if (needsApproval) {
				const approveHash = await writeApprove({
					...approveConfig!.request,
				});

				console.log({ approveHash });

				const approveReceipt = await waitForTransactionReceipt(
					wagmiConfig,
					{
						hash: approveHash,
					},
				);

				console.log({ approveReceipt });
			}

			const depositHash = await writeDeposit({
				address: SAVING_CIRCLES_CONTRACT_ADDRESS,
				abi: savingCirclesAbi,
				functionName: "deposit",
				args: [circleId, amount],
			});

			await waitForTransactionReceipt(wagmiConfig, { hash: depositHash });

			queryClient.invalidateQueries({ queryKey: ["readContract"] });

			modal.setModal({ type: "DEPOSIT_RESULT", result: "success" });
		} catch (error) {
			console.log("__ ERROR __", error);
			modal.setModal({
				type: "DEPOSIT_RESULT",
				result: "error",
				msg: "Transaction failed. You don't have enough BREAD.",
			});
		} finally {
			setDepositing(false);
		}
	};

	return (
		<LiftedButton
			{...props}
			onClick={deposit}
			className={allClassName}
			leftIcon={depositing ? undefined : props.leftIcon}
			rightIcon={depositing ? undefined : props.rightIcon}
		>
			{depositing ? (
				<span className="flex items-center justify-center">
					<Loading />
				</span>
			) : (
				label
			)}
		</LiftedButton>
	);
};

export default DepositButton;
