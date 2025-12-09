"use client";

import {
	ReactElement,
	type ReactNode,
	createContext,
	useContext,
	useState,
} from "react";

export type TModalStatus = "loading" | "success" | "error";

export type DepositInitModalState = {
	type: "DEPOSIT_INIT";
	amount: number;
};

export type DepositLoadingModalState = {
	type: "DEPOSIT_LOADING";
	// amount: number;
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
