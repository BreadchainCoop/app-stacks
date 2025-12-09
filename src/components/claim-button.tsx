import React from "react";
import LocalLiftedButton from "./lifted-button";
import { HandWithdrawIcon } from "@phosphor-icons/react";
import { useModal } from "./modal/context";
import { sleep } from "@/utils/sleep";

const ClaimButton = ({ amount }: { amount: number }) => {
	const { setModal } = useModal();
	const claim = async () => {
		setModal({ type: "CLAIM_LOADING" });

		await sleep(2000);

		try {
			throw Error();
			setModal({ type: "CLAIM_RESULT", result: "success", amount });
		} catch (error) {
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
