"use client";
import * as Dialog from "@radix-ui/react-dialog";

import { useModal } from "./context";
import { forwardRef, Ref, useEffect, useState } from "react";
import DepositInitModal from "./modals/deposit-init";
import DepositResult from "./modals/deposit-result";
import ClaimModal from "./modals/claim";
import StackInitModal from "./modals/stack-init";
import { StackSuccessResultModal } from "./modals/stack-result";

const ModalPresenter = () => {
	const { modalState, setModal } = useModal();

	return (
		<Dialog.Root open={!!modalState} onOpenChange={() => setModal(null)}>
			<Dialog.Portal forceMount>
				{modalState && (
					<>
						<Dialog.Overlay forceMount asChild>
							<ModalOverlay />
						</Dialog.Overlay>
						<Dialog.Content forceMount>
							{modalState.type === "STACK_CREATION_INIT" && (
								<StackInitModal modalState={modalState} />
							)}
							{modalState.type === "STACK_CREATION_SUCCESS" && (
								<StackSuccessResultModal
									modalState={modalState}
								/>
							)}
							{modalState.type === "DEPOSIT_INIT" && (
								<DepositInitModal modalState={modalState} />
							)}
							{(modalState.type === "DEPOSIT_RESULT" ||
								modalState.type === "DEPOSIT_LOADING") && (
								<DepositResult modalState={modalState} />
							)}
							{(modalState.type === "CLAIM_LOADING" ||
								modalState.type === "CLAIM_RESULT") && (
								<ClaimModal modalState={modalState} />
							)}
						</Dialog.Content>
					</>
				)}
			</Dialog.Portal>
		</Dialog.Root>
	);
};

const ModalOverlay = forwardRef((props, ref: Ref<HTMLDivElement>) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(true);
	}, []);

	return (
		<div ref={ref} {...props}>
			<div
				className={`z-40 fixed top-0 bg-[#F0F0F0] dark:bg-neutral-900 h-screen w-screen
					transition-opacity duration-200 
					${isVisible ? "opacity-90 dark:opacity-70" : "opacity-0"}`}
			/>
		</div>
	);
});

export default ModalPresenter;
