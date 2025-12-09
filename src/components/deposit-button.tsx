"use client";

import { LiftedButton, LiftedButtonProps } from "@breadcoop/ui";
import { useModal } from "./modal/context";
import { localButtonClassNames } from "./lifted-button";
import { sleep } from "@/utils/sleep";

interface DepositButtonProps extends Omit<LiftedButtonProps, "children"> {
	label?: string;
}

const DepositButton = ({
	label = "Pay Deposit",
	className = "",
	...props
}: DepositButtonProps) => {
	const modal = useModal();
	const allClassName = `${className} ${
		!props.preset || props.preset === "primary"
			? localButtonClassNames.primary
			: ""
	}`;

	const deposit = async () => {
		try {
			modal.setModal({ type: "DEPOSIT_LOADING" });
			await sleep(2000);
			modal.setModal({ type: "DEPOSIT_RESULT", result: "success" });
		} catch (error) {
			modal.setModal({
				type: "DEPOSIT_RESULT",
				result: "error",
				msg: "Transaction failed. You don't have enough BREAD.",
			});
		}
	};

	return (
		<LiftedButton {...props} onClick={deposit} className={allClassName}>
			{label}
		</LiftedButton>
	);
};

export default DepositButton;
