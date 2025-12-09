"use client";

import { LiftedButton } from "@breadcoop/ui";
import { ModalContainer, ModalHeader, ModalStatus } from "../components";
import { ClaimInitModalState, ClaimResultModalState } from "../context";

const ClaimModal = ({
	modalState,
}: {
	modalState: ClaimInitModalState | ClaimResultModalState;
}) => {
	let status: "loading" | "error" | "success" = "loading";
	let title = "";
	let msg = "";

	if (modalState.type === "CLAIM_LOADING") {
		status = "loading";
		title = "Claiming Deposit";
	} else {
		status = modalState.result;
		if (modalState.result === "error") {
			// status = "error";
			title = "Claim failed!";
			msg = "Something went wrong. Please try again!";
		} else {
			// status = "success";
			title = "Claim successful";
			msg = "Successfully unlocked!";
		}
	}

	return (
		<ModalContainer status={status}>
			<ModalHeader title={title} />
			<ModalStatus status={status} msg={msg} />
			{modalState.type !== "CLAIM_LOADING" &&
				modalState.result === "error" && (
					<LiftedButton width="full" preset="burn">
						Try Again
					</LiftedButton>
				)}
		</ModalContainer>
	);
};

export default ClaimModal;
