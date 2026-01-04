"use client";

import { type ReactNode, createContext, useContext, useState } from "react";
import { Address } from "viem";

export type TModalStatus = "loading" | "success" | "error";

export type StackInitModalState = {
	type: "STACK_CREATION_INIT";
	name: string;
	status: "awaiting" | "approved" | "successful";
};

export type StackInitSuccessModalState = {
	type: "STACK_CREATION_SUCCESS";
	// TODO: Create a circle interface and inherit from it
	circle: {
		name: string;
		id: string;
		duration: string;
		deposit: number;
		total: number;
		members: number;
	};
};

export type StackInitFailedModalState = {
	type: "STACK_CREATION_FAILED";
};

export type DepositInitModalState = {
	type: "DEPOSIT_INIT";
	amount: bigint;
	tokenAddress: Address;
	circleId: bigint;
};

export type DepositLoadingModalState = {
	type: "DEPOSIT_LOADING";
};

export type DepositResultModalState = {
	type: "DEPOSIT_RESULT";
	result: "success" | "error";
	msg?: string;
	amount?: number;
};

export type ClaimInitModalState = {
	type: "CLAIM_LOADING";
	msg?: string;
};

export type ClaimResultModalState = {
	type: "CLAIM_RESULT";
	result: "success" | "error";
	msg?: string;
	amount?: number;
};

export type ModalState =
	| DepositInitModalState
	| DepositLoadingModalState
	| DepositResultModalState
	| ClaimInitModalState
	| ClaimResultModalState
	| StackInitModalState
	| StackInitSuccessModalState
	| StackInitFailedModalState
	| null;

export type ModalContext = {
	modalState: ModalState;
	setModal: (modalState: ModalState) => void;
};

const ModalContext = createContext<ModalContext>({
	modalState: null,
	setModal() {},
});

function ModalProvider({ children }: { children: ReactNode }) {
	const [modalState, setModalState] = useState<ModalState>(null);

	function setModal(modalState: ModalState) {
		setModalState(modalState);
	}

	return (
		<ModalContext.Provider value={{ modalState, setModal }}>
			{children}
		</ModalContext.Provider>
	);
}

const useModal = () => {
	const context = useContext(ModalContext);
	if (context === undefined) {
		throw new Error("useModal must be used within a ModalProvider");
	}
	return context;
};

export { ModalProvider, useModal };
